---
layout: doc
description: 交互式调整水印参数，在页面中预览效果，并复制生成的初始化代码。
---
# 水印配置生成器

调整参数即可更新当前页面的水印效果，并复制自动生成的初始化代码。

**相关内容：** [Watermark 指南](/zh/guide/watermark) · [Watermark 配置项](/zh/config/) · [Watermark 方法](/zh/config/function)

<script setup lang="ts">
import { reactive } from 'vue';
import WatermarkOptionsForm from '../../.vitepress/components/WatermarkOptionsForm.vue';
// import { cloneDeep } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { useAppStore } from '../../.vitepress/stores/app';

const appStore = useAppStore();
const initialWatermarkOptions = {
  width: 300,
  height: 300,
  rotate: 45
};

let outputWatermarkOptions = reactive(
  cloneDeep(initialWatermarkOptions)
)

const handleAddWatermark = () => {
  appStore.createWatermark(outputWatermarkOptions)
};
const handleRemoveWatermark = () => {
  appStore.removeWatermark()
};
const handleChangeOptions = (options) => {
  Object.keys(outputWatermarkOptions).forEach(key => {
    delete outputWatermarkOptions[key]
  })
  outputWatermarkOptions = Object.assign(outputWatermarkOptions, options)
  appStore.changeWatermark(options);
};
</script>

<ClientOnly>
  <WatermarkOptionsForm
    :options="initialWatermarkOptions"
    @change="handleChangeOptions"
  />
</ClientOnly>

```js-vue
import { Watermark } from 'watermark-js-plus' // import watermark plugin

const watermark = new Watermark({{ outputWatermarkOptions }})

watermark.create() // add watermark

watermark.destroy() // remove watermark
```

<el-affix position="bottom" :offset="0">
  <el-space class="block-operation">
    <el-button round type="primary" @click="handleAddWatermark">添加水印</el-button>
    <el-button round type="danger" @click="handleRemoveWatermark">删除水印</el-button>
  </el-space>
</el-affix>

<el-backtop></el-backtop>
