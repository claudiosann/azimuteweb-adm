
export default defineNuxtRouteMiddleware(async (to, from) => {
   const usuario = useCookie("__oir");
  if (usuario.value) {
          return navigateTo('/')
    }
})