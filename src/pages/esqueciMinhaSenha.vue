<template>
  <!-- <div class="bg-gradient-to-tr from-violet-500 via-red-500 to-green-500 h-full row items-center justify-evenly">
    <div>
      <span class="text-lg">Digite o e-mail cadastrado</span>
      <q-input class="w-80" outlined type="email" label="E-mail" v-model="email"></q-input>
      <div class="flex gap-3 mt-3">
        <q-btn icon="sync_lock" :disable="email"  color="white" text-color="blue" unelevated @click="recuperarSenha()" label="Recuperar Senha" no-caps />
        <q-btn icon="undo"  color="white" text-color="blue" unelevated to="/login" label="Voltar" no-caps />
      </div>
    </div>
  </div> -->
  <div class="row items-center justify-evenly h-full">
        <div class="grid justify-center">
            <q-card class="q-ma-md !rounded-xl">
                <q-card-section>
                    <div class="row justify-center text-lg text-gray-600 dark:text-gray-200">Plataforma</div>
                    <div class="row justify-center">
                        <div class="row"><img style="max-height: 50px" src="https://azimuteweb.s3.sa-east-1.amazonaws.com/nova_logo.svg" class="image mb-2xl" /></div>
                    </div>
                    <div style="width: 100%; max-width: 360px" class="row justify-center">
                        <q-input outlined class="full-width q-mb-md" input-class="rounded-md" v-model="email"
                            label="E-mail" error-message="E-mail" :error="!email" />
                        <div class="row text- full-width flex justify-between q-mb-md">
                          
                            <q-btn flat rounded-md h-11 class=" ml" style="margin-top: 20px" color="white" text-color="blue" icon="undo"
                                label="Voltar" to="/login"></q-btn>
                            <q-btn push rounded-md h-11 class="" style="margin-top: 20px" color="light-blue" icon="sync_lock"
                                label="Recuperar Senha" @click="recuperarSenha()"></q-btn>
                        </div>
                        
                    </div>
                </q-card-section>
            </q-card>
        </div>
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
    // console.log(ret);
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
