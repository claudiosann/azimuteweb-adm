export default defineNuxtRouteMiddleware((to, from) => {
    const afterLoging = useCookie("afterLogin");
    if (!afterLoging.value && from.path!='/login') {
      afterLoging.value = from.path;
    }
})