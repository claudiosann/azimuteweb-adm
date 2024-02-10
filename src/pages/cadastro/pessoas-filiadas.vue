<template>
  <div class="container mx-auto p-1 sm:p-4">
    <q-grid v-if="rows" :data="rows" :columns="columns" :columns_filter="true" :pagination="initialPagination" rows-per-page-label="Registros por página:">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg rounded-tr-lg" :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <span class="ml-3 px-1.5 py-1 rounded text-white bg-gradient-to-l from-emerald-500 to-emerald-700"><q-icon name="fas fa-id-card" size="25px" /></span>
          <q-toolbar-title><span class="mr-3 text-weight-medium">Pessoas Filiadas</span></q-toolbar-title>
        </q-toolbar>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="nome"> <q-img v-if="props.row.pessoa.foto" class="rounded-borders" style="width: 32px" :ratio="32 / 32" :src="getUrlImagemThumb(props.row.pessoa.foto)"></q-img> {{ props.row.pessoa.nome }} </q-td>
          <q-td key="status">
            <q-badge :color="getCorStatus(props.row.status)">{{ props.row.status }}</q-badge></q-td
          >
          <q-td key="numero"> {{ props.row.numero }} </q-td>
          <q-td key="dataPedido"> {{ $geralService.getDataFormatada(props.row.dataPedido, "DD/MM/YYYY HH:mm") }} </q-td>
          <q-td key="dataFiliacao"> {{ $geralService.getDataFormatada(props.row.dataFiliacao) }} </q-td>
          <q-td key="action">
            <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu>
                <q-list separator link>
                  <q-item>
                    <div class="row content-center"><span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}</div>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.filiacaoAcessar" clickable v-close-popup @click="editRow(props.rowIndex, props.row._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="amber-7" text-color="white" icon="edit" />
                    </q-item-section>
                    <q-item-section avatar> Editar </q-item-section>
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
  middleware: "auth",
});

import { useQuasar, QSpinnerOval } from "quasar";
import { useGeral } from "../../stores/geral";
import PessoaFiliadaModal from "../../components/cadastro/PessoaFiliadaModal.vue";

const $q = useQuasar();
const { $geralService } = useNuxtApp();
const geral = useGeral();
const inserir = ref(false);
const idSelecionado = ref({});
const indexSelecionado = ref(-1);
const rows = ref([]);
const initialPagination = ref({
  page: 1,
  rowsPerPage: 10,
});

const columns = ref([
  {
    name: "nome",
    required: true,
    label: "Nome",
    align: "left",
    field: "pessoa.nome",
    sortable: true,
  },
  {
    name: "status",
    required: true,
    label: "Status",
    align: "left",
    field: "status",
    sortable: false,
    filtro: "",
    filter_type: "select",
    column_options: ["Iniciada", "Em Análise", "Aguardando Pagamento", "Ativa", "Recusada", "Cancelada", "Desativada"],
  },
  {
    name: "numero",
    required: true,
    label: "Número",
    align: "left",
    field: "numero",
    sortable: true,
  },
  {
    name: "dataPedido",
    required: true,
    label: "DT Pedido",
    align: "left",
    field: "dataPedido",
    sortable: true,
  },
  {
    name: "dataFiliacao",
    required: true,
    label: "DT Filiação",
    align: "left",
    field: "dataFilicao",
    sortable: true,
  },
  {
    name: "action",
    label: "Ação",
    align: "left",
    field: "",
    filter_type: "none",
    sortable: false,
  },
]);

onMounted(() => {
  getList();
});

const getUrlImagemThumb = (caminho) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: 128,
  });
};

const getCorStatus = (status) => {
  switch (status) {
    case "Ativa":
      return "positive";
    case "Em Análise":
      return "warning";
    case "Aguardando Pagamento":
      return "teal";
    case "Iniciada":
      return "primary";
    case "Recusada":
      return "negative";
    case "Cancelada":
      return "grey";
    case "Desativada":
      return "blue-grey";
    default:
      return "red";
  }
};

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
      "filiacaoPessoa/getPopulate",
      "post",
      {
        filtro: {
          entidade: geral.entidade._id,
        },
        populateObj: [
          {
            path: "pessoa",
            select: {
              nome: 1,
              apelido: 1,
              nascimento: 1,
              email: 1,
              foto: 1,
            },
          },
        ],
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
};

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
  // console.log("editRow", index, id, copy);
    openModal(index, id, copy);
};
const insertRow = () => {
    openModal(-1, null);
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
    component: PessoaFiliadaModal,
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
    .onCancel(() => {});
};

const confirmSave = (obj) => {
  if (inserir.value) {
    rows.value.push(obj);
    $q.loading.hide();
  } else {
    getList();
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

.option > span {
  margin-right: 10px;
}

.option > .dx-selectbox {
  display: inline-block;
  vertical-align: middle;
}
</style>
