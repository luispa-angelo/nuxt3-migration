import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import { configs } from './configs';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    async (options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) =>
        // @ts-expect-error: Vuetify 3 default config
        config.plugins.push(
          vuetify({
            autoImport: true,
            styles: { configFile: './assets/scss/settings.scss' },
          })
        )
      );
    },
    '@pinia/nuxt',
  ],
  pinia: {
    autoImports: ['defineStore', ['defineStore', 'definePiniaStore']],
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variables.scss" as *;',
        },
      },
    },
    define: {
      'process.env.DEBUG': false,
    },
  },
  components: [
    '~/components',
    '~/components/general',
    { path: '~/components/login', prefix: 'login' },
  ],
  imports: { dirs: ['./stores'] },
  css: ['vuetify/lib/styles/main.sass', '@/assets/scss/main.scss'],
  build: {
    transpile: ['vuetify'],
  },
  app: {
    head: {
      titleTemplate: '%s - CRM',
      title: 'Omie',
      htmlAttrs: {
        lang: 'pt-br',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap',
        },
      ],
      script: [{ src: 'https://fast.conpass.io/mcsTLkHei8ui.js' }],
    },
  },
  dir: {
    public: 'static',
  },
  runtimeConfig: {
    public: {
      baseURL: configs[`${process.env.NODE_ENV || 'development'}`].API_URL,
    },
  },
  ssr: false,
  devServer: {
    // port: 8080
  },
});
