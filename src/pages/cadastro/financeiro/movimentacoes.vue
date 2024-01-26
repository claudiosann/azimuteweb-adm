<template>
  <div class="container mx-auto p-1 sm:p-4">
    <q-table :rows="rows" :columns="columns" row-key="name" color="secondary" :pagination="initialPagination"
      rows-per-page-label="Registros por página:">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
          :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-purple-700 to-orange-400" name="swap_horiz"
            size="30px" />
          <q-toolbar-title><span class="mr-3 text-weight-medium">Movimentações ( {{ rows.length }} )</span></q-toolbar-title>
          <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir"
            v-if="geral.funcoesAcessos.financeiroMovimentacaoInserir" @click="insertRow" aria-label="Menu Sistema"
            icon="add">
            <q-tooltip>Inserir Novo Registro</q-tooltip>
          </q-btn>

        </q-toolbar>

        <div class="mx-3 row col-12 text-xl">Filtro</div>
        <div class="pl-3 row q-col-gutter-sm col-12">
          <div class="col-12 col-md-3">
            <q-select hint="" v-model="conta" outlined label="Conta"
              option-label="descricao" emit-value map-options option-value="_id" :options="listaConta"/>
          </div>
          
          <div v-if="geral.funcoesAcessos.financeiroMovimentacaoAcessar && conta" class="col-12 col-md-2">
            <CinputDate  outlined v-model="inicio" label="Início" />
          </div>
          <div v-if="geral.funcoesAcessos.financeiroMovimentacaoAcessar && conta" class="col-12 col-md-2">
            <CinputDate outlined v-model="fim" label="Fim" />
          </div>
          <div class="col-12 col-md-3">
             <q-select clearable v-if="geral.funcoesAcessos.financeiroMovimentacaoAcessar && conta"  hide-bottom-space outlined
                          v-model="planoDeConta"
                          label="Plano de Conta" map-options :option-label="getDescricaoPlanoConta"
                          :emit-value="true" option-value="_id" :options="listaPlanos">
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section>
                                <q-item-label>
                                  {{ scope.opt.identificador }} - {{ scope.opt.descricao }}
                                </q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
            </div>
          <div class="col-12 col-md-2">
             <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Filtrar"
              v-if="geral.funcoesAcessos.financeiroMovimentacaoAcessar && conta && inicio" @click="changeData" aria-label="Menu Sistema"
              icon="filter_alt">
              <q-tooltip>Filtrar</q-tooltip>
            </q-btn>
          </div>
        </div>


      </template>
      <template v-slot:body="props">

        <q-tr :props="props"
          :class="{ 'az-selecionado3': props.row.tipo == 'C', 'az-selecionado2': props.row.tipo == 'D' }">
          <q-td key="tipo">
            <q-avatar size="32px" font-size="20px" :color="props.row.tipo == 'C' ? 'positive' : 'negative'"
              text-color="white">
              {{ props.row.tipo }}
            </q-avatar>
          </q-td>
          <q-td key="descricao" :props="props">{{ props.row.descricao }}</q-td>
          <q-td key="planoDeConta" :props="props">{{ props.row.planoDeConta.identificador + ' - ' +
            props.row.planoDeConta.descricao }}</q-td>
          <q-td key="valor" :props="props">{{ props.row.valor }}</q-td>
          <q-td key="saldoAtual" :props="props">{{ props.row.saldoAtual }}</q-td>
          <q-td key="created_at" :props="props">{{ $geralService.getDataHoraFormatada(props.row.created_at) }}</q-td>
          <q-td key="action">
            <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu>
                <q-list separator link>
                  <q-item>
                    <div class="row content-center">
                      <span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}
                    </div>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.financeiroMovimentacaoInserir" clickable v-close-popup
                    @click="editRow(props.rowIndex, props.row._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="amber-7" text-color="white" icon="edit" />
                    </q-item-section>
                    <q-item-section avatar> Editar </q-item-section>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.financeiroMovimentacaoInserir" clickable v-close-popup
                    @click="editRow(props.rowIndex, props.row._id, true)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="blue" text-color="white" icon="content_copy" />
                    </q-item-section>
                    <q-item-section avatar> Duplicar </q-item-section>
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
    </q-table>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});
import { useQuasar, QSpinnerOval } from "quasar";
import MovimentacaoModal from "@/components/cadastro/financeiro/MovimentacaoModal.vue";
import { useGeral } from '@/stores/geral';

const { $geralService } = useNuxtApp()
const $q = useQuasar();
const geral = useGeral();
const inserir = ref(false);
const idSelecionado = ref({});
const indexSelecionado = ref(-1);
const fim = ref(new Date().toISOString());
const inicio = ref($geralService.getDataAtualMenosDiasToISO(7));
const rows = ref([]);
const listaConta = ref([]);
const listaPlanos = ref([]);
const conta = ref('');
const planoDeConta = ref('');
const initialPagination = ref({
  page: 1,
  rowsPerPage: 100
});
const columns = ref([
  {
    name: 'tipo',
    required: true,
    label: 'Tipo',
    align: 'left',
    field: 'Tipo',
    sortable: true
  },
  {
    name: 'descricao',
    required: true,
    label: 'Descrição',
    align: 'left',
    field: 'descricao',
    sortable: true
  },
  {
    name: 'planoDeConta',
    required: true,
    label: 'Plano de Conta',
    align: 'left',
    field: 'planoDeConta',
    sortable: true
  },
  {
    name: 'valor',
    required: true,
    label: 'Valor',
    align: 'left',
    field: 'valor',
    sortable: true
  },
  {
    name: 'saldoAtual',
    required: true,
    label: 'Saldo',
    align: 'left',
    field: 'saldoAtual',
    sortable: true
  },
  {
    name: 'created_at',
    label: 'Lançamento',
    align: 'left',
    field: 'created_at',
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

const getDescricaoPlanoConta = (obj) => { return obj ? obj.identificador + ' - ' + obj.descricao : '' };

const getUrlImagemThumb = (caminho) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: 128
  })
}

const changeData = (data) => {
  if (data) {
    setTimeout(() => {
      filtroContas(conta.value);
    }, 500);
  }
}

const filtroContas = async (conta) => {
  if (conta && inicio.value) {
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Buscando Dados... Aguarde!",
      messageColor: "white",
    });
    const ret = await useCustomFetch('financeiroMovimentacao/getPopulate', 'post', {
      filtro: {
        lixo: false,
        conta: conta,
        entidade: geral.entidade._id,
        'planoDeContaArvore.planoDeConta': planoDeConta.value ? planoDeConta.value : undefined,
        created_at: {
          $gte: inicio.value,
          $lte: fim.value ? fim.value.replaceAll('00:00:00-03:00', '23:59:59-03:00'): undefined
        }
      },
      populateObj: [{
        path: 'planoDeConta',
        selected: {
          identificador: 1,
          descricao: 1
        }
      }]
    }, undefined);
    if (ret.valido) {
      rows.value = ret.data;
    } else {
      rows.value = [];
    }
    $q.loading.hide();
  } else {
    rows.value = [];
  }
};

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

  await setListaPlano();
  try {

    const ret = await useCustomFetch('financeiroConta/getPopulate', 'post', {
      filtro: {
        entidade: geral.entidade._id,
        lixo: false
      }
    }, undefined);
    if (ret.valido) {
      listaConta.value = ret.data;
      $q.loading.hide();
    } else {
      listaConta.value = [];
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

const setListaPlano = async () => {
  try {
    const ret = await useCustomFetch(
      'financeiroPlanoConta/getPopulate',
      'post', {
      filtro: {
        entidade: geral.entidade._id,
        lixo: false
      },
      sort: {
        identificador: 1
      }
    },
      undefined
    );
    if (ret.valido) {
      listaPlanos.value = ret.data;
    } else {
      listaPlanos.value = [];
    }
  } catch (error) {
    listaPlanos.value = [];
  }
};

const deleteRow = async (index, id) => {
  if (geral.funcoesAcessos.financeiroMovimentacaoDeletar) {
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Deletando Registro... Aguarde!",
      messageColor: "white",
    });
    const ret = await useCustomFetch("financeiroMovimentacao/delete", "post", { _id: id, definitivo: false }, undefined);
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
  if (geral.verificaAcesso("financeiroMovimentacaoEditar")) {
    openModal(index, id, copy);
  }
};
const insertRow = () => {
  if (geral.verificaAcesso("financeiroMovimentacaoInserir")) {
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
    component: MovimentacaoModal,
    persistent: true,
    componentProps: {
      copia: copy,
      inserir: inserir.value,
      id: idSelecionado.value,
      conta: conta.value,
    },
  })
    .onOk(async (data) => {
      confirmSave(data);
    })
    .onCancel(() => { });
}

const confirmSave = (obj) => {
  filtroContas(conta.value);
};
</script>

<style scoped>.truncate {
  width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}</style>
