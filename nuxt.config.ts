// import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";
import { defineNuxtConfig } from "nuxt/config";
// import GeralService from "./src/service/GeralService";
export default defineNuxtConfig({
  app: {
    baseURL: "/",
  },
  vite: {
    optimizeDeps: {
      include: ["fast-deep-equal"],
    },
  },
  experimental: {
    inlineSSRStyles: false,
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ["EntidadeModal"].includes(tag),
    },
  },

  // vite: {
  //   optimizeDeps: {
  //     exclude: ["vue-demi"],
  //   }
  // },
  nitro: {
    preset: "node-server",
  },
  ssr: false,
  srcDir: "src",

  router: {
    options: {
      // hashMode: true,
    },
  },
  // build: {
  //   transpile: ["@fawmi/vue-google-maps"],
  // },
  modules: ["nuxt-quasar-ui", "@unocss/nuxt", "@pinia/nuxt", "dayjs-nuxt"],
  // @ts-ignore
  dayjs: {
    locales: ["en", "pt-br"],
    plugins: ["relativeTime", "utc", "timezone"],
    defaultLocale: "pt-br",
    defaultTimezone: "America/Sao_Paulo",
  },

  imports: {
    dirs: ["./stores"],
  },

  pinia: {
    autoImports: ["defineStore", "acceptHMRUpdate"],
  },

  // vite: {
  //   plugins: [
  //     obfuscatorPlugin({
  //       options: {
  //         // your javascript-obfuscator options
  //         compact: true,
  //         // controlFlowFlattening: false,
  //         // ...  [See more options](https://github.com/javascript-obfuscator/javascript-obfuscator)
  //       },
  //     }),
  //   ],
  // },
  runtimeConfig: {
    baseUrl: process.env.BASE_REST,
    baseS3: process.env.BASE_S3,
    public: {
      // baseUrl: GeralService.configuracoes.BASE_REST,
      // baseS3: GeralService.configuracoes.BASE_S3,
      // key: GeralService.configuracoes._urj
      baseUrl: process.env.BASE_REST,
      baseS3: process.env.BASE_S3,
      // key: process.env.KEY
    },
  },

  css: ["quasar/fonts", "quasar/animations", "quasar/icons", "quasar/css", "quasar/brand", "@/assets/css/app.scss"],

  // unocss: {
  //   uno: true,
  //   attributify: true,
  //   preflight: false,
  //   icons: true,
  //   wind: true,
  //   components: false,
  //   shortcuts: [
  //     [
  //       "btn",
  //       "px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50",
  //     ],
  //   ],
  // },
  quasar: {
    config: {
      dark: true,
      brand: {
        primary: "#3991e3",
        secondary: "#4eaee6",
        accent: "#d96900",
        dark: "#111827",
        positive: "#37b053",
        negative: "#bf3d4c",
        info: "#2bb1cc",
        warning: "#cf9700",
      },
    },
    sassVariables: true,
    lang: "pt-BR",
    plugins: ["Dialog", "Loading", "Notify", "Dark"],
    extras: {
      font: "roboto-font",
      fontIcons: ["material-icons", "fontawesome-v6"],
      animations: "all",
    },
  },

  devtools: {
    enabled: false,
  },
});
