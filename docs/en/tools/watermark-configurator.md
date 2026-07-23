---
layout: doc
description: Configure a watermark interactively, preview changes on the page, and copy the generated initialization code.
---

<el-backtop></el-backtop>

# Watermark Configurator

Adjust the options to update the watermark on this page, then copy the generated initialization code.

**Related:** [Watermark guide](/guide/watermark) · [Watermark options](/config/) · [Watermark methods](/config/function)

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
    <el-button round type="primary" @click="handleAddWatermark">Add Watermark</el-button>
    <el-button round type="danger" @click="handleRemoveWatermark">Remove Watermark</el-button>
  </el-space>
</el-affix>
