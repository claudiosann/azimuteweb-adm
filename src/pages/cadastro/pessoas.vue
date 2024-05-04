<template>
   <div class="container mx-auto p-1 sm:p-4">
   <q-grid v-if="rows" :data="rows" :columns="columns" :columns_filter="true" :pagination="initialPagination" rows-per-page-label="Registros por página:">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
            :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
            <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-l from-fuchsia-500 to-fuchsia-700"
                          name="person" size="30px" />
            <q-toolbar-title><span class="mr-3 text-weight-medium">Pessoas</span></q-toolbar-title>
          </q-toolbar>
        
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="nome"> <q-img v-if="props.row.foto" class="rounded-borders" style="width: 32px;" :ratio="32 / 32" :src="getUrlImagemThumb(props.row.foto)"></q-img> {{ props.row.nome }} </q-td>
          <q-td key="nascimento"> {{ $geralService.getDataFormatada(props.row.nascimento) }} </q-td>
          <q-td key="cpf"> {{ props.row.cpf }} </q-td>
          <q-td key="created_at">{{ props.row.email }}</q-td>
          <q-td key="action">
            <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu>
                <q-list separator link>
                  <q-item>
                    <div class="row content-center">
                      <span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}
                    </div>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.entidadeInserir" clickable v-close-popup
                    @click="editRow(props.rowIndex, props.row._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="amber-7" text-color="white" icon="edit" />
                    </q-item-section>
                    <q-item-section avatar> Editar </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="deleteRow(props.rowIndex, props.row._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="red-7" text-color="white" icon="delete" />
                    </q-item-section>
                    <q-item-section>
                      Deletar
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-grid>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "suporte",
});

import { useQuasar, QSpinnerOval } from "quasar";
import { useGeral } from '../../stores/geral';
import PessoaModal from "../../components/cadastro/PessoaModal.vue";


const $q = useQuasar();
const { $geralService } = useNuxtApp()
const geral = useGeral();
const inserir = ref(false);
const idSelecionado = ref({});
const indexSelecionado = ref(-1);
const rows = ref([]);
const initialPagination = ref({
  page: 1,
  rowsPerPage: 10
});

const columns = ref([{
  name: 'nome',
  required: true,
  label: 'Nome',
  align: 'left',
  field: 'nome',
  sortable: true
},
{
  name: 'nascimento',
  required: true,
  label: 'Nascimento',
  align: 'left',
  field: 'nascimento',
  sortable: true
},
{
  name: 'cpf',
  required: true,
  label: 'CPF',
  align: 'left',
  field: 'cpf',
  sortable: true
},
{
  name: 'email',
  label: 'E-Mail',
  align: 'left',
  field: 'email',
  sortable: true
},
{
  name: 'action',
  label: 'Ação',
  align: 'left',
  field: '',
  sortable: false
}
]);

onMounted(() => {
  getList();
});

const getUrlImagemThumb = (caminho) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: 128
  })
}

const getList = async () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Buscando Dados... Aguarde!",
    messageColor: "white",
  });

  try {
    const ret = await useCustomFetch(
      "pessoa/getPopulate",
      "post",
      {
        filtro: {
          lixo: false,
        },
      },
      undefined
    );

    // // console.log('Leu o Banco de dados.');
    if (ret.valido) {
      rows.value = ret.data;
      $q.loading.hide();
    } else {
      rows.value = [];
      // console.log(ret.data);
      $q.loading.hide();
      $q.notify({
        color: "negative",
        message: ret.data && ret.data.message ? ret.data.message : "Falha ao obter a lista de pessoas!",
      });
    }
  } catch (error) {
    $q.loading.hide();
  }
}

const deleteRow = async (index, id) => {
  if (geral.funcoesAcessos.pessoaDeletar) {
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Deletando Registro... Aguarde!",
      messageColor: "white",
    });
    const ret = await useCustomFetch("pessoa/delete", "post", { _id: id }, undefined);
    $q.loading.hide();
    if (ret.valido) {
      $q.notify({
        type: "positive",
        position: "top",
        message: "Registro excluído com sucesso!",
      });
      rows.value.splice(index, 1);
    } else {
      // console.log(ret.data);
      $q.notify({
        type: "warning",
        message: "Falha ao deletar." + ret.data.message,
      });

    }
  } else {
    $q.notify({
      type: "warning",
      message: "Você não tem acesso para deletar este registro!",
    });
  }
};

const editRow = (index, id, copy) => {
  if (geral.verificaAcesso("pessoaEditar")) {
    openModal(index, id, copy);
  }
};
const insertRow = () => {
  if (geral.verificaAcesso("pessoaInserir")) {
    openModal(-1, null);
  }
};

const openModal = (index, id, copy) => {
  // <acesso-sistema-cadastro v-on:confirmSave="confirmSave" v-if="show"  :inserir="inserir" :acesso-sistema-id="idSelecionado"></acesso-sistema-cadastro>
  if (index > -1 && id) {
    inserir.value = false;
    idSelecionado.value = id;
    indexSelecionado.value = index;
  } else {
    inserir.value = true;
    idSelecionado.value = null;
    indexSelecionado.value = -1;
  }

  $q.dialog({
    component: PessoaModal,
    persistent: true,
    componentProps: {
      copia: copy,
      inserir: inserir.value,
      id: idSelecionado.value,
    },
  })
    .onOk(async (data) => {
      confirmSave(data);
    })
    .onCancel(() => { });
}

const confirmSave = (obj) => {
  if (inserir.value) {
    rows.value.push(obj);
    $q.loading.hide();
  } else {
    //getList();
  }
  indexSelecionado.value = -1;
};

</script>

<style>
/* .fullscreen {
    z-index: 999;
}

.q-header,
.q-drawer,
.q-footer {
    z-index: 998;
} */

.options {
  padding: 20px;
  margin-top: 20px;
  background-color: rgba(191, 191, 191, 0.15);
}

.caption {
  font-size: 18px;
  font-weight: 500;
}

.option {
  margin-top: 10px;
}

.option>span {
  margin-right: 10px;
}

.option>.dx-selectbox {
  display: inline-block;
  vertical-align: middle;
}
</style>
