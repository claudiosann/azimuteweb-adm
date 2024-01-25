<template>
  <div class="bg-violet-300 h-full text-violet-600 text-center q-pa-md row items-center justify-evenly">
    <q-input type="email" v-model="email"></q-input>
    <q-btn v-if="email" class="q-mt-xl" color="white" text-color="blue" unelevated @click="recuperarSenha()" label="Recuperar Senha" no-caps />
    <q-btn class="q-mt-xl" color="white" text-color="blue" unelevated to="/login" label="Voltar" no-caps />
  </div>
</template>

<script setup>
import { useQuasar } from "quasar";
const $q = useQuasar();
const email = ref("");
const runTimeConfig = useRuntimeConfig();

const recuperarSenha = async () => {
  $q.loading.show({
    message: "Validando informações... Aguarde!",
  });

  try {
    const ret = await $fetch(`${runTimeConfig.public.baseUrl}solicitaAlterarSenha`, {
      method: "post",
      body: { email: email.value },
    });
    console.log(ret);
    if (ret && ret.valido == false) {
      $q.loading.hide();
      $q.notify({
        position: "top-right",
        type: "negative",
        message: ret.data.message ? ret.data.message : "Parâmetros inválidos!",
        timeout: 5000,
      });
      return;
    } else if (ret && ret.valido == true) {
      $q.loading.hide();
      $q.notify({
        position: "top-right",
        type: "positive",
        message: "Solicitação enviada com sucesso! Verifique seu e-mail!",
        timeout: 5000,
      });
      return navigateTo("/login");
    }
  } catch (error) {}
  $q.loading.hide();
  $q.notify({
    position: "top-right",
    type: "negative",
    message: "Falha de comunicação!",
    timeout: 5000,
  });
};

definePageMeta({
  layout: "custom",
  middleware: "noauth",
});
</script>
