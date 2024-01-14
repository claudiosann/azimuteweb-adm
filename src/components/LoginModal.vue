<template>
    <q-dialog :persistent="true" ref="dialogRef" @hide="onDialogHide">
        <LoginBase @onOk="onDialogOK" :entidadeId="entidadeId" :modal="true" :mensagemNoLogin="mensagemNoLogin"></LoginBase>
    </q-dialog>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useDialogPluginComponent } from 'quasar';

const props = defineProps({
    listaVinculo: null,
    caminho: null,
    entidadeId: null,
});

const { $geralService } = useNuxtApp();
const $q = useQuasar();

defineEmits([
    ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

</script>

<style></style>
