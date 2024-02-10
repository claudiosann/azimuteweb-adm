<template>
  <div class="container mx-auto p-1 sm:p-4">
    <q-table :rows="rows" :columns="columns" row-key="name" color="secondary" :pagination="initialPagination" rows-per-page-label="Registros por página:">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg rounded-tr-lg" :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-green-700 to-red-400" name="currency_exchange" size="30px" />
          <q-toolbar-title><span class="mr-3 text-weight-medium">Repasses</span></q-toolbar-title>
          <!-- <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir"
            v-if="geral.funcoesAcessos.repasseInserir" @click="insertRow" aria-label="Menu Sistema" icon="add">
            <q-tooltip>Inserir Novo Registro</q-tooltip>
          </q-btn> -->
        </q-toolbar>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="sequencial">{{ props.row.sequencial }}</q-td>
          <q-td key="dataSolicitacao">{{ $geralService.getDataHoraFormatada(props.row.dataSolicitacao) }}</q-td>
          <q-td key="dataRealizada">{{ $geralService.getDataHoraFormatada(props.row.dataRealizada) }}</q-td>
          <q-td key="valor">{{ $geralService.numeroParaMoeda(props.row.valor) }}</q-td>
          <q-td key="rateios">{{ props.row.rateios.length }}</q-td>
          <q-td key="status">{{ props.row.status }}</q-td>
          <q-td key="action">
            <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu>
                <q-list separator link>
                  <q-item>
                    <div class="row content-center"><span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}</div>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.repasseInserir" clickable v-close-popup @click="editRow(props.rowIndex, props.row._id)">
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
    </q-table>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});
import { useQuasar, QSpinnerOval } from "quasar";
// import pagamentoMovimentacaoModal from "@/components/cadastro/financeiro/pagamentoMovimentacaoModal.vue";
import { useGeral } from "@/stores/geral";

const $q = useQuasar();
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
    name: "sequencial",
    label: "Número",
    align: "left",
    field: "sequencial",
    sortable: true,
  },
  {
    name: "dataSolicitacao",
    label: "Data Solicitação",
    align: "left",
    field: "dataSolicitacao",
    sortable: true,
  },
  {
    name: "dataRealizada",
    label: "Data da Transfêrencia",
    align: "left",
    field: "dataRealizada",
    sortable: true,
  },
  {
    name: "valor",
    label: "Valor",
    align: "left",
    field: "valor",
    sortable: true,
  },
  {
    name: "rateios",
    label: "Qdte Recebívels",
    align: "left",
    field: "rateios",
    sortable: true,
  },
  {
    name: "status",
    label: "Status",
    align: "left",
    field: "valorPadrao",
    sortable: true,
  },
  {
    name: "action",
    label: "Ação",
    align: "left",
    field: "",
    sortable: false,
  },
]);

onMounted(() => {
  getList();
});

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
      "pagamentoMovimentacao/getPopulate",
      "post",
      {
        filtro: {
          lixo: false,
          entidade: geral.entidade._id,
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
        message: ret.data && ret.data.message ? ret.data.message : "Falha ao obter a lista de acessos!",
      });
    }
  } catch (error) {
    $q.loading.hide();
  }
};


const editRow = (index, id, copy) => {
    openModal(index, id, copy);
};


const openModal = async (index, id, copy) => {
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

  // $q.dialog({
  //   component: pagamentoMovimentacaoModal,
  //   persistent: true,
  //   componentProps: {
  //     copia: copy,
  //     inserir: inserir.value,
  //     id: idSelecionado.value,
  //   },
  // })
  //   .onOk(async (data) => {
  //     confirmSave(data);
  //   })
  //   .onCancel(() => {});
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

<style scoped>
.truncate {
  width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
