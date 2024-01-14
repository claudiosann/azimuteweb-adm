<template>
    <div class="text-xl text-bold m-2 ">Teste de Api Banco Inter</div>
    <q-btn m-2 color="primary" icon="search" label="Consultar Extrato" @click="consultarExtrato" />
    <q-btn m-2 color="primary" icon="search" label="Consultar Saldo" @click="consultarSaldo" />
    <pre>Saldo: {{ saldo }}</pre>
    <pre>Estrato: {{ extrato }}</pre>
</template>

<script setup lang="ts">

const extrato = ref<any>(null);
const saldo = ref<any>(null);

const consultarExtrato = async () => {
    const ret = await useCustomFetch('extratoRead', 'post', {dataInicio: '2021-09-01', dataFim: '2021-09-27'}, null);
    if (ret.valido) {
        extrato.value = ret.data;
    } else {
        extrato.value = null;
    }
}
const consultarSaldo = async () => {
    const ret = await useCustomFetch('saldoRead', 'post', {}, null);
    if (ret.valido) {
        saldo.value = ret.data;
    } else {
        saldo.value = null;
    }
}

</script>