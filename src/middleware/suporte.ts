export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $geralService } = useNuxtApp();
  const yul = $geralService.configuracoes._urj;
  let usuario: any = useCookie("__oir");
  const geral = useGeral();
  if (!usuario.value) {
    const afterLoging = useCookie("afterLogin");
    const mensagemNoLogin = useCookie("mensagemNoLogin");
    // const toast = useToast();
    // isAuthenticated() is an example method verifying if a user is authenticated
    afterLoging.value = to.path;
    mensagemNoLogin.value = "1";
    return navigateTo("/login");
  } else {
    const delay = (t: number) => new Promise((r) => setTimeout(r, t));
    const geral = useGeral();
    if (geral && geral.pessoa && geral.pessoa._id === "5aff4d2f47667633c7ace227") {
      let vinculo: any = useCookie("__olu");
      let token: any = useCookie("__bew");
      let tkMaster: any = useCookie("__ret");
      if (await revalidateToken(token.value, tkMaster.value, yul, geral.pessoa._id)) {
        // console.log("token validado");
      } else {
        // // console.log("token inválido");
        // console.log("aquijjjjjjjjj");
        geral.reset();
        usuario.value = undefined;
        token.value = undefined;
        vinculo.value = undefined;
        usuario = undefined;
        token = undefined;
        vinculo = undefined;
        return navigateTo("/login");
      }
    }
  }
});
