import { afterEach, describe, expect, jest, test } from '@jest/globals'
import { softwareBlindDecodeFallback } from '../../src/compat/ie/blind-decode'
import { applyBlindDecodeComposite, registerBlindDecodeFallback } from '../../src/core/blind-decode'

const createCompositeContext = (supportedOperation: string | undefined) => {
  let currentOperation = 'source-over'
  const fillRect = jest.fn()
  const ctx = {
    get globalCompositeOperation() {
      return currentOperation
    },
    set globalCompositeOperation(value: string) {
      if (value === 'source-over' || value === supportedOperation) {
        currentOperation = value
      }
    },
    fillStyle: '#000',
    fillRect,
  } as unknown as CanvasRenderingContext2D

  return { ctx, fillRect }
}

const createGrayscaleCanvas = (values: number[]) => {
  const canvas = document.createElement('canvas')
  canvas.width = values.length
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('get context error')
  }
  const imageData = ctx.createImageData(values.length, 1)
  values.forEach((value, index) => {
    const offset = index * 4
    imageData.data[offset] = value
    imageData.data[offset + 1] = value
    imageData.data[offset + 2] = value
    imageData.data[offset + 3] = 255
  })
  ctx.putImageData(imageData, 0, 0)
  return ctx
}

const createRgbaCanvas = (pixels: number[]) => {
  const canvas = document.createElement('canvas')
  canvas.width = pixels.length / 4
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('get context error')
  }
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  pixels.forEach((value, index) => {
    imageData.data[index] = value
  })
  ctx.putImageData(imageData, 0, 0)
  return ctx
}

const getPixels = (ctx: CanvasRenderingContext2D) => {
  return Array.from(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data)
}

const getMaxPixelDifference = (actual: number[], expected: number[]) => {
  return actual.reduce((result, value, index) => {
    return Math.max(result, Math.abs(value - expected[index]))
  }, 0)
}

afterEach(() => {
  registerBlindDecodeFallback()
})

describe('blind decode composite', () => {
  test('uses the native composite operation when supported', () => {
    const { ctx, fillRect } = createCompositeContext('overlay')
    const fallback = jest.fn()
    registerBlindDecodeFallback(fallback)

    applyBlindDecodeComposite({
      ctx,
      width: 20,
      height: 10,
      fillColor: '#000',
      compositeOperation: 'overlay',
      compositeTimes: 3,
    })

    expect(fallback).not.toHaveBeenCalled()
    expect(fillRect).toHaveBeenCalledTimes(3)
    expect(fillRect).toHaveBeenLastCalledWith(0, 0, 20, 10)
  })

  test('uses the registered fallback before drawing with an unsupported operation', () => {
    const { ctx, fillRect } = createCompositeContext(undefined)
    const fallback = jest.fn()
    registerBlindDecodeFallback(fallback)

    applyBlindDecodeComposite({
      ctx,
      width: 20,
      height: 10,
      fillColor: '#000',
      compositeOperation: 'overlay',
      compositeTimes: 6,
    })

    expect(fillRect).not.toHaveBeenCalled()
    expect(ctx.globalCompositeOperation).toBe('source-over')
    expect(fallback).toHaveBeenCalledWith({
      ctx,
      fillColor: '#000',
      compositeOperation: 'overlay',
      compositeTimes: 6,
    })
  })

  test('preserves the existing behavior when no fallback is registered', () => {
    const { ctx, fillRect } = createCompositeContext(undefined)

    applyBlindDecodeComposite({
      ctx,
      width: 20,
      height: 10,
      fillColor: '#000',
      compositeOperation: 'overlay',
      compositeTimes: 2,
    })

    expect(fillRect).toHaveBeenCalledTimes(2)
  })
})

describe('IE blind decode fallback', () => {
  test.each([
    ['overlay', '#000', 6],
    ['overlay', '#fff', 3],
    ['overlay', '#000', 12],
    ['color-burn', '#000', 3],
    ['color-burn', '#fff', 3],
  ])('matches native %s compositing', (compositeOperation, fillColor, compositeTimes) => {
    const values = []
    for (let value = 0; value <= 255; value++) {
      values.push(value)
    }
    const nativeContext = createGrayscaleCanvas(values)
    const fallbackContext = createGrayscaleCanvas(values)

    nativeContext.globalCompositeOperation = compositeOperation as GlobalCompositeOperation
    nativeContext.fillStyle = fillColor
    for (let i = 0; i < compositeTimes; i++) {
      nativeContext.fillRect(0, 0, nativeContext.canvas.width, nativeContext.canvas.height)
    }
    softwareBlindDecodeFallback({
      ctx: fallbackContext,
      fillColor,
      compositeOperation,
      compositeTimes,
    })

    expect(getPixels(fallbackContext)).toEqual(getPixels(nativeContext))
  })

  test.each([
    ['overlay', '#804020'],
    ['color-burn', '#808080'],
  ])('stays within rounding tolerance for %s with arbitrary colors', (compositeOperation, fillColor) => {
    const values = []
    for (let value = 0; value <= 255; value++) {
      values.push(value)
    }
    const nativeContext = createGrayscaleCanvas(values)
    const fallbackContext = createGrayscaleCanvas(values)

    nativeContext.globalCompositeOperation = compositeOperation as GlobalCompositeOperation
    nativeContext.fillStyle = fillColor
    for (let i = 0; i < 2; i++) {
      nativeContext.fillRect(0, 0, nativeContext.canvas.width, nativeContext.canvas.height)
    }
    softwareBlindDecodeFallback({
      ctx: fallbackContext,
      fillColor,
      compositeOperation,
      compositeTimes: 2,
    })

    expect(getMaxPixelDifference(getPixels(fallbackContext), getPixels(nativeContext))).toBeLessThanOrEqual(3)
  })

  test('rejects advanced operations that have no software implementation', () => {
    const ctx = createGrayscaleCanvas([0, 127, 255])

    expect(() => {
      softwareBlindDecodeFallback({
        ctx,
        fillColor: '#000',
        compositeOperation: 'difference',
        compositeTimes: 1,
      })
    }).toThrow('Unsupported blind watermark composite operation: difference')
  })

  test('matches native compositing for translucent images and fill colors', () => {
    const pixels = [0, 0, 0, 0, 255, 255, 255, 128, 64, 128, 192, 255, 200, 20, 100, 64]
    const nativeContext = createRgbaCanvas(pixels)
    const fallbackContext = createRgbaCanvas(pixels)
    const fillColor = 'rgba(32, 128, 240, 0.5)'

    nativeContext.globalCompositeOperation = 'overlay'
    nativeContext.fillStyle = fillColor
    for (let i = 0; i < 2; i++) {
      nativeContext.fillRect(0, 0, nativeContext.canvas.width, nativeContext.canvas.height)
    }
    softwareBlindDecodeFallback({
      ctx: fallbackContext,
      fillColor,
      compositeOperation: 'overlay',
      compositeTimes: 2,
    })

    const nativePixels = getPixels(nativeContext)
    const fallbackPixels = getPixels(fallbackContext)
    expect(getMaxPixelDifference(fallbackPixels, nativePixels)).toBeLessThanOrEqual(2)
  })
})
