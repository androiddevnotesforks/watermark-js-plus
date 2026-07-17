import DefaultTheme from 'vitepress/theme'
import { createPinia } from 'pinia'
import { h } from 'vue'
import ElementPlus, { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'virtual:group-icons.css'
import HeroLottie from '../components/HeroLottie.vue'
import '../styles/index.css'
import '../../../src/style'

export default {
  ...DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(HeroLottie),
    }),
  enhanceApp: async ({ app, router, siteData, isServer }: any) => {
    // app is the Vue 3 app instance from `createApp()`. router is VitePress'
    // custom router. `siteData`` is a `ref`` of current site-level metadata.
    const store = createPinia()
    app.use(store)
    app.provide(ID_INJECTION_KEY, {
      prefix: 1024,
      current: 0,
    })
    app.provide(ZINDEX_INJECTION_KEY, {
      current: 0,
    })
    app.use(ElementPlus)
  },
}
