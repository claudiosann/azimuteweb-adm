export default defineEventHandler(async (event) => {
  const tkMaster = getCookie(event, "tkMaster");
  const usuario = getCookie(event, "__oir");
  const runTimeConfig = useRuntimeConfig();
  const { $geralService } = useNuxtApp();
  const yul = $geralService.configuracoes._urj;
 // const body = await readBody(event);
    if (tkMaster && usuario) {
      // console.log("Ravalidate ");
      const ret = await $fetch(`${runTimeConfig.public.baseUrl}revalidate`, {
        method: "post",
        body: {
          id: JSON.parse(decode(usuario, yul))._id,
        },
        headers: { "x-access-token": tkMaster },
      });
      return ret;
    } else {
      return { valido: false, data: { message: "Token inválido" } };
    }
  
});
