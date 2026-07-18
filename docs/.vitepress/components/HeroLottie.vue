<script setup lang="ts">
import type { AnimationItem } from 'lottie-web'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'

const orbitContainer = ref<HTMLDivElement | null>(null)
const protectionContainer = ref<HTMLDivElement | null>(null)
const isOrbitReady = ref(false)
const isProtectionReady = ref(false)
const { lang } = useData()
const animationLabel = computed(() =>
  lang.value.startsWith('zh')
    ? '由可见水印和暗水印保护的浏览器内容'
    : 'Browser content protected by visible and blind watermarks',
)

let orbitAnimation: AnimationItem | undefined
let protectionAnimation: AnimationItem | undefined
let motionPreference: MediaQueryList | undefined

function destroyAnimations() {
  orbitAnimation?.destroy()
  protectionAnimation?.destroy()
  orbitAnimation = undefined
  protectionAnimation = undefined
  isOrbitReady.value = false
  isProtectionReady.value = false
}

async function mountAnimations() {
  if (motionPreference?.matches) {
    return
  }

  const { default: lottie } = await import('lottie-web/build/player/lottie_light')

  if (motionPreference?.matches) {
    return
  }

  if (orbitContainer.value && !orbitAnimation) {
    orbitAnimation = lottie.loadAnimation({
      autoplay: true,
      container: orbitContainer.value,
      loop: true,
      path: withBase('/hero-orbit.json'),
      renderer: 'svg',
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        progressiveLoad: true,
      },
    })

    orbitAnimation.addEventListener('DOMLoaded', () => {
      isOrbitReady.value = true
    })
  }

  if (protectionContainer.value && !protectionAnimation) {
    protectionAnimation = lottie.loadAnimation({
      autoplay: true,
      container: protectionContainer.value,
      loop: true,
      path: withBase('/hero-watermark.json'),
      renderer: 'svg',
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        progressiveLoad: true,
        title: animationLabel.value,
      },
    })

    protectionAnimation.addEventListener('DOMLoaded', () => {
      isProtectionReady.value = true
    })
  }
}

function handleMotionPreferenceChange() {
  if (motionPreference?.matches) {
    destroyAnimations()
    return
  }

  void mountAnimations()
}

onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', handleMotionPreferenceChange)
  void mountAnimations()
})

onBeforeUnmount(() => {
  motionPreference?.removeEventListener('change', handleMotionPreferenceChange)
  destroyAnimations()
})
</script>

<template>
  <div class="hero-lottie" role="img" :aria-label="animationLabel">
    <div
      ref="orbitContainer"
      class="hero-lottie__orbit"
      :class="{ 'is-ready': isOrbitReady }"
      aria-hidden="true"
    />

    <svg v-if="!isOrbitReady" class="hero-lottie__orbit-fallback" viewBox="0 0 520 520" aria-hidden="true">
      <circle class="hero-lottie__orbit-ring" cx="260" cy="254" r="192" />
      <circle class="hero-lottie__orbit-halo hero-lottie__orbit-halo--left" cx="68" cy="254" r="10" />
      <circle class="hero-lottie__orbit-sphere hero-lottie__orbit-sphere--left" cx="68" cy="254" r="4" />
      <circle class="hero-lottie__orbit-halo hero-lottie__orbit-halo--right" cx="452" cy="254" r="10" />
      <circle class="hero-lottie__orbit-sphere hero-lottie__orbit-sphere--right" cx="452" cy="254" r="4" />
    </svg>

    <img
      class="hero-lottie__product"
      :src="withBase('/hero-product.webp')"
      alt=""
      width="960"
      height="960"
      decoding="async"
      fetchpriority="high"
      aria-hidden="true"
    />

    <div
      ref="protectionContainer"
      class="hero-lottie__animation"
      :class="{ 'is-ready': isProtectionReady }"
      aria-hidden="true"
    />

    <svg v-if="!isProtectionReady" class="hero-lottie__fallback" viewBox="0 0 520 520" aria-hidden="true">
      <g transform="translate(12 10)">
        <path
          class="hero-lottie__pulse"
          d="M413 348c16 11 32 15 48 18v31c0 32-18 55-48 69-30-14-48-37-48-69v-31c16-3 32-7 48-18Z"
        />
        <path
          class="hero-lottie__shield-bezel"
          d="M413 357c13 9 26 12 39 15v25c0 25-14 44-39 56-25-12-39-31-39-56v-25c13-3 26-6 39-15Z"
        />
        <path
          class="hero-lottie__shield-center"
          d="M413 367c10 6 20 9 29 11v19c0 17-10 31-29 41-19-10-29-24-29-41v-19c9-2 19-5 29-11Z"
        />
        <circle class="hero-lottie__shield-glint" cx="395" cy="382" r="3.5" />
        <path class="hero-lottie__check" d="m397 401 11 11 22-25" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.hero-lottie {
  position: relative;
  width: min(100%, 520px);
  aspect-ratio: 1;
  contain: layout paint;
}

.hero-lottie__product,
.hero-lottie__orbit,
.hero-lottie__orbit-fallback,
.hero-lottie__animation,
.hero-lottie__fallback {
  position: absolute;
  pointer-events: none;
}

.hero-lottie__product {
  z-index: 1;
  inset: 10px;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  object-fit: contain;
  transform: translate3d(0, 3px, 0);
  animation: hero-product-float 6s cubic-bezier(0.37, 0, 0.63, 1) infinite;
  will-change: transform;
}

.hero-lottie__orbit,
.hero-lottie__orbit-fallback,
.hero-lottie__animation,
.hero-lottie__fallback {
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-lottie__orbit,
.hero-lottie__animation {
  opacity: 0;
  transition: opacity 240ms cubic-bezier(0.25, 1, 0.5, 1);
}

.hero-lottie__orbit.is-ready,
.hero-lottie__animation.is-ready {
  opacity: 1;
}

.hero-lottie__orbit,
.hero-lottie__orbit-fallback {
  z-index: 0;
}

.hero-lottie__animation,
.hero-lottie__fallback {
  z-index: 2;
}

.hero-lottie__orbit-fallback,
.hero-lottie__fallback {
  overflow: visible;
}

.hero-lottie__orbit-ring {
  fill: none;
  stroke: #94b6e8;
  stroke-width: 1.25;
}

.hero-lottie__orbit-halo--left,
.hero-lottie__orbit-sphere--left {
  fill: #63d6d4;
}

.hero-lottie__orbit-halo--right,
.hero-lottie__orbit-sphere--right {
  fill: #1e58ca;
}

.hero-lottie__orbit-halo {
  opacity: 0.18;
}

.hero-lottie__shield-bezel {
  fill: #e8f1ff;
  stroke: #94b6e8;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.hero-lottie__shield-center {
  fill: #1e58ca;
}

.hero-lottie__shield-glint {
  fill: #c8dfff;
}

.hero-lottie__pulse {
  fill: none;
  stroke: #63d6d4;
  stroke-linejoin: round;
  stroke-width: 3;
  opacity: 0.35;
}

.hero-lottie__check {
  fill: none;
  stroke: #f8faff;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 6.5;
}

.dark .hero-lottie__shield-bezel {
  fill: #26395e;
  stroke: #5d78a8;
}

.dark .hero-lottie__orbit-ring {
  stroke: #5d78a8;
}

@keyframes hero-product-float {
  0%,
  100% {
    transform: translate3d(0, 3px, 0);
  }

  50% {
    transform: translate3d(0, -5px, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-lottie__product {
    animation: none;
    transform: none;
    will-change: auto;
  }

  .hero-lottie__orbit,
  .hero-lottie__animation {
    display: none;
  }
}
</style>
