<template>
<LoginBase :mensagemNoLogin="mensagemNoLogin"></LoginBase>
</template>
<script setup>
definePageMeta({
  layout: "custom",
  // middleware: "noauth",
});
const mensagemNoLogin = ref(null);
onBeforeMount(() => {
  const mensagemNoLoginC = useCookie("mensagemNoLogin");
  if (mensagemNoLoginC.value) {
    mensagemNoLogin.value = mensagemNoLoginC.value;
    setTimeout(() => {
      mensagemNoLoginC.value = undefined;
    }, 2000);
  }
});
</script >

<style></style>