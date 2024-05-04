import {
    defineConfig, presetAttributify,
    presetUno, presetIcons
} from 'unocss'
  

//const listCor = ref<any>(['slate','gray',]);
const listColors = ["slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];

const listCorIntensidade = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const listDirecoes = ["br", "bl", "tr", "tl", "r", "l", "t", "b"];

// const listColorsIntensidade = computed(() => {
//   const listt = [];
//   listColors.value.map((cor: any) => {
//     listt.push(cor);
//     listCorIntensidade.value.map((intensidade: any) => {
//       listt.push(cor + "-" + intensidade);
//     });
//   });
//   return listt;
// });

const listColorsIntensidade = listColors.map((cor) => {
  return listCorIntensidade.map((intensidade) => {
    return "bg-" + cor + "-" + intensidade
  });
}
).flat();
const listDirections = listDirecoes.map((direcao) => {
  return "bg-gradient-to-" + direcao;
}
).flat();
const listColorsIntensidadeFrom = listColors.map((cor) => {
  return listCorIntensidade.map((intensidade) => {
    return "from-" + cor + "-" + intensidade
  });
}
).flat();
const listColorsIntensidadeTo = listColors.map((cor) => {
  return listCorIntensidade.map((intensidade) => {
    return "to-" + cor + "-" + intensidade
  });
}
).flat();

  
  export default defineConfig({
    shortcuts: [
      ["btn", "px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50"],
      ["btn-scale", "hover:scale-110 transition duration-300"],
      ["btn-padrao", "hover:scale-110 transition duration-300"],
    ],
    // theme: {
    //   colors: {
    //     // ...
    //   }
    // },
    safelist: [...listColorsIntensidade, ...listColorsIntensidadeFrom, ...listColorsIntensidadeTo, ...listDirections],
    presets: [
      presetUno(),
      presetAttributify(),
      presetIcons({ scale: 1.2 }),
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
  });