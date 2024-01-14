import {
    defineConfig, presetAttributify,
    presetUno, presetIcons
  } from 'unocss'
  
  export default defineConfig({
          shortcuts: [
          ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
          ['btn-scale', 'hover:scale-110 transition duration-300'],
          ['btn-padrao', 'hover:scale-110 transition duration-300'],
        ],
    // theme: {
    //   colors: {
    //     // ...
    //   }
    // },
    presets: [
      presetUno(),
      presetAttributify(),
      presetIcons({scale: 1.2}),
    //   presetTypography(),
    //   presetWebFonts({
    //     fonts: {
    //       // ...
    //     },
    //   }),
    ],
    transformers: [
    //   transformerDirectives(),
    //   transformerVariantGroup(),
    ],
  })