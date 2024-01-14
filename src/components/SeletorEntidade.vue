<template>
  <q-dialog :persistent="true" ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 300px">
      <q-toolbar :class="$q.dark.isActive ? 'text-grey-2 bg-black-8' : 'bg-grey-2 text-grey-9'">
        <q-toolbar-title><span class="text-weight-bold"></span> Selecione Uma Entidade</q-toolbar-title>
         <q-btn round glossy push class="btn-scale" @click="cancel"
                       color="red" icon="close" />
      </q-toolbar>

      <q-card-section>
        <q-list>
          <q-item clickable v-ripple @click="confirm(entidade)" v-for="entidade in listaEntidade" :key="entidade._id">
            <q-item-section avatar>
              <q-avatar rounded>
                <img :src="getUrlImagem(entidade)" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ entidade.sigla }}</q-item-label>
              <q-item-label side right>{{ entidade.nomeRazao }}</q-item-label>
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
  listaEntidade: null,
});

const { $geralService } = useNuxtApp();
const $q = useQuasar();

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const getUrlImagem = (entidade) => {
  return $geralService.getUrlS3Thumb(entidade.logo, { height: 64 });
};

const cancel = async () => {
  onDialogCancel();
  return;
};

// GO confirm
const confirm = (entidade) => {
  onDialogOK(entidade)
};


</script>


