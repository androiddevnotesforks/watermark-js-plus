---
layout: doc
description: 上传或粘贴图片，在浏览器中调整解码参数并显现其中的暗水印。
---
# 暗水印解码器

上传或粘贴一张包含暗水印的图片，然后调整参数以显现水印内容。

**相关内容：** [暗水印指南](/zh/guide/blind-watermark) · [解码参数](/zh/config/blind-decode)

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { genFileId } from 'element-plus';
import type { UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from 'element-plus';
import { BlindWatermark } from '../../../src';

const upload = ref<UploadInstance>();
const fileList = ref<UploadUserFile[]>([]);
const imageUrl = ref('');
const previewImageUrl = ref('');
const previewVisible = ref(false);
const theme = ref('light');
const compositeOperation = ref('overlay');
const compositeTimes = ref(4);
const fillColor = ref('#000');
const resultImageUrl = ref('');

const compositeOperations = [
  'source-over',
  'source-in',
  'source-out',
  'source-atop',
  'destination-over',
  'destination-in',
  'destination-out',
  'destination-atop',
  'lighter',
  'copy',
  'xor',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity'
];

const handleChangeImageSuccess: UploadProps['onChange'] = (uploadFile) => {
  const url = uploadFile.url;
  if (!url) {
    return;
  }
  updateImageUrl(url);
};

const replaceUploadFile = (file: UploadRawFile) => {
  previewImageUrl.value = '';
  previewVisible.value = false;
  upload.value?.clearFiles();
  file.uid = genFileId();
  upload.value?.handleStart(file);
};

const handleExceed: UploadProps['onExceed'] = (files) => {
  replaceUploadFile(files[0] as UploadRawFile);
};

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  previewImageUrl.value = uploadFile.url ?? '';
  previewVisible.value = Boolean(previewImageUrl.value);
};

const handleRemove: UploadProps['onRemove'] = () => {
  imageUrl.value = '';
  previewImageUrl.value = '';
  previewVisible.value = false;
  resultImageUrl.value = '';
};

const updateImageUrl = (url: string) => {
  if (imageUrl.value !== url && imageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl.value);
  }
  imageUrl.value = url;
  handleDecode();
};

const handleChangeTheme = () => {
  if (theme.value === 'light') {
    compositeOperation.value = 'overlay';
    compositeTimes.value = 4;
    fillColor.value = '#000';
  } else {
    compositeOperation.value = 'overlay';
    compositeTimes.value = 3;
    fillColor.value = '#fff';
  }
  handleDecode();
};

const handleChangeCompositeOperation = () => {
  handleDecode();
};

const handleChangeCompositeTimes = () => {
  handleDecode();
};

const handleChangeFillColor = () => {
  handleDecode();
};

const handleDecode = () => {
  BlindWatermark.decode({
    fillColor: fillColor.value,
    compositeTimes: compositeTimes.value,
    compositeOperation: compositeOperation.value,
    url: imageUrl.value,
    onSuccess: (imageBase64) => {
      resultImageUrl.value = imageBase64;
    }
  });
};

const handlePaste = (event: ClipboardEvent) => {
  const imageItem = Array.from(event.clipboardData?.items ?? []).find(
    (item) => item.kind === 'file' && item.type.startsWith('image/')
  );
  const imageFile = imageItem?.getAsFile();
  if (!imageFile) {
    return;
  }
  event.preventDefault();
  replaceUploadFile(imageFile as UploadRawFile);
};

onMounted(() => {
  window.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste);
});
</script>

<div>
  <section class="upload-section" aria-labelledby="decode-image-title">
    <div id="decode-image-title" class="title">原图</div>
    <el-upload
      ref="upload"
      v-model:file-list="fileList"
      class="decode-uploader"
      drag
      list-type="picture-card"
      accept="image/*"
      :auto-upload="false"
      :limit="1"
      :on-change="handleChangeImageSuccess"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        将图片拖到此处或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">仅支持图片 · 也可按 Ctrl+V 或 Cmd+V 粘贴上传</div>
      </template>
    </el-upload>
    <el-dialog v-model="previewVisible">
      <img class="preview-dialog-image" :src="previewImageUrl" alt="图片预览" />
    </el-dialog>
  </section>
  <div class="title">解码参数</div>

  <el-descriptions :column="1" border>
    <el-descriptions-item label="图片背景">
      <el-radio-group v-model="theme" @change="handleChangeTheme">
        <el-radio-button label="浅色" value="light" />
        <el-radio-button label="深色" value="dark" />
      </el-radio-group>
    </el-descriptions-item>
    <el-descriptions-item label="合成模式（compositeOperation）">
      <el-select style="width: 400px" v-model="compositeOperation" filterable placeholder="请选择合成模式" @change="handleChangeCompositeOperation">
        <el-option v-for="item in compositeOperations" :key="item" :label="item" :value="item" />
      </el-select>
    </el-descriptions-item>
    <el-descriptions-item label="合成次数（compositeTimes）">
      <el-input-number v-model="compositeTimes" @change="handleChangeCompositeTimes" />
    </el-descriptions-item>
    <el-descriptions-item label="填充颜色（fillColor）">
      <el-color-picker v-model="fillColor" @change="handleChangeFillColor" />
    </el-descriptions-item>
  </el-descriptions>

  <div class="title">解码结果</div>
  <el-image
    v-if="resultImageUrl"
    style="width: 400px; height: 400px"
    :src="resultImageUrl"
    :preview-src-list="[resultImageUrl]"
    fit="cover"
  />
  <el-empty v-else description="上传图片后即可查看解码结果" />
</div>

<el-backtop></el-backtop>

<style scoped>
.title {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
}
.upload-section {
  margin-bottom: 24px;
}
.decode-uploader {
  display: block;
  width: min(100%, 556px);
}
.decode-uploader :deep(.el-upload-list--picture-card) {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  list-style: none;
  padding-left: 0;
}
.decode-uploader :deep(.el-upload--picture-card) {
  background: transparent;
  border: 0;
  height: 180px;
  margin: 0;
  order: -1;
  width: min(100%, 360px);
}
.decode-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
}
.decode-uploader :deep(.el-upload-list__item) {
  height: 180px;
  margin: 0;
  width: 180px;
}
.decode-uploader :deep(.el-upload-list__item-thumbnail) {
  display: block;
  margin: 0;
}
.decode-uploader :deep(.el-upload__tip) {
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}
.preview-dialog-image {
  display: block;
  max-height: 70vh;
  object-fit: contain;
  width: 100%;
}
</style>
