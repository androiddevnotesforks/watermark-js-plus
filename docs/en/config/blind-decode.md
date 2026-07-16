---
layout: doc
description: Configure BlindWatermark.decode to enhance and reveal a blind watermark contained in a screenshot or image.
---

<el-backtop></el-backtop>

# Blind Watermark Decoding

## url
- **Type**: `string`
- **Default**: `''`
- **Description**: Path to the image requiring decoding (URL or base64)

## mode
- **Type**: `'canvas' | 'html' | 'svg'`
- **Default**: `'canvas'`
- **Supported Value**: `'canvas'`
- **Description**: Only canvas decoding is implemented. The typed `'html'` and `'svg'` values currently perform no decoding.

## fillColor
- **Type**: `string`
- **Default**: `'#000'`
- **Description**: Fill color used during decoding, affects final decoding result

## compositeOperation
- **Type**: `string`
- **Default**: `'color-burn'`
- **Description**: Image composite operation used to enhance watermark visibility. The IE entry provides a software fallback for `'color-burn'` and `'overlay'` when the browser does not support them.

## compositeTimes
- **Type**: `number`
- **Default**: `3`
- **Description**: Number of composite operation repetitions - more repetitions make watermark more visible

## onSuccess
- **Type**: `Function`
- **Default**: `undefined`
- **Description**: Callback after successful decoding; its parameter is the processed PNG Data URL.

## Decoding Principle
Blind watermark decoding works through these steps:
1. Load image containing blind watermark
2. Create canvas and draw original image
3. Apply specified composite operation and fill color
4. Repeat composite operation multiple times to enhance watermark visibility
5. Output processed image

## Usage Example
```javascript
BlindWatermark.decode({
  url: 'image-with-watermark.png',
  fillColor: '#000',
  compositeOperation: 'color-burn',
  onSuccess: (decodedImage) => {
    // Handle decoded image
  }
})
```
