<template>
  <q-dialog :persistent="true" ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 300px">
      <q-toolbar :class="$q.dark.isActive ? 'text-grey-2 bg-black-8' : 'bg-grey-2 text-grey-9'">
        <q-toolbar-title><span class="text-weight-bold"></span> {{ titulo }}</q-toolbar-title>
         <q-btn round glossy push class="btn-scale" @click="cancel"
                       color="red" icon="close" />
      </q-toolbar>

      <q-card-section>
        <q-list>
          <q-item clickable v-ripple @click="confirm(obj)" v-for="obj in lista" :key="obj._id">
            <q-item-section v-if="fieldImagem" avatar>
              <q-avatar rounded>
                <img :src="getUrlImagem(obj)" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ obj[label] }}</q-item-label>
              <q-item-label v-if="caption" side right>{{ obj[caption] }}</q-item-label>
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
  lista: null,
  label: { type: String, default: 'descricao' },
  caption: { type: String, default: '' },
  fieldImagem: { type: String, default: '' },
  titulo: { type: String, default: 'Selecione uma Opção' }
});

const { $geralService } = useNuxtApp();
const $q = useQuasar();

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();


const getUrlImagem = (obj) => {
    return $geralService.getUrlS3Thumb(obj[props.fieldImagem], { height: 64 });
};

const cancel = async () => {
  onDialogCancel();
  return;
};

// GO confirm
const confirm = (obj) => {
  onDialogOK(obj)
};


</script>


