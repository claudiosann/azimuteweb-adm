<template>
  <!-- <div class="bg-violet-300 h-full text-violet-600 text-center q-pa-md row items-center justify-evenly">
    <q-input outlined type="email" v-model="email"></q-input>
    <q-btn v-if="email" class="q-mt-xl" color="white" text-color="blue" unelevated @click="recuperarSenha()" label="Recuperar Senha" no-caps />
    <q-btn class="q-mt-xl" color="white" text-color="blue" unelevated to="/login" label="Voltar" no-caps />
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
            <q-input ref="passInput" outlined class="full-width mb-6" :type="isPwd ? 'password' : 'text'" v-model="senha" label="Nova Senha" error-message="Nova Senha é obrigatória e maior que 4 caracteres." :error="!senha || senha.length < 4">
              <template v-slot:append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="mostrarSenha()" />
              </template>
            </q-input>
            <q-input ref="passInput2" outlined class="full-width" :type="isPwd2 ? 'password' : 'text'" v-model="confirmaSenha" label="Confirma Nova Senha" error-message="Confirma Nova Senha é obrigatória, maior que 4 caracteres e deve ser igual a Nova Senha." :error="!confirmaSenha || confirmaSenha.length < 4 || senha != confirmaSenha">
              <template v-slot:append>
                <q-icon :name="isPwd2 ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="mostrarSenha2()" />
              </template>
            </q-input>
            <div class="row text- full-width flex justify-end q-mb-md">
              <q-btn v-if="confirmaSenha && confirmaSenha.length > 3 && senha == confirmaSenha" push rounded-md h-11 class="" style="margin-top: 20px" color="light-blue" icon="key" label="Recuperar Senha" @click="alterarSenha()"></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from "quasar";
import md5 from "js-md5";
const $q = useQuasar();
const route = useRoute();
const runTimeConfig = useRuntimeConfig();
const senha = ref("");
const confirmaSenha = ref("");

const isPwd = ref(true);
const isPwd2 = ref(true);

const passInput = ref(null);
const passInput2 = ref(null);

const alterarSenha = async () => {
  const ret = await $fetch(`${runTimeConfig.public.baseUrl}alterarSenha`, {
    method: "post",
    body: {
      novaSenha: md5(senha.value),
      chave: route.params.chave,
    },
  });
  if (ret && ret.valido) {
    $q.notify({
      position: "center",
      type: "positive",
      message: "Senha altera com sucesso!",
      timeout: 5000,
    });
    navigateTo("/login");
  } else {
    $q.notify({
      position: "top-right",
      type: "negative",
      message: ret.data.message ? ret.data.message : "Falha ao criar senha!",
      timeout: 5000,
    });
  }
};

const mostrarSenha = () => {
  if (isPwd.value) {
    isPwd.value = false;
    setTimeout(() => {
      isPwd.value = true;
    }, 3000);
  } else {
    isPwd.value = true;
  }
  try {
    passInput.value.$el.focus();
    window.getSelection().selectAllChildren(passInput.value.$el);
    window.getSelection().collapseToEnd();
  } catch (error) {}
};
const mostrarSenha2 = () => {
  if (isPwd2.value) {
    isPwd2.value = false;
    setTimeout(() => {
      isPwd2.value = true;
    }, 3000);
  } else {
    isPwd2.value = true;
  }
  try {
    passInput2.value.$el.focus();
    window.getSelection().selectAllChildren(passInput2.value.$el);
    window.getSelection().collapseToEnd();
  } catch (error) {}
};

definePageMeta({
  layout: "custom",
  middleware: "noauth",
});
</script>
