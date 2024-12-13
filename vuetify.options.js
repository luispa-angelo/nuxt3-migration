import pt from 'vuetify/lib/locale/pt'

const customLightColors = {
  blue: {
    base: '#0D48C3',
    lighten5: '#ECF0FF',
    lighten4: '#96ADFF',
    lighten3: '#6284FD',
    lighten1: '#0346F2',
    darken2: '#002ED0',
    darken3: '#03349B',
  },
  red: {
    base: '#ED2121',
    lighten4: '#FBD6D5',
    darken2: '#B82927',
  },
  white: {
    base: '#FFFFFF',
    darken1: '#F8F9FA',
  },
  grey: {
    base: '#252F40',
    lighten5: '#EFEFEF',
    lighten4: '#949CAB',
    lighten3: '#67748E',
  },
  stroke: {
    base: '#D2D6DA',
    lighten5: '#F5F5F5',
    lighten3: '#E6E6E6',
    darken1: '#AAAAAA',
    darken3: '#8D8F90',
  },
  purple: {
    base: '#940DFF',
    lighten4: '#EFE8F4',
    lighten3: '#B798CF',
    lighten2: '#AA69DE',
    darken1: '#8606EC',
    darken2: '#7000C9',
  },
  green: {
    base: '#008C1F',
    lighten4: '#EAF3DD',
    lighten3: '#CCE8D2',
    darken2: '#006E18',
  },
  orange: {
    base: '#E36822',
    lighten5: '#FFECE1',
    lighten4: '#F9E1D3',
    lighten3: '#FFD5BE',
    lighten2: '#FC9D68',
    lighten1: '#FF7F37',
    darken2: '#C0571B',
    darken3: '#BD4503',
  },
  'omie': { base: '#00E2F4' },
  'oneflow': { base: '#6C0088' },
  'gclick': { base: '#009A22' },
  'linker': { base: '#FF6D5C' },
  'conpass': { base: '#008CE7' },
  'devi': { base: '#FF8525' },
  'mintegra': { base: '#0D48C3' },
}

const customDarkColors = {
  blue: { base: '#346af4', lighten4: '#ECF0FF', darken1: '#0D48C3' },
}

export default {
  font: {
    family: 'Poppins',
  },
  theme: {
    dark: true,
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        ...customLightColors,
        'default-text': { base: customLightColors.grey.base },
        'sub-text': { base: customLightColors.grey.lighten3 },
        'success-tag': { base: '#b0d453' },
        'warning-tag': { base: '#f8a82e' },
        'error-tag': { base: '#FF6168' },
        'email-icon-bg': { base: customLightColors.red.lighten4 },
        'email-icon-text': { base: customLightColors.red.darken2 },
        'phone-icon-bg': { base: customLightColors.green.lighten3 },
        'phone-icon-text': { base: customLightColors.green.darken2 },
        'chat-icon-bg': { base: customLightColors.green.lighten4 },
        'chat-icon-text': { base: '#017E1D' },
        'meeting-icon-bg': { base: customLightColors.blue.lighten5 },
        'meeting-icon-text': { base: customLightColors.blue.darken3 },
        'internal-icon-bg': { base: customLightColors.orange.lighten5 },
        'internal-icon-text': { base: '#E5702E' },
        'default-icon-bg': { base: customLightColors.purple.lighten4 },
        'default-icon-text': { base: customLightColors.purple.darken2 },
        'phone-status-default': { base: customLightColors.white.darken1 },
        'phone-status-active': { base: customLightColors.blue.lighten5 },
        'phone-status-hold': { base: customLightColors.orange.lighten5 },
        shape: {
          base: customLightColors.stroke.lighten5,
          lighten1: customLightColors.white.base,
          lighten2: customLightColors.white.darken1,
        },
        primary: customLightColors.blue,
        secondary: { base: customLightColors.white.base },
        info: { base: '#FFA925' },
        success: customLightColors.green,
        warning: customLightColors.orange,
        error: customLightColors.red,
      },
      dark: {
        ...customDarkColors,
        'default-text': { base: '#FFF' },
        'sub-text': { base: '#67748E' },
        'success-tag': { base: '#b0d453' },
        'warning-tag': { base: '#f8a82e' },
        'error-tag': { base: '#e7596d' },
        shape: {
          base: '#121212',
          lighten1: '#0d0d0d',
          lighten2: '#0d0d0d',
        },
        grey: {
          base: '#D2D6DA',
          lighten1: '#F5F5F5',
          darken1: '#AAAAAA',
          darken2: '#8D8F90',
        },
        primary: { base: '#32A7E2' },
        secondary: { base: '#FFFFFF' },
        info: { base: '#FFA925' },
        success: { base: '#008C1F' },
        warning: { base: '#FFA925' },
        error: { base: '#EA312F' },
      },
    },
  },
  lang: {
    locales: { pt },
    current: 'pt',
  },
}