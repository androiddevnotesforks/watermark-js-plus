(function () {
  'use strict'

  var config = window.IE_BLIND_WATERMARK_TEST || {}
  var running = false

  function getElement(id) {
    return document.getElementById(id)
  }

  function setStatus(id, message, statusClass) {
    var element = getElement(id)
    element.className = 'status ' + statusClass
    element.innerHTML = message
  }

  function supportsCompositeOperation(operation) {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    var previous = ctx.globalCompositeOperation
    ctx.globalCompositeOperation = operation
    var supported = ctx.globalCompositeOperation === operation
    ctx.globalCompositeOperation = previous
    return supported
  }

  function drawTable(ctx, width) {
    var left = 36
    var top = 66
    var tableWidth = width - left * 2
    var columnWidth = tableWidth / 3
    var rowHeight = 58
    var row

    ctx.fillStyle = '#eef1f5'
    ctx.fillRect(left, top, tableWidth, rowHeight)
    ctx.strokeStyle = '#c8ced8'
    ctx.lineWidth = 1
    ctx.strokeRect(left, top, tableWidth, rowHeight * 5)

    for (row = 1; row < 5; row++) {
      ctx.beginPath()
      ctx.moveTo(left, top + rowHeight * row)
      ctx.lineTo(left + tableWidth, top + rowHeight * row)
      ctx.stroke()
    }

    for (row = 1; row < 3; row++) {
      ctx.beginPath()
      ctx.moveTo(left + columnWidth * row, top)
      ctx.lineTo(left + columnWidth * row, top + rowHeight * 5)
      ctx.stroke()
    }

    ctx.fillStyle = '#20242b'
    ctx.font = 'bold 17px Arial, Microsoft YaHei, sans-serif'
    ctx.fillText('姓名 / Name', left + 18, top + 35)
    ctx.fillText('薪资 / Salary', left + columnWidth + 18, top + 35)
    ctx.fillText('邮箱 / Email', left + columnWidth * 2 + 18, top + 35)

    ctx.font = '16px Arial, Microsoft YaHei, sans-serif'
    ctx.fillText('张三 / Zhang San', left + 18, top + rowHeight + 35)
    ctx.fillText('23000', left + columnWidth + 18, top + rowHeight + 35)
    ctx.fillText('zs@example.com', left + columnWidth * 2 + 18, top + rowHeight + 35)
    ctx.fillText('李四 / Li Si', left + 18, top + rowHeight * 2 + 35)
    ctx.fillText('25000', left + columnWidth + 18, top + rowHeight * 2 + 35)
    ctx.fillText('ls@example.com', left + columnWidth * 2 + 18, top + rowHeight * 2 + 35)
    ctx.fillText('王五 / Wang Wu', left + 18, top + rowHeight * 3 + 35)
    ctx.fillText('28000', left + columnWidth + 18, top + rowHeight * 3 + 35)
    ctx.fillText('ww@example.com', left + columnWidth * 2 + 18, top + rowHeight * 3 + 35)
    ctx.fillText('赵六 / Zhao Liu', left + 18, top + rowHeight * 4 + 35)
    ctx.fillText('31000', left + columnWidth + 18, top + rowHeight * 4 + 35)
    ctx.fillText('zl@example.com', left + columnWidth * 2 + 18, top + rowHeight * 4 + 35)
  }

  function drawBlindWatermark(ctx, width, height) {
    var x
    var y

    ctx.save()
    ctx.globalAlpha = 0.005
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 25px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (y = -80; y < height + 120; y += 105) {
      for (x = -120; x < width + 160; x += 260) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-22 * Math.PI / 180)
        ctx.fillText('ISSUE 1198 · IE11 BLIND', 0, 0)
        ctx.restore()
      }
    }
    ctx.restore()
  }

  function createSourceImage() {
    var canvas = getElement('sourceCanvas')
    var ctx = canvas.getContext('2d')
    var width = canvas.width
    var height = canvas.height

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#20242b'
    ctx.font = 'bold 23px Arial, Microsoft YaHei, sans-serif'
    ctx.fillText('IE11 暗水印解析离线测试', 36, 39)
    drawTable(ctx, width)

    ctx.fillStyle = '#f4f6f8'
    ctx.fillRect(36, 382, width - 72, 118)
    ctx.fillStyle = '#4d5562'
    ctx.font = '16px Arial, Microsoft YaHei, sans-serif'
    ctx.fillText('这块浅色区域中包含肉眼几乎不可见的暗水印。', 58, 422)
    ctx.fillText('解码参数：overlay + #000 + compositeTimes 6', 58, 455)
    ctx.fillText('水印文本：ISSUE 1198 · IE11 BLIND', 58, 488)

    drawBlindWatermark(ctx, width, height)
    return canvas.toDataURL('image/png')
  }

  function analyzeResult(imageBase64, callback) {
    var image = new Image()
    image.onload = function () {
      var canvas = document.createElement('canvas')
      var ctx
      var data
      var total = 0
      var count = 0
      var index

      canvas.width = image.naturalWidth || image.width
      canvas.height = image.naturalHeight || image.height
      ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

      for (index = 0; index < data.length; index += 64) {
        total += data[index] + data[index + 1] + data[index + 2]
        count++
      }
      callback(total / (count * 3))
    }
    image.onerror = function () {
      callback(-1)
    }
    image.src = imageBase64
  }

  function finishRun() {
    running = false
    getElement('runButton').disabled = false
  }

  function reportResult(averageBrightness, overlaySupported) {
    if (averageBrightness < 0) {
      setStatus('resultStatus', '无法读取解码结果图片。', 'status-fail')
      finishRun()
      return
    }

    getElement('brightnessValue').innerHTML = averageBrightness.toFixed(2)

    if (config.expectedResult === 'black') {
      if (averageBrightness < 5) {
        setStatus('resultStatus', '符合预期：结果接近纯黑，旧版问题已复现。', 'status-pass')
      } else if (overlaySupported) {
        setStatus('resultStatus', '当前浏览器原生支持 overlay，因此不会复现 IE11 专属问题。请在 IE11 中打开。', 'status-warn')
      } else {
        setStatus('resultStatus', '未得到预期的纯黑结果，请确认加载的是旧版 JS。', 'status-fail')
      }
    } else if (averageBrightness >= 5 && !overlaySupported) {
      setStatus('resultStatus', '符合预期：解码图片保留可见内容，IE 软件回退已生效。', 'status-pass')
    } else if (averageBrightness >= 5) {
      setStatus('resultStatus', '页面运行正常；当前浏览器原生支持 overlay。请在 IE11 中验证软件回退。', 'status-warn')
    } else {
      setStatus('resultStatus', '结果仍接近纯黑，修复未生效。请检查是否加载了新版本地 JS。', 'status-fail')
    }
    finishRun()
  }

  function runTest() {
    var overlaySupported
    var sourceUrl
    var timeoutId
    var completed = false

    if (running) {
      return
    }
    running = true
    getElement('runButton').disabled = true
    setStatus('resultStatus', '正在生成测试图并执行解码……', 'status-running')
    getElement('brightnessValue').innerHTML = '计算中'

    overlaySupported = supportsCompositeOperation('overlay')
    getElement('overlaySupport').innerHTML = overlaySupported ? '支持（读回 overlay）' : '不支持（赋值被忽略）'
    getElement('documentMode').innerHTML = document.documentMode || '非 IE / 未报告'
    getElement('userAgent').innerHTML = navigator.userAgent

    if (!window.WatermarkPlus || !window.WatermarkPlus.BlindWatermark) {
      setStatus('resultStatus', 'WatermarkPlus.BlindWatermark 未加载，请检查本地 JS 文件。', 'status-fail')
      finishRun()
      return
    }

    sourceUrl = createSourceImage()
    timeoutId = window.setTimeout(function () {
      if (!completed) {
        completed = true
        setStatus('resultStatus', '10 秒内未收到 onSuccess，请检查 IE 是否阻止了本地脚本。', 'status-fail')
        finishRun()
      }
    }, 10000)

    try {
      window.WatermarkPlus.BlindWatermark.decode({
        url: sourceUrl,
        fillColor: '#000',
        compositeOperation: 'overlay',
        compositeTimes: 6,
        onSuccess: function (imageBase64) {
          if (completed) {
            return
          }
          completed = true
          window.clearTimeout(timeoutId)
          getElement('resultImage').src = imageBase64
          analyzeResult(imageBase64, function (averageBrightness) {
            reportResult(averageBrightness, overlaySupported)
          })
        }
      })
    } catch (error) {
      completed = true
      window.clearTimeout(timeoutId)
      setStatus('resultStatus', '执行异常：' + (error.message || error), 'status-fail')
      finishRun()
    }
  }

  function initialize() {
    getElement('buildLabel').innerHTML = config.buildLabel || '未知构建'
    getElement('assetLabel').innerHTML = config.assetFile || '未知文件'
    getElement('expectedLabel').innerHTML = config.expectedLabel || ''
    getElement('runButton').onclick = runTest
    window.onerror = function (message, source, line) {
      setStatus('resultStatus', '页面脚本异常：' + message + '（第 ' + line + ' 行）', 'status-fail')
      finishRun()
      return false
    }
    runTest()
  }

  if (window.addEventListener) {
    window.addEventListener('load', initialize, false)
  } else {
    window.attachEvent('onload', initialize)
  }
})()
