<template>

<ExpansionItem v-model="grupoLink.expanded"  :erroPadrao="v$.$error" class="shadow-1 mb-2" :rounded="true"  :titulo="grupoLink.descricao" :icon="grupoLink.icone">
  <div class="row q-col-gutter-sm">
          <span class="col-sm-6 col-12">
            <q-input ref="descricao" autofocus hide-bottom-space outlined v-model="grupoLink.descricao"
              label="Descrição do Grupo" @blur="v$.descricao.$touch()" :error="v$.descricao.$error"
              error-message="Campo obrigatório" />
          </span>
          <span class="col-sm-6 col-12">
            <q-select outlined v-model="grupoLink.icone" label="Ícone do Grupo" use-input input-debounce="100"
              behavior="menu" @filter="filterFn" :options="listaIcones" @blur="v$.icone.$touch()" :error="v$.icone.$error"
              error-message="Campo obrigatório">
              <template v-slot:prepend>
                <q-icon :name="grupoLink.icone" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ scope.opt }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No results </q-item-section>
                </q-item>
              </template></q-select>
          </span>
        </div>
        <!-- GO Links -->
        <div class="row q-mb-sm">
          <q-btn btn-scale label="Inserir Link"  color="primary" @click="inserirLink(index)" icon="add"></q-btn>
        </div>
        <div class="q-mb-sm" v-for="(documento, indexLink) in grupoLink.links" :key="'link_' + indexLink">
          <div class="row q-col-gutter-sm">
            <span class="col-sm-3 col-12">
              <q-input ref="descricao" autofocus hide-bottom-space outlined v-model="documento.descricao"
                label="Descrição do Anexo" :error="!documento.descricao" error-message="Campo obrigatório" />
            </span>
            <span class="col-sm col-12">
              <q-input ref="url" hide-bottom-space outlined v-model="documento.url" label="Url" :error="!documento.url"
                error-message="Campo obrigatório">
                <template v-slot:append>
                  <q-btn btn-scale @click="abrirGerenciadorArquivo(indexLink)" color="primary" round dense icon="search">
                    <q-tooltip>Abre o gerenciador de arquivos</q-tooltip>
                  </q-btn>
                </template>
              </q-input>
            </span>
            <span class="col-sm-auto">
              <q-btn btn-scale style="margin-top: 12px" @click="excluirLink(index, indexLink)" color="negative" round dense
                icon="delete">
                <q-tooltip>Excluir Link</q-tooltip>
              </q-btn>
            </span>
          </div>
        </div>
        <div class="col-12 q-mt-md">
          <q-btn btn-scale color="red" outline @click="excluirGrupoLink" :label="'Excluir Grupo '" icon="delete">
            <q-tooltip>Excluir Grupo</q-tooltip>
          </q-btn>
        </div>
</ExpansionItem>
</template>

<script setup lang="ts">
import icones from '../service/iconawesome';
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';
import GerenciadorArquivoModal from "./GerenciadorArquivoModal.vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  id: {
    type: String,
    default: null,
  },
  index: {
    type: Number,
    default: null,
  },
  collectionName: {
    type: String,
    default: null
  },
});

const grupoLink: any = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const rules = {
  descricao: {
    required
  },
  icone: {
    required
  },
  links: {
    $each: helpers.forEach({
      descricao: {
        required
      },
      url: {
        required
      }
    })
  }
};
const $q = useQuasar();

const listaIcones = ref<any>(icones);

const emit = defineEmits(["update:modelValue", "onExcluirGrupoLink"]);

const v$ = useVuelidate(rules, grupoLink, { $autoDirty: true });

const indexLink = ref<number>(-1);

const geral = useGeral();


const filterFn = (val: any, update: Function) => {
  if (val === '') {
    update(() => {
      listaIcones.value = icones;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    listaIcones.value = icones.filter((v) => v.toLowerCase().indexOf(needle) > -1);
  });
};

const inserirLink = (index: number) => {
  grupoLink.value.links.push({});
};

const excluirLink = (indexGrupo: number, indexLink: number) => {
  $q.dialog({
    title: 'Confirmação',
    message: `Deseja realmente excluir o link ${grupoLink.value.links[indexLink].descricao}? Os documentos permanecerão no gerenciador de arquivos.`,
    focus: 'cancel',
    ok: {
      color: 'primary',
      label: 'sim'
    },
    cancel: {
      color: 'negative',
      label: 'Não'
    }
  }).onOk(async () => {
    grupoLink.value.links.splice(indexLink, 1);
  });
};

const excluirGrupoLink = () => {
  emit("onExcluirGrupoLink", props.index);
}

const confirmGerenciadorArquivo = (url: String) => {
  console.log(indexLink.value);
  grupoLink.value.links[indexLink.value].url = url;
};
onMounted(() => {
  v$.value.$touch();
});

const abrirGerenciadorArquivo = (iLink: number) => {
  indexLink.value = iLink;
  console.log(indexLink.value);
  $q.dialog({
    component: GerenciadorArquivoModal,
    persistent: true,
    componentProps: {
      multiple: true,
      travarCaminhoUpload: false,
      travarDeletar: true,
      caminhoInicial: `/${props.collectionName}`,
      raiz: `${geral.entidade._id}`
    },
  })
    .onOk(async (data) => {
      // console.log(data);
      confirmGerenciadorArquivo(data);
    })
    .onCancel(() => { });
}

</script>

<style scoped lang="scss"></style>
