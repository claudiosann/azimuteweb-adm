import GeralService from "../service/GeralService";
import constantes from "../service/constantes";

export default defineNuxtPlugin(() => {
    return {
      provide: {
        geralService: GeralService,
        constantes: constantes
      }
    }
  })