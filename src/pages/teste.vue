<template>
  <div class="container mx-auto">
    <banner direction="bg-gradient-to-r" to="to-violet-400" from="from-red-500" padding="pa-0.5">
      <div class="w-10 h-10 bg-red-500 rounded-md dark:bg-blue-200">Teste</div>
      <ClientOnly placeholder="Carregando Botões">
        <q-btn push round class="bg-red-700 text-white dark:bg-blue-200 dark:!text-black" glossy icon="shopping_cart" />
        <q-btn push class="!bg-gradient-to-br !from-yellow-500 !to-green-500 text-white" label="Teste" />
        <q-btn push class="!bg-gradient-to-br !from-blue-500 !to-blue-800 text-white" @click="testeImageUpload()" label="Image" />
        <QBtn color="secondary" label="Secondary" />
        <button
          class="bg-orange-800 hover:bg-violet-700 rounded-xl text-white border-none q-button p-2 cursor-pointer glossy">Cancelar</button>
        <q-btn
          class="bg-gradient-to-r from-gray-600 to-green-500 rounded-lg text-yellow-200 font-bold uppercase border-none q-button p-2 cursor-pointer">Cancelar</q-btn>
        <div></div>
        <LazyQBtn color="amber" glossy label="Amber" />
      </ClientOnly>
    </banner>
    <calendario :isoData="new Date().toISOString()" cor="red" tamanho="100"></calendario>
    <div class="card">
      <h5>Icons</h5>
      <h1 class="text-blue-600">
        Icons by UnoCSS
      </h1>
      <div class="i-logos-vue text-6xl" />
      <h3>Iconset: MDI</h3>
      <div class="mt-6 grid grid-cols-3">
        <div class="i-mdi-information text-4xl text-green-600-500-500" />
        <div class="i-mdi-alarm text-4xl text-blue-500" />
        <div class="i-mdi-github-circle text-4xl text-purple-500" />
      </div>
      <h3>Iconset: TWEMOJI</h3>
      <div class="mt-6 grid grid-cols-3">
        <div class="i-twemoji-1st-place-medal text-4xl" />
        <div class="i-twemoji-2nd-place-medal text-4xl" />
        <div class="i-twemoji-3rd-place-medal text-4xl" />
      </div>
      <h3>Iconset: Prime</h3>
      <div class="mt-6 grid grid-cols-3">
        <div class="i-prime-home text-4xl" />
        <div class="i-prime-comments text-4xl text-green-400" />
        <div class="i-prime-check-circle" />
      </div>
      <div class="q-pa-md" style="max-width: 300px">
      <q-input filled v-model="date" mask="##/##/####" :rules="['date']">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="date">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

    </div>
    <CinputDate label="Teste" :outlined="true"></CinputDate>
    </div>
  </div>
</template>

<script setup>
import ImageUpload2 from "../components/ImageUpload2.vue";
import { Dialog } from "quasar";


definePageMeta({
  middleware: "auth",
});

const testeImageUpload = () => {
   Dialog.create({
    component: ImageUpload2,
    persistent: true,
     componentProps: {
     
    },
  }).onOk(async (ret) => {
    // console.log("Image Retorno", ret.data);
    // console.log("fileName Retorno", ret.fileName);
  });
}

const date = ref('01/02/2019');

</script>
