import type { ChangeOptionsMode, DecodeBlindWatermarkOptions, WatermarkOptions } from '../types'
import { convertImage, isFunction } from '../utils'
import { Watermark } from './watermark'
import { WatermarkCanvas } from './canvas'
import { applyBlindDecodeComposite } from './blind-decode'
import protection from '../utils/protection'

/**
 * BlindWatermark class
 */
class BlindWatermark extends Watermark {
  /**
   * BlindWatermark constructor
   * @param props - blind watermark options
   */
  constructor(props: Partial<WatermarkOptions> = {}) {
    const defaultProps: Partial<WatermarkOptions> = {
      globalAlpha: 0.005,
      mode: 'blind',
    }
    super({ ...props, ...defaultProps })
  }

  async changeOptions(
    args: Partial<WatermarkOptions> = {},
    mode: ChangeOptionsMode = 'overwrite',
    redraw: boolean = true,
  ) {
    args.globalAlpha = 0.005
    args.mode = 'blind'
    this.initConfigData(args, mode)
    protection(this.options.monitorProtection)
    if (redraw) {
      this.remove()
      await this.create()
    }
  }

  /**
   * Decode blind watermark.
   * @param props - decode options
   */
  static decode(props: Partial<DecodeBlindWatermarkOptions>) {
    const {
      url = '',
      fillColor = '#000',
      compositeOperation = 'color-burn',
      mode = 'canvas',
      compositeTimes = 3,
      onSuccess,
    } = props
    if (!url) {
      return
    }
    if (mode === 'canvas') {
      const img = new Image()
      img.src = url
      img.addEventListener('load', () => {
        const { width, height } = img
        const canvas = WatermarkCanvas.createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('get context error')
        }
        ctx.drawImage(img, 0, 0, width, height)
        applyBlindDecodeComposite({
          ctx,
          width,
          height,
          fillColor,
          compositeOperation,
          compositeTimes,
        })
        const resultImage = convertImage(canvas)
        if (isFunction(<Function>onSuccess)) {
          onSuccess?.(resultImage)
        }
      })
    }
  }
}

export { BlindWatermark }
