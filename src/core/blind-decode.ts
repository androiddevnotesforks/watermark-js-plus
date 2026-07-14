interface BlindDecodeFallbackOptions {
  ctx: CanvasRenderingContext2D
  fillColor: string
  compositeOperation: string
  compositeTimes: number
}

interface BlindDecodeCompositeOptions extends BlindDecodeFallbackOptions {
  width: number
  height: number
}

type BlindDecodeFallback = (options: BlindDecodeFallbackOptions) => void

let blindDecodeFallback: BlindDecodeFallback | undefined

const registerBlindDecodeFallback = (fallback?: BlindDecodeFallback) => {
  blindDecodeFallback = fallback
}

const applyBlindDecodeComposite = ({
  ctx,
  width,
  height,
  fillColor,
  compositeOperation,
  compositeTimes,
}: BlindDecodeCompositeOptions) => {
  if (!(compositeTimes > 0)) {
    return
  }

  const previousCompositeOperation = ctx.globalCompositeOperation
  ctx.globalCompositeOperation = compositeOperation as GlobalCompositeOperation

  if (ctx.globalCompositeOperation !== compositeOperation && blindDecodeFallback) {
    ctx.globalCompositeOperation = previousCompositeOperation
    blindDecodeFallback({
      ctx,
      fillColor,
      compositeOperation,
      compositeTimes,
    })
    return
  }

  ctx.fillStyle = fillColor
  for (let i = 0; i < compositeTimes; i++) {
    ctx.fillRect(0, 0, width, height)
  }
}

export { applyBlindDecodeComposite, registerBlindDecodeFallback }
export type { BlindDecodeFallback, BlindDecodeFallbackOptions }
