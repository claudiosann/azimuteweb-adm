<template>
   <div  class="bg-violet-300 h-full text-violet-600 text-center q-pa-md row items-center justify-evenly">
    <h3>Esqueci minha senha</h3>
    <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/login"
        label="Voltar"
        no-caps
      />
  </div>
</template>

<script setup>
definePageMeta({
  layout: "custom",
  middleware: "noauth"
});

</script>
