<script setup>
definePageMeta({
  layout: 'custom',
});
</script>
<template>
  <div
    class="fullscreen text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">Oops. Nada foi encontrado...</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Voltar para o início"
        no-caps
      />
    </div>
  </div>
</template>