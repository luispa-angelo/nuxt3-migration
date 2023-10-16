import { configs } from './configs';
import vuetify from 'vite-plugin-vuetify';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    async (options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) =>
        // @ts-expect-error
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
    '~/components/icons',
    { path: '~/components/dialog', prefix: 'dialog' },
    { path: '~/components/alert', prefix: 'alert' },
    { path: '~/components/analytics', prefix: 'analytics' },
    { path: '~/components/inbox', prefix: 'inbox' },
    { path: '~/components/request', prefix: 'request' },
    { path: '~/components/calendar', prefix: 'calendar' },
    { path: '~/components/partner', prefix: 'partner' },
    { path: '~/components/company', prefix: 'company' },
    { path: '~/components/contact', prefix: 'contact' },
    { path: '~/components/login', prefix: 'login' },
    { path: '~/components/task', prefix: 'task' },
    { path: '~/components/opportunity', prefix: 'opportunity' },
    { path: '~/components/configure-business', prefix: 'business' },
    { path: '~/components/configure-playbook', prefix: 'playbook' },
    { path: '~/components/configure-pipeline', prefix: 'pipeline' },
    { path: '~/components/configure-workflow', prefix: 'workflow' },
    { path: '~/components/configure-task', prefix: 'type' },
    { path: '~/components/configure-functional-area', prefix: 'area' },
    { path: '~/components/configure-role', prefix: 'role' },
    { path: '~/components/configure-permission', prefix: 'permission' },
    {
      path: '~/components/configure-permission-group',
      prefix: 'permissionGroup',
    },
    { path: '~/components/configure-user', prefix: 'user' },
    { path: '~/components/configure-team', prefix: 'team' },
    { path: '~/components/configure-product', prefix: 'product' },
    { path: '~/components/configure-group', prefix: 'group' },
    { path: '~/components/configure-template', prefix: 'template' },
    { path: '~/components/configure-sorter', prefix: 'sorter' },
    { path: '~/components/configure-tenant', prefix: 'tenant' },
    { path: '~/components/channel', prefix: 'channel' },
    { path: '~/components/capability', prefix: 'capability' },
    {
      path: '~/components/configure-support-entities',
      prefix: 'supportEntities',
    },
    { path: '~/components/support-menu', prefix: 'supportMenu' },
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
