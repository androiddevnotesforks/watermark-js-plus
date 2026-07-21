<template>
  <div>
    <el-descriptions :title="t('Basic', '基础')" :column="2" border>
      <el-descriptions-item :label="t('Width', '宽度')">
        <el-input-number v-model="form.data.width" :min="1" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Height', '高度')">
        <el-input-number v-model="form.data.height" :min="1" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Rotate', '旋转角度')">
        <el-input-number v-model="form.data.rotate" :max="360" @input="handleChange" />
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :title="t('Content', '内容')" :column="2" border>
      <el-descriptions-item :label="t('Content Type', '内容类型')" :span="2">
        <el-select v-model="form.data.contentType" :placeholder="t('Select a content type', '请选择内容类型')" @change="handleChange">
          <el-option label="text" value="text" />
          <el-option label="multi-line-text" value="multi-line-text" />
          <el-option label="image" value="image" />
          <el-option label="rich-text" value="rich-text" />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item :label="t('Content', '内容')" :span="2">
        <el-input v-model="form.data.content" :rows="3" type="textarea" :placeholder="t('Enter watermark content', '请输入水印内容')" @input="handleChange" />
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :title="t('Position', '定位')" :column="2" border>
      <template #title>
        <el-checkbox v-model="form.position.enabled" @change="handleChangePositionEnabled">{{ t('Position', '定位') }}</el-checkbox>
      </template>
      <el-descriptions-item :label="t('Translate Placement', '水印位置')" :span="2">
        <el-select v-model="form.data.translatePlacement" :disabled="!form.position.enabled" :placeholder="t('Select a placement', '请选择水印位置')" @change="handleChange">
          <el-option label="middle" value="middle" />
          <el-option label="top" value="top" />
          <el-option label="top-start" value="top-start" />
          <el-option label="top-end" value="top-end" />
          <el-option label="bottom" value="bottom" />
          <el-option label="bottom-start" value="bottom-start" />
          <el-option label="bottom-end" value="bottom-end" />
          <el-option label="left" value="left" />
          <el-option label="right" value="right" />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item :label="t('Translate X', '水平偏移')">
        <el-input-number v-model="form.data.translateX" :disabled="!form.position.enabled" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Translate Y', '垂直偏移')">
        <el-input-number v-model="form.data.translateY" :disabled="!form.position.enabled" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Background Position', '背景位置')">
        <el-input v-model="form.data.backgroundPosition" :disabled="!form.position.enabled" :placeholder="t('Enter a background position', '请输入背景位置')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Background Repeat', '背景重复')">
        <el-select v-model="form.data.backgroundRepeat" :disabled="!form.position.enabled" :placeholder="t('Select a repeat mode', '请选择背景重复方式')" @change="handleChange">
          <el-option label="repeat" value="repeat" />
          <el-option label="repeat-x" value="repeat-x" />
          <el-option label="repeat-y" value="repeat-y" />
          <el-option label="no-repeat" value="no-repeat" />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item :label="t('Parent', '父元素')">
        <el-input v-model="form.data.parent" :disabled="!form.position.enabled" :placeholder="t('Enter a parent selector', '请输入父元素选择器')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item label="z-index">
        <el-input-number v-model="form.data.zIndex" :disabled="!form.position.enabled" @input="handleChange" />
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :title="t('Rich Text', '富文本')" :column="2" border>
      <template #title>
        <el-checkbox v-model="form.richText.enabled" @change="handleChangeRichTextEnabled">{{ t('Rich Text', '富文本') }}</el-checkbox>
      </template>
      <el-descriptions-item :label="t('Rich Text Width', '富文本宽度')">
        <el-input-number v-model="form.data.richTextWidth" :disabled="!form.richText.enabled" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Rich Text Height', '富文本高度')">
        <el-input-number v-model="form.data.richTextHeight" :disabled="!form.richText.enabled" @input="handleChange" />
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :title="t('Image', '图片')" :column="2" border>
      <template #title>
        <el-checkbox v-model="form.image.enabled" @change="handleChangeImageEnabled">{{ t('Image', '图片') }}</el-checkbox>
      </template>
      <el-descriptions-item :label="t('Image', '图片')" :span="2">
        <el-upload
          ref="uploadImage"
          list-type="picture-card"
          accept="image/*"
          :auto-upload="false"
          :limit="1"
          :show-file-list="true"
          :on-exceed="handleExceedImage"
          :on-change="handleChangeImage"
          :disabled="!form.image.enabled"
          class="upload-image"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-descriptions-item>
      <el-descriptions-item :label="t('Image Width', '图片宽度')">
        <el-input-number v-model="form.data.imageWidth" :disabled="!form.image.enabled" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Image Height', '图片高度')">
        <el-input-number v-model="form.data.imageHeight" :disabled="!form.image.enabled" @input="handleChange" />
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :title="t('Style', '样式')" :column="2" border>
      <template #title>
        <el-checkbox v-model="form.style.enabled" @change="handleChangeStyleEnabled">{{ t('Style', '样式') }}</el-checkbox>
      </template>
      <el-descriptions-item :label="t('Global Alpha', '全局透明度')">
        <el-input-number v-model="form.data.globalAlpha" :disabled="!form.style.enabled" :max="1" :precision="2" :step="0.1" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Text Type', '文字绘制方式')">
        <el-select v-model="form.data.textType" :disabled="!form.style.enabled" :placeholder="t('Select a text type', '请选择文字绘制方式')" @change="handleChange">
          <el-option label="fill" value="fill" />
          <el-option label="stroke" value="stroke" />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item :label="t('Line Height', '行高')">
        <el-input-number v-model="form.data.lineHeight" :disabled="!form.style.enabled" @change="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Font Size', '字号')">
        <el-input v-model="form.data.fontSize" :disabled="!form.style.enabled" :placeholder="t('Enter a font size', '请输入字号')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Font Family', '字体')">
        <el-input v-model="form.data.fontFamily" :disabled="!form.style.enabled" :placeholder="t('Enter a font family', '请输入字体')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Font Style', '字体样式')">
        <el-input v-model="form.data.fontStyle" :disabled="!form.style.enabled" :placeholder="t('Enter a font style', '请输入字体样式')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Font Variant', '字体变体')">
        <el-input v-model="form.data.fontVariant" :disabled="!form.style.enabled" :placeholder="t('Enter a font variant', '请输入字体变体')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Font Color', '字体颜色')">
        <el-input v-model="form.data.fontColor" :disabled="!form.style.enabled" :placeholder="t('Enter a font color', '请输入字体颜色')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Font Weight', '字重')">
        <el-input v-model="form.data.fontWeight" :disabled="!form.style.enabled" :placeholder="t('Enter a font weight', '请输入字重')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Text Align', '文字对齐')">
        <el-select v-model="form.data.textAlign" :disabled="!form.style.enabled" :placeholder="t('Select text alignment', '请选择文字对齐方式')" @change="handleChange">
          <el-option label="center" value="center" />
          <el-option label="end" value="end" />
          <el-option label="left" value="left" />
          <el-option label="right" value="right" />
          <el-option label="start" value="start" />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item :label="t('Text Baseline', '文字基线')">
        <el-select v-model="form.data.textBaseline" :disabled="!form.style.enabled" :placeholder="t('Select a text baseline', '请选择文字基线')" @change="handleChange">
          <el-option label="alphabetic" value="alphabetic" />
          <el-option label="hanging" value="hanging" />
          <el-option label="ideographic" value="ideographic" />
          <el-option label="top" value="top" />
          <el-option label="bottom" value="bottom" />
          <el-option label="middle" value="middle" />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item :label="t('Filter', '滤镜')">
<!--        <el-input v-model="form.data.filter" :disabled="!form.style.enabled" placeholder="please input filter" @input="handleChange" />-->
        <el-select v-model="filterValue" :disabled="!form.style.enabled" multiple filterable allow-create :reserve-keyword="false" :placeholder="t('Enter or select filters', '输入或选择滤镜')" @change="handleFilterChange">
          <el-option v-for="item in filterOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item :label="t('Text Row Max Width', '文本行最大宽度')">
        <el-input-number v-model="form.data.textRowMaxWidth" :disabled="!form.style.enabled" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Letter Spacing', '字符间距')">
        <el-input v-model="form.data.letterSpacing" :disabled="!form.style.enabled" :placeholder="t('Enter letter spacing', '请输入字符间距')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Word Spacing', '单词间距')">
        <el-input v-model="form.data.wordSpacing" :disabled="!form.style.enabled" :placeholder="t('Enter word spacing', '请输入单词间距')" @input="handleChange" />
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :title="t('Shadow', '阴影')" :column="2" border v-if="form.data.shadowStyle">
      <template #title>
        <el-checkbox v-model="form.shadow.enabled" @change="handleChangeShadowEnabled">{{ t('Shadow', '阴影') }}</el-checkbox>
      </template>
      <el-descriptions-item :label="t('Shadow Blur', '阴影模糊')">
        <el-input-number v-model="form.data.shadowStyle.shadowBlur" :disabled="!form.shadow.enabled" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Shadow Color', '阴影颜色')">
        <el-input v-model="form.data.shadowStyle.shadowColor" :disabled="!form.shadow.enabled" :placeholder="t('Enter a shadow color', '请输入阴影颜色')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Shadow Offset X', '阴影水平偏移')">
        <el-input-number v-model="form.data.shadowStyle.shadowOffsetX" :disabled="!form.shadow.enabled" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Shadow Offset Y', '阴影垂直偏移')">
        <el-input-number v-model="form.data.shadowStyle.shadowOffsetY" :disabled="!form.shadow.enabled" @input="handleChange" />
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :title="t('Advanced Style', '高级样式')" :column="2" border v-if="form.data.shadowStyle">
      <template #title>
        <el-checkbox v-model="form.advancedStyle.enabled" @change="handleChangeAdvancedStyleEnabled">{{ t('Advanced Style', '高级样式') }}</el-checkbox>
      </template>
      <el-descriptions-item :label="t('Type', '类型')" :span="2">
        <el-select v-model="form.data.advancedStyle.type" :disabled="!form.advancedStyle.enabled" :placeholder="t('Select a style type', '请选择样式类型')" @change="handleChange">
          <el-option label="linear" value="linear" />
          <el-option label="radial" value="radial" />
          <el-option label="conic" value="conic" />
          <el-option label="pattern" value="pattern" />
        </el-select>
      </el-descriptions-item>
      <template v-if="form.data.advancedStyle.type === 'linear'">
        <el-descriptions-item label="Linear X0">
          <el-input-number v-model="form.data.advancedStyle.params.linear.x0" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
        <el-descriptions-item label="Linear Y0">
          <el-input-number v-model="form.data.advancedStyle.params.linear.y0" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
        <el-descriptions-item label="Linear X1">
          <el-input-number v-model="form.data.advancedStyle.params.linear.x1" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
        <el-descriptions-item label="Linear Y1">
          <el-input-number v-model="form.data.advancedStyle.params.linear.y1" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
      </template>
      <template v-else-if="form.data.advancedStyle.type === 'radial'">
        <el-descriptions-item label="Radial X0">
          <el-input-number v-model="form.data.advancedStyle.params.radial.x0" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
        <el-descriptions-item label="Radial Y0">
          <el-input-number v-model="form.data.advancedStyle.params.radial.y0" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
        <el-descriptions-item label="Radial R0">
          <el-input-number v-model="form.data.advancedStyle.params.radial.r0" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
        <el-descriptions-item label="Radial X1">
          <el-input-number v-model="form.data.advancedStyle.params.radial.x1" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
        <el-descriptions-item label="Radial Y1">
          <el-input-number v-model="form.data.advancedStyle.params.radial.y1" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
        <el-descriptions-item label="Radial R1">
          <el-input-number v-model="form.data.advancedStyle.params.radial.r1" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
      </template>
      <template v-if="form.data.advancedStyle.type === 'conic'">
        <el-descriptions-item label="Conic X">
          <el-input-number v-model="form.data.advancedStyle.params.conic.x" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
        <el-descriptions-item label="Conic Y">
          <el-input-number v-model="form.data.advancedStyle.params.conic.y" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
        <el-descriptions-item label="Conic StartAngle">
          <el-input-number v-model="form.data.advancedStyle.params.conic.startAngle" :disabled="!form.advancedStyle.enabled" @input="handleChange" />
        </el-descriptions-item>
      </template>
      <template v-if="form.data.advancedStyle.type === 'pattern'">
        <el-descriptions-item :label="t('Image', '图片')">
          <el-upload
            ref="uploadPatternImage"
            list-type="picture-card"
            accept="image/*"
            :auto-upload="false"
            :limit="1"
            :show-file-list="true"
            :on-exceed="handleExceedPatternImage"
            :on-change="handleChangePatternImage"
            :disabled="!form.advancedStyle.enabled"
            class="upload-image"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-descriptions-item>
        <el-descriptions-item :label="t('Repetition', '重复方式')">
          <el-select v-model="form.data.advancedStyle.params.pattern.repetition" :disabled="!form.advancedStyle.enabled" :placeholder="t('Select a repetition mode', '请选择重复方式')" @change="handleChange">
            <el-option label="repeat" value="repeat" />
            <el-option label="repeat-x" value="repeat-x" />
            <el-option label="repeat-y" value="repeat-y" />
            <el-option label="no-repeat" value="no-repeat" />
          </el-select>
        </el-descriptions-item>
      </template>
    </el-descriptions>

    <el-descriptions :title="t('Protection & Behavior', '保护与行为')" :column="2" border>
      <template #title>
        <el-checkbox v-model="form.extra.enabled" @change="handleChangeExtraEnabled">{{ t('Protection & Behavior', '保护与行为') }}</el-checkbox>
      </template>
      <el-descriptions-item :label="t('Mutation Observer', 'DOM 变更监听')">
        <el-switch v-model="form.data.mutationObserve" :disabled="!form.extra.enabled" :active-text="t('On', '开启')" :inactive-text="t('Off', '关闭')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Protection Monitor', '保护监控')">
        <el-switch v-model="form.data.monitorProtection" :disabled="!form.extra.enabled" :active-text="t('Yes', '是')" :inactive-text="t('No', '否')" @input="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Auxiliary Line', '辅助线')">
        <el-switch v-model="form.data.auxiliaryLine" :disabled="!form.extra.enabled" :active-text="t('Yes', '是')" :inactive-text="t('No', '否')" @change="handleChange" />
      </el-descriptions-item>
      <el-descriptions-item :label="t('Movable', '动态移动')">
        <el-switch v-model="form.data.movable" :disabled="!form.extra.enabled" :active-text="t('Yes', '是')" :inactive-text="t('No', '否')" @change="handleChange" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, onMounted, watch, ref } from 'vue'
import { useData } from 'vitepress'
// import { cloneDeep, pick, defaultsDeep } from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import pick from 'lodash/pick'
import defaultsDeep from 'lodash/defaultsDeep'
import {
  defaultConfig,
  basicOptionKeys,
  positionOptionKeys,
  richTextOptionKeys,
  imageOptionKeys,
  styleOptionKeys,
  shadowOptionKeys,
  advancedStyleOptionKeys,
  extraOptionKeys
} from './config'
import { Plus } from '@element-plus/icons-vue'
import { genFileId } from 'element-plus'
import type { UploadFile, UploadInstance, UploadRawFile } from 'element-plus'
import { loadImage } from '../../../src/utils'
import { WatermarkOptions } from '../../../src'

const props = defineProps({
  options: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['change'])
const { lang } = useData()
const t = (en: string, zh: string) => lang.value.startsWith('zh') ? zh : en

const form = reactive({
  data: {} as WatermarkOptions,
  position: {
    enabled: false
  },
  richText: {
    enabled: false
  },
  image: {
    enabled: false
  },
  style: {
    enabled: false
  },
  shadow: {
    enabled: false
  },
  advancedStyle: {
    enabled: false
  },
  extra: {
    enabled: false
  }
})

const filterValue = ref<string[]>([])

const filterOptions = computed(() => [{
  value: 'blur(2px)',
  label: t('Blur — blur(2px)', '高斯模糊 — blur(2px)'),
}, {
  value: 'brightness(30%)',
  label: t('Brightness — brightness(30%)', '调节亮度 — brightness(30%)'),
}, {
  value: 'contrast(30%)',
  label: t('Contrast — contrast(30%)', '调节对比度 — contrast(30%)'),
}, {
  value: 'grayscale(100%)',
  label: t('Grayscale — grayscale(100%)', '灰阶 — grayscale(100%)'),
}, {
  value: 'hue-rotate(100deg)',
  label: t('Hue rotation — hue-rotate(100deg)', '色彩旋转 — hue-rotate(100deg)'),
}, {
  value: 'invert(100%)',
  label: t('Invert — invert(100%)', '反色图像 — invert(100%)'),
}, {
  value: 'opacity(50%)',
  label: t('Opacity — opacity(50%)', '调节透明度 — opacity(50%)'),
}, {
  value: 'saturate(10%)',
  label: t('Saturation — saturate(10%)', '调节饱和度 — saturate(10%)'),
}, {
  value: 'sepia(100%)',
  label: t('Sepia — sepia(100%)', '深褐色处理 — sepia(100%)'),
}, {
  value: 'drop-shadow(0px 0px 10px crimson)',
  label: t('Drop shadow — drop-shadow(0px 0px 10px crimson)', '阴影 — drop-shadow(0px 0px 10px crimson)'),
}])

const handleFilterChange = (val) => {
  form.data.filter = val.join(' ')
}

const uploadPatternImage = ref<UploadInstance>()
const uploadImage = ref<UploadInstance>()

onMounted(() => {
  form.data = reactive(
    defaultsDeep(
      cloneDeep(props.options),
      defaultConfig
    )
  )
  watch(form, handleChangeForm, {
    deep: true
  })
})

let eventFlag: NodeJS.Timeout

const handleChangeForm = (newVal: any) => {
  const outputData = {
    ...pick(newVal.data, basicOptionKeys),
    ...(newVal.position.enabled ? pick(newVal.data, positionOptionKeys) : null),
    ...(newVal.richText.enabled ? pick(newVal.data, richTextOptionKeys) : null),
    ...(newVal.image.enabled ? pick(newVal.data, imageOptionKeys) : null),
    ...(newVal.style.enabled ? pick(newVal.data, styleOptionKeys) : null),
    ...(newVal.shadow.enabled ? pick(newVal.data, shadowOptionKeys) : null),
    ...(newVal.advancedStyle.enabled ? pick(newVal.data, advancedStyleOptionKeys) : null),
    ...(newVal.extra.enabled ? pick(newVal.data, extraOptionKeys) : null)
  }
  if (eventFlag) {
    clearTimeout(eventFlag)
  }
  eventFlag = setTimeout(() => {
    emit('change', outputData)
  }, 100)
}

const handleChange = () => {
}

const handleChangePositionEnabled = () => {
}

const handleChangeRichTextEnabled = () => {
}

const handleChangeImageEnabled = () => {
}

const handleChangeStyleEnabled = () => {
}

const handleChangeShadowEnabled = () => {
}

const handleChangeAdvancedStyleEnabled = () => {
}

const handleChangeExtraEnabled = () => {
}

const handleChangePatternImage = (uploadFile: UploadFile) => {
  if (uploadFile.url) {
    loadImage(uploadFile.url).then((res) => {
      form.data!.advancedStyle!.params!.pattern!.image = res
    })
  }
}

const handleExceedPatternImage = (files: File[]) => {
  uploadPatternImage.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadPatternImage.value!.handleStart(file)
}

const handleChangeImage = (uploadFile: UploadFile) => {
  if (uploadFile.url) {
    form.data!.image = uploadFile.url
  }
}

const handleExceedImage = (files: File[]) => {
  uploadImage.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadImage.value!.handleStart(file)
}
</script>

<style scoped>
:deep(table) {
  display: table;
  margin: 0;
}
.el-descriptions :deep(.el-descriptions__header) {
  margin-top: 10px;
  margin-bottom: 10px;
}

.upload-image :deep(ul) {
  padding-left: 0;
}

.upload-image :deep(.el-upload--picture-card) {
  --el-upload-picture-card-size: 60px;
}

.upload-image :deep(.el-upload-list--picture-card) {
  --el-upload-list-picture-card-size: 60px;
}
</style>
