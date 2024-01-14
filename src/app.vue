<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// const vinculoC = useCookie("__olu");
onBeforeMount(async () => {
  const { $geralService } = useNuxtApp();
  const yul = $geralService.configuracoes._urj;
  const usuarioC = useCookie("__oir");
  const token = useCookie("__bew");
  const vinculo = useCookie("__olu");
  const tkMaster = useCookie("__ret", {
    default: () => "",
  });
  const geral = useGeral();
  if (usuarioC.value && vinculo.value) {
    let pessoa = JSON.parse(decode(usuarioC.value, yul));
    geral.setPessoa(pessoa);
    geral.setPessoa(JSON.parse(decode(usuarioC.value, yul)));
    geral.setToken(token.value);
    if (await revalidateToken(token.value, tkMaster.value, yul, geral.pessoa._id)) {
      const vinculoDec = JSON.parse(decode(vinculo.value, yul));
      pessoa.vinculo = vinculoDec;
      geral.setPessoa(pessoa);
      geral.setEntidade(vinculoDec.entidade);
      geral.setFuncoesSistema(vinculoDec);
      geral.setFuncoesSistema(vinculoDec);
    } else {
      geral.reset();
      usuarioC.value = null;
      token.value = "";
      vinculo.value = "";
      return navigateTo("/login");
    }
  }
});
</script>

<!-- <style>
@import '@unocss/reset/tailwind.css';
</style> -->