<template>
  <q-dialog :persistent="true" ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 300px">
      <q-toolbar v-if="showBar" :class="$q.dark.isActive ? 'text-grey-2 bg-black-8' : 'bg-grey-2 text-grey-9'">
        <q-toolbar-title><span class="text-weight-bold"></span>Localizar Pessoa</q-toolbar-title>
      </q-toolbar>
      <q-card-section>
        <q-input class="q-mb-md" autofocus placeholder="Nome, Número CBO, CPF ou E-mail" outlined hint="Pressione ENTER para localizizar" label="Localizar" v-model="nome" @keyup.enter="buscarPessoa">
          <template v-slot:append>
            <q-btn @click="buscarPessoa" round dense color="primary" icon="search" />
          </template>
        </q-input>
        <q-list class="rounded-borders" separator bordered v-if="!muitosResultados && listaPessoas.length > 0" highlight
          inset-separator>
          <q-item clickable v-ripple @click="confirm(pessoa)" v-for="(pessoa) in listaPessoas" :key="pessoa._id">
            <q-item-section avatar>
              <q-avatar size="64px">
                <q-img :src="getUrlImagem(pessoa)"></q-img>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ pessoa.nome }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
import { useDialogPluginComponent } from 'quasar';

const props = defineProps({
  showBar: { type: Boolean, default: true },
});

defineEmits([
  ...useDialogPluginComponent.emits
])

const { $geralService } = useNuxtApp()

const $q = useQuasar();

const listaPessoas = ref<any>([]);
const muitosResultados = ref(false);
const nome = ref('');



const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const getUrlImagem = (pessoa: any) => {
  return $geralService.getUrlS3Thumb(pessoa.foto, {
    height: 128
  });
};


const isNumeric = (n: any) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
const validateEmail = (email: any) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
const getFiltro = () => {
  const filtro:any = {};
  if (nome.value.length > 0) {
    if (isNumeric(nome.value)) {
      if (nome.value.length === 11) {
        filtro.cpf = nome.value;
      } else {
        filtro.rg = {
          $regex: '.*' + nome.value + '.*'
        };
      }
    } else {
      if (validateEmail(nome.value)) {
        filtro.email = {
          $regex: '.*' + nome.value + '.*'
        };
      } else {
        filtro.nome = {
          $regex: '.*' + nome.value + '.*', $options: 'i'
        };
      }
    }
  }
  console.log(filtro);
  return filtro;
}

const buscarPessoa = async () => {
  if (nome.value) {
    try {
      const ret = await useCustomFetch('buscarPessoa', 'post', {
        filtro: getFiltro(),
        maxRetorno: 10
      }, undefined);
      if (ret.valido) {
        muitosResultados.value = false;
        listaPessoas.value = ret.data;
      } else {
        if (ret.data.erroMaxRetorno) {
          muitosResultados.value = true;
        } else {
          console.error(ret);
          $q.notify({
            position: 'top',
            icon: 'error',
            color: 'negative',
            message: 'Falha ao buscar pessoas!'
          });
          muitosResultados.value = false;
        }
        listaPessoas.value = [];
      }
    } catch (error) {
      console.error(error);
      $q.notify({
        position: 'top',
        icon: 'error',
        color: 'negative',
        message: 'Erro de comunicação!'
      });
    }
  } else {
    listaPessoas.value = [];
  }
}

// GO confirm
const confirm = (pessoa: any) => {
  onDialogOK(pessoa)
};
</script>

