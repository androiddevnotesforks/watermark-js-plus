import type { BlindDecodeFallback } from '../../core/blind-decode'

type BlendFunction = (backdrop: number, source: number) => number
type RGBColor = [number, number, number]

interface ParsedColor {
  color: RGBColor
  alpha: number
}

const MAX_CHANNEL_VALUE = 255

const overlay: BlendFunction = (backdrop, source) => {
  if (backdrop <= 0.5) {
    return 2 * backdrop * source
  }
  return 1 - 2 * (1 - backdrop) * (1 - source)
}

const colorBurn: BlendFunction = (backdrop, source) => {
  if (backdrop === 1) {
    return 1
  }
  if (source === 0) {
    return 0
  }
  return 1 - Math.min(1, (1 - backdrop) / source)
}

const getBlendFunction = (compositeOperation: string): BlendFunction => {
  switch (compositeOperation) {
    case 'overlay':
      return overlay
    case 'color-burn':
      return colorBurn
    default:
      throw new Error(`Unsupported blind watermark composite operation: ${compositeOperation}`)
  }
}

const parseNormalizedColor = (fillStyle: string): ParsedColor | undefined => {
  const hexColor = /^#([\da-f]{6})$/i.exec(fillStyle)
  if (hexColor) {
    return {
      color: [
        parseInt(hexColor[1].slice(0, 2), 16),
        parseInt(hexColor[1].slice(2, 4), 16),
        parseInt(hexColor[1].slice(4, 6), 16),
      ],
      alpha: 1,
    }
  }

  const rgbColor = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(fillStyle)
  if (rgbColor) {
    return {
      color: [Number(rgbColor[1]), Number(rgbColor[2]), Number(rgbColor[3])],
      alpha: rgbColor[4] === undefined ? 1 : Math.max(0, Math.min(1, Number(rgbColor[4]))),
    }
  }

  return undefined
}

const getFillColor = (ctx: CanvasRenderingContext2D, fillColor: string): ParsedColor => {
  const colorCanvas = (ctx.canvas.ownerDocument || document).createElement('canvas')
  colorCanvas.width = 1
  colorCanvas.height = 1
  const colorContext = colorCanvas.getContext('2d')
  if (!colorContext) {
    throw new Error('get context error')
  }
  colorContext.fillStyle = fillColor
  if (typeof colorContext.fillStyle === 'string') {
    const parsedColor = parseNormalizedColor(colorContext.fillStyle)
    if (parsedColor) {
      return parsedColor
    }
  }
  colorContext.fillRect(0, 0, 1, 1)
  const color = colorContext.getImageData(0, 0, 1, 1).data
  return {
    color: [color[0], color[1], color[2]],
    alpha: color[3] / MAX_CHANNEL_VALUE,
  }
}

const isOpaque = (data: Uint8ClampedArray): boolean => {
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== MAX_CHANNEL_VALUE) {
      return false
    }
  }
  return true
}

const applyCommonOpaqueBlend = (
  data: Uint8ClampedArray,
  sourceColor: RGBColor,
  compositeOperation: string,
  compositeTimes: number,
): boolean => {
  const isBlack = sourceColor[0] === 0 && sourceColor[1] === 0 && sourceColor[2] === 0
  const isWhite = sourceColor[0] === 1 && sourceColor[1] === 1 && sourceColor[2] === 1

  if (compositeOperation === 'color-burn' && (isBlack || isWhite)) {
    if (isBlack) {
      for (let offset = 0; offset < data.length; offset += 4) {
        for (let channel = 0; channel < 3; channel++) {
          data[offset + channel] = data[offset + channel] === MAX_CHANNEL_VALUE ? MAX_CHANNEL_VALUE : 0
        }
      }
    }
    return true
  }

  if (compositeOperation !== 'overlay' || (!isBlack && !isWhite)) {
    return false
  }

  const iterations = Math.ceil(compositeTimes)
  const multiplier = Math.pow(2, Math.min(iterations, 8))
  for (let offset = 0; offset < data.length; offset += 4) {
    for (let channel = 0; channel < 3; channel++) {
      const value = data[offset + channel]
      data[offset + channel] = isBlack
        ? Math.max(0, multiplier * value - MAX_CHANNEL_VALUE * (multiplier - 1))
        : Math.min(MAX_CHANNEL_VALUE, multiplier * value)
    }
  }
  return true
}

const applyOpaqueBlend = (
  data: Uint8ClampedArray,
  sourceColor: RGBColor,
  compositeTimes: number,
  blend: BlendFunction,
) => {
  for (let i = 0; i < compositeTimes; i++) {
    for (let offset = 0; offset < data.length; offset += 4) {
      for (let channel = 0; channel < 3; channel++) {
        data[offset + channel] =
          blend(data[offset + channel] / MAX_CHANNEL_VALUE, sourceColor[channel]) * MAX_CHANNEL_VALUE
      }
    }
  }
}

const applyAlphaBlend = (
  data: Uint8ClampedArray,
  sourceColor: RGBColor,
  sourceAlpha: number,
  compositeTimes: number,
  blend: BlendFunction,
) => {
  for (let i = 0; i < compositeTimes; i++) {
    for (let offset = 0; offset < data.length; offset += 4) {
      const backdropAlpha = data[offset + 3] / MAX_CHANNEL_VALUE
      const outputAlpha = sourceAlpha + backdropAlpha * (1 - sourceAlpha)

      for (let channel = 0; channel < 3; channel++) {
        const backdrop = data[offset + channel] / MAX_CHANNEL_VALUE
        const blendedSource =
          (1 - backdropAlpha) * sourceColor[channel] + backdropAlpha * blend(backdrop, sourceColor[channel])
        const premultipliedOutput = sourceAlpha * blendedSource + backdropAlpha * (1 - sourceAlpha) * backdrop
        data[offset + channel] = outputAlpha === 0 ? 0 : (premultipliedOutput / outputAlpha) * MAX_CHANNEL_VALUE
      }

      data[offset + 3] = outputAlpha * MAX_CHANNEL_VALUE
    }
  }
}

const softwareBlindDecodeFallback: BlindDecodeFallback = ({ ctx, fillColor, compositeOperation, compositeTimes }) => {
  const blend = getBlendFunction(compositeOperation)
  const { color, alpha } = getFillColor(ctx, fillColor)
  if (alpha === 0 || !(compositeTimes > 0)) {
    return
  }

  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  const sourceColor: RGBColor = [
    color[0] / MAX_CHANNEL_VALUE,
    color[1] / MAX_CHANNEL_VALUE,
    color[2] / MAX_CHANNEL_VALUE,
  ]

  if (alpha === 1 && isOpaque(imageData.data)) {
    if (!applyCommonOpaqueBlend(imageData.data, sourceColor, compositeOperation, compositeTimes)) {
      applyOpaqueBlend(imageData.data, sourceColor, compositeTimes, blend)
    }
  } else {
    applyAlphaBlend(imageData.data, sourceColor, alpha, compositeTimes, blend)
  }

  ctx.putImageData(imageData, 0, 0)
}

export { softwareBlindDecodeFallback }
