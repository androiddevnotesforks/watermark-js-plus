# Issue #1198 IE11 离线测试包

整个目录可以直接复制到不联网的 Windows 机器，不需要安装 Node.js，也不需要启动服务器。

## 测试步骤

1. 保持目录结构不变，将 `issue-1198-ie11` 整个目录复制到 Windows。
2. 用 Internet Explorer 11 打开 `old-version.html`。
3. 如果 IE 提示限制本地脚本，点击“允许阻止的内容”。
4. 旧版页面应报告“结果接近纯黑，旧版问题已复现”。
5. 再打开 `new-version.html`。
6. 新版页面应显示 `overlay` 不受支持，但报告“解码图片保留可见内容，IE 软件回退已生效”。

两个页面都会自动生成同一张含暗水印的 Canvas 图片，然后使用：

```js
BlindWatermark.decode({
  compositeOperation: 'overlay',
  compositeTimes: 6,
  fillColor: '#000'
})
```

## 本地资源

- `assets/watermark-js-plus-1.5.7-ie.iife.min.js`：npm 发布的旧版 1.5.7 IE IIFE。
- `assets/watermark-js-plus-current-ie.iife.min.js`：当前工作区构建出的修复版 IE IIFE。
- `assets/test-harness.js`：兼容 IE11 的 ES5 测试脚本。

HTML 和 JavaScript 均使用相对本地路径，不包含 CDN 或运行时网络请求。
