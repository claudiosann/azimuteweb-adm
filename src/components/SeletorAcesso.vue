<template>
  <q-dialog :persistent="true" ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 300px">
      <q-toolbar :class="$q.dark.isActive ? 'text-grey-2 bg-black-8' : 'bg-grey-2 text-grey-9'">
        <q-toolbar-title><span class="text-weight-bold"></span> Selecione Uma Entidade</q-toolbar-title>
      </q-toolbar>

      <q-card-section>
        <q-list v-if="listaVinculo.length>0">
          <q-item clickable v-ripple @click="confirm(vinculo)" v-for="vinculo in listaVinculo" :key="vinculo._id">
            <q-item-section avatar>
              <q-avatar rounded>
                <img :src="getUrlImagem(vinculo)" />
              </q-avatar>
            </q-item-section>
            <q-item-section v-if="vinculo.entidade">
              <q-item-label lines="1">{{ vinculo.entidade.nomeFantasia }}</q-item-label>
              <q-item-label side right>{{ vinculo.tipoLigacao }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>

import { useQuasar } from "quasar";
import { useDialogPluginComponent } from 'quasar';

const props = defineProps({
  listaVinculo: null,
  caminho: null,
});

const { $geralService } = useNuxtApp();
const $q = useQuasar();

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const getUrlImagem = (vinculo) => {
  if(!vinculo || !vinculo.entidade || !vinculo.entidade.logo) return null;
  return $geralService.getUrlS3Thumb(vinculo.entidade.logo, { height: 64 });
};

// GO confirm
const confirm = (vinculo) => {
  onDialogOK(vinculo)
};

const confirm2 = ()  => {
      $q.dialog({
        title: 'Confirm',
        message: 'Would you like to turn on the wifi?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        // console.log('>>>> OK')
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

// // GO cancel
// const cancel = () => {
//   geral.setPessoa(null);
//   $q.notify({
//     position: "top-right",
//     type: "warning",
//     message: "Ação cancelada!",
//     timeout: 2000,
//   });
//   onDialogHide();
// };

</script>


