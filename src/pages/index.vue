<template>
  <div class="h-full text-center q-pa-md">
    <h1 class="mt-1 p-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-4xl font-extrabold tracking-tighter text-transparent sm:text-5xl lg:text-7xl">Bem-vindo(a), {{ geral.pessoa.apelido }}!</h1>
    <div>
      <p class="text-xl">
        O sistema encontra-se numa fase de implantação e configuração. Ocorreu uma grande migração de dados da plataforma antiga e ainda estamos trabalhando para que tudo fique perfeito.
        <br />
      </p>
      <hr />
      <p>
        No lugar dessa tela de boas-vindas, em breve você verá a tela de Dashboard com os dados estatísticos da entidade de acordo com o seu perfil de acesso.
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});

const geral = useGeral();

</script>
