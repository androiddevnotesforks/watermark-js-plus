<script setup lang="ts">
import type { AnimationItem } from 'lottie-web'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'

const orbitContainer = ref<HTMLDivElement | null>(null)
const isOrbitReady = ref(false)
const { lang } = useData()
const animationLabel = computed(() =>
  lang.value.startsWith('zh')
    ? '由可见水印和暗水印保护的浏览器内容'
    : 'Browser content protected by visible and blind watermarks',
)

let orbitAnimation: AnimationItem | undefined
let motionPreference: MediaQueryList | undefined

function destroyAnimations() {
  orbitAnimation?.destroy()
  orbitAnimation = undefined
  isOrbitReady.value = false
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
.hero-lottie__orbit-fallback {
  position: absolute;
  pointer-events: none;
}

.hero-lottie__product {
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: translate3d(0, 3px, 0);
  animation: hero-product-float 6s cubic-bezier(0.37, 0, 0.63, 1) infinite;
  will-change: transform;
}

.hero-lottie__orbit,
.hero-lottie__orbit-fallback {
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-lottie__orbit {
  opacity: 0;
  transition: opacity 240ms cubic-bezier(0.25, 1, 0.5, 1);
}

.hero-lottie__orbit.is-ready {
  opacity: 1;
}

.hero-lottie__orbit,
.hero-lottie__orbit-fallback {
  z-index: 0;
}

.hero-lottie__orbit-fallback {
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

  .hero-lottie__orbit {
    display: none;
  }
}
</style>
