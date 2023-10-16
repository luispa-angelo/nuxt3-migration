import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';

import vuetifyOptions from '../vuetify.options';

// handle vuetifyOptions theme colors
const customLightColors = vuetifyOptions.theme.themes.light;
const colorCombinations = {};

for (const colorKey in customLightColors) {
  const colorShades = customLightColors[colorKey];
  for (const shadeKey in colorShades) {
    const combinationKey = `${colorKey}-${shadeKey}`;
    colorCombinations[combinationKey] = colorShades[shadeKey];
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: 'mdi',
    },
    theme: {
      defaultTheme: 'defaultTheme',
      themes: {
        defaultTheme: {
          dark: false,
          variables: {},
          colors: {
            ...colorCombinations,
            primary: customLightColors.blue.base,
            secondary: customLightColors.white.base,
            info: '#FFA925',
            success: customLightColors.green.base,
            warning: customLightColors.orange.base,
            error: customLightColors.red.base,
          },
        },
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
