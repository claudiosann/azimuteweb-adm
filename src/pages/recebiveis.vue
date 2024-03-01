<template>
  <div class="p-1 sm:p-4">
    <q-table :rows="rows" :columns="columns" row-key="name" color="secondary" :pagination="initialPagination" rows-per-page-label="Registros por página:">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg rounded-tr-lg" :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-violet-800 to-violet-400" name="fork_right" size="30px" />
          <q-toolbar-title
            ><span class="mr-3 text-weight-medium"
              >Recebíveis({{ rows.length }}) <q-img v-if="entidade && entidade.logo" class="rounded" style="width: 40px" :ratio="200 / 200" :src="getUrlImagemThumb(entidade.logo)"></q-img> <q-badge v-if="filtroAplicado.status" :color="getCorStatus(filtroAplicado.status)">{{ filtroAplicado.status }}</q-badge></span
            ></q-toolbar-title
          >
        </q-toolbar>
        <q-expansion-item v-model="expanded" class="w-full" expand-separator icon="fas fa-filter" label="Filtro">
          <div class="row q-ma-sm q-col-gutter-sm">
            <div class="col-md-3 col-sm-4 col-12">
              <CinputDate tipo="datetime" outlined v-model="filtro.iniPag" label="Liberado Início" :dense="true" />
            </div>
            <div class="col-md-3 col-sm-4 col-12">
              <CinputDate tipo="datetime" outlined v-model="filtro.fim" label="Liberado Fim" :dense="true" />
            </div>
            <div class="col-md-3 col-sm-4 col-12">
              <q-select outlined dense v-model="filtro.status" :options="['Liberado', 'Pendente', 'Pago', 'Cancelado', null]" label="Status" />
            </div>
            <div class="col-md-3 col-sm-4 col-12">
              <q-input dense outlined v-model="filtro.numero" type="text" label="Evento Número" />
            </div>
            <div class="col-md-3 col-sm-4 col-12">
              <q-input dense outlined v-model="filtro.pagamentoMovimentacaoSequencial" type="text" label="Repasse Número" />
            </div>
            <div v-if="suporte" class="col-sm-6 col-12">
              <q-field dense outlined label="Entidade" stack-label>
                <!-- <template v-if="entidade && entidade.logo" v-slot:prepend>
                  <q-avatar rounded size="45px">
                    <q-img :src="getUrlImagemLocal(entidade.logo)"></q-img>
                  </q-avatar>
                </template> -->
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    <span v-if="entidade">{{ entidade.nomeRazao }}{{ " (" + entidade.sigla + ")" }}</span>
                  </div>
                </template>
                <template v-slot:append>
                  <q-btn flat color="primary" @click="selecionarEntidade()" icon="search" round>
                    <q-tooltip>Localizar Entidade</q-tooltip>
                  </q-btn>
                  <q-btn flat color="red" @click="confirmSelecaoEntidade(null)" icon="close" round>
                    <q-tooltip>limpar</q-tooltip>
                  </q-btn>
                </template>
              </q-field>
            </div>
            <!-- <div class="col-md-3 col-sm-4 col-12">
              <q-checkbox left-label v-model="filtro.rateioValidado" label="Rateio Validado" />
            </div> -->
            <div class="col-12">
            <div class="flex justify-between items-center">
              <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round icon="check" label="Aplicar Filtro" @click="aplicarFiltro" />
              <q-btn v-if="rows.length > 0" class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round icon="fas fa-download" label="Baixar Excel" @click="exportCSV">
                <q-tooltip>Baixar Planilha Excel</q-tooltip>
              </q-btn>
              <q-btn v-if="rows.length > 0 && filtroAplicado.status == 'Liberado' && filtroAplicado.entidade && entidade" class="btn-scale m-2 pr-4 pl-2" color="positive" push glossy round icon="currency_exchange" label="Solicitar Transferência" @click="gerarPagamentoMovimentacao">
                <q-tooltip>Solicitar Transferência</q-tooltip>
              </q-btn>
              <div class="text-lg">TOTAL: R$ {{ $geralService.numeroParaMoeda(somaTotal) }}</div>
            </div>
            </div>
          </div>
        </q-expansion-item>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="identificador">{{ props.row.identificador }}</q-td>
          <q-td key="tipo">{{ props.row.tipo }}</q-td>
          <q-td key="entidade.logo">
            <div class="!flex !flex-col">
              <q-img v-if="props.row.entidade.logo" class="rounded" style="width: 40px" :ratio="200 / 200" :src="getUrlImagemThumb(props.row.entidade.logo)"></q-img>
              <span>{{ props.row.entidade.sigla }}</span>
            </div>
          </q-td>
          <q-td key="evento.sigla">{{ props.row.evento.numero+' - '+props.row.evento.sigla }}</q-td>
          <q-td key="dataLiberado">{{ $geralService.getDataHoraFormatada(props.row.dataLiberado) }}</q-td>
          <q-td key="dataPrevisao">{{ $geralService.getDataHoraFormatada(props.row.dataPrevisao) }}</q-td>
          <q-td key="dataPagamento">{{ $geralService.getDataHoraFormatada(props.row.dataPagamento) }}</q-td>
          <q-td key="valor">{{ $geralService.numeroParaMoeda(props.row.valor) }}</q-td>
          <q-td key="status">
            <q-badge :color="getCorStatus(props.row.status)">{{ props.row.status }}</q-badge></q-td
          >
          <q-td key="action">
            <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu>
                <q-list separator link>
                  <q-item>
                    <div class="row content-center"><span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}</div>
                  </q-item>
                  <q-item clickable @click="editRow(props.rowIndex, props.row.identificador, true)" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="amber-7" text-color="white" icon="visibility" />
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

import { useQuasar, QSpinnerOval, exportFile } from "quasar";
import InscricaoModal from "../components/cadastro/InscricaoModal.vue";
import BuscarEntidade from "../components/BuscarEntidade.vue";

const expanded = ref(true);

const filtro = ref({
  status: "Liberado",
});

const filtroAplicado = ref({
  status: "Liberado",
});

const getCorStatus = (status) => {
  switch (status) {
    case "Liberado":
      return "blue";
    case "Pendente":
      return "warning";
    case "Pago":
      return "Pago";
    default:
      return "negative";
  }
};

const suporte = ref(false);
const { $geralService } = useNuxtApp();
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
    name: "_id",
    required: true,
    label: "Identificador",
    align: "left",
    field: "_id",
    sortable: true,
  },
  {
    name: "tipo",
    required: true,
    label: "Tipo",
    align: "left",
    field: "tipo",
    sortable: true,
  },
  {
    name: "entidade.sigla",
    required: true,
    label: "Entidade",
    align: "left",
    field: "entidade.sigla",
    sortable: true,
  },
  {
    name: "evento.sigla",
    required: true,
    label: "Evento",
    align: "left",
    field: "evento.sigla",
    sortable: true,
  },
  {
    name: "dataLiberado",
    required: true,
    label: "DT LIberado",
    align: "left",
    field: "dataLiberado",
    sortable: true,
  },
  {
    name: "dataPrevisao",
    required: true,
    label: "DT Previsao",
    align: "left",
    field: "dataPrevisao",
    sortable: true,
  },
  {
    name: "dataPagamento",
    required: true,
    label: "DT Pagamento",
    align: "left",
    field: "dataPagamento",
    sortable: true,
  },

  {
    name: "valor",
    required: true,
    label: "Valor",
    align: "left",
    field: "valor",
    sortable: true,
  },
  {
    name: "status",
    required: true,
    label: "Status",
    align: "left",
    field: "status",
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

const somaTotal = computed(() => {
  return rows.value.reduce((acc, cur) => acc + cur.valor, 0);
});

const entidade = ref(null);

const selecionarEntidade = () => {
  $q.dialog({
    component: BuscarEntidade,
    persistent: true,
    componentProps: {},
  })
    .onOk(async (data) => {
      confirmSelecaoEntidade(data);
      aplicarFiltro();
    })
    .onCancel(() => {});
};

const confirmSelecaoEntidade = (ent) => {
  if (ent) {
    entidade.value = ent;
    filtro.value.entidade = ent._id;
  } else {
    entidade.value = null;
    filtro.value.entidade = undefined;
  }
};


onBeforeMount(() => {
  if (geral.pessoa._id === "5aff4d2f47667633c7ace227") {
    suporte.value = true;
  } else {
    confirmSelecaoEntidade(geral.entidade);
  }
});

// var pagamentoMovimentacaoSchema = mongoose.Schema({
//     'entidade': { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'entidade' },
//     'rateios': [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'pagamentoRateio' }],
//     "sequencial": { type: Number, required: true }, // Sequencial de movimentação de conta por entidade.
//     'status': { type: String, enum: ['Solicitada', 'Realizada', 'Cancelada'], required: true },
//     'dataSolicitacao': { type: Date, required: true }, // Data em que o valor foi solicitado
//     'pessoaSolicitacao': { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'pessoa' }, // Pessoa que solicitou de forma manual.
//     'automatica': { type: Boolean, default: false }, // Se a movimentação foi gerada automaticamente
//     'dataCancelado': { type: Date, required: true }, // Data em que o valor foi solicitado
//     'dataRealizada': { type: Date, required: true }, // Data em que o valor foi Realizado (tranferência),
//     'comprovante': {type: String, required: false}, // Comprovante de transferência
//     "valor": {type: Number, required: true},
//     "lixo": { type: Boolean, default: false },
//     "created_at": Date,
//     "updated_at": Date
// }, { collection: 'pagamentoMovimentacao' });

const gerarPagamentoMovimentacao = async () => {
  $q.dialog({
    title: "Confirmação",
    message: `Deseja realmente solicitar a transferência dos valores selecionados?`,
    focus: "cancel",
    ok: {
      color: "primary",
      label: "sim",
    },
    cancel: {
      color: "negative",
      label: "Não",
    },
  }).onOk(async () => {
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Solicitando Transferência... Aguarde!",
      messageColor: "white",
    });
    await exportCSV();
    try {
      const ret = await useCustomFetch(
        "pagamentoMovimentacao",
        "post",
        {
          entidade: filtroAplicado.value.entidade,
          rateios: rows.value.map((r) => r._id),
          sequencial: 0,
          status: "Solicitada",
          dataSolicitacao: new Date(),
          pessoaSolicitacao: geral.pessoa._id,
          automatica: true,
          dataCancelado: null,
          dataRealizada: null,
          comprovante: null,
          valor: rows.value.reduce((acc, cur) => acc + cur.valor, 0),
        },
        undefined
      );
      if (ret.valido) {
        // alterar no banco todos os status do pagamentoRateio para "Pago"

        for (let index = 0; index < rows.value.length; index++) {
          const row = rows.value[index];
          row.status = "Pago";
        
          const ret2 = await useCustomFetch("pagamentoRateio/" + row._id, "put", { status: "Pago", pagamentoMovimentacao: ret.data._id, pagamentoMovimentacaoSequencial: ret.data.sequencial }, undefined);
          if (!ret2.valido) {
            $q.loading.hide();
            $q.notify({
              color: "negative",
              message: ret2.data && ret2.data.message ? ret2.data.message : "Falha ao alterar o status do rateio!",
            });
            return;
          }
        }
        rows.value = [];

        $q.loading.hide();
        $q.notify({
          color: "positive",
          message: "Solicitação de Transferência realizada com sucesso!",
        });
      } else {
        $q.loading.hide();
        $q.notify({
          color: "negative",
          message: ret.data && ret.data.message ? ret.data.message : "Falha ao solicitar a transferência!",
        });
      }
    } catch (error) {
      console.log(error);
      $q.loading.hide();
    }
  });
};



const getUrlImagemThumb = (caminho) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: 128,
  });
};

const aplicarFiltro = async () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Buscando Dados... Aguarde!",
    messageColor: "white",
  });

  filtroAplicado.value = JSON.parse(JSON.stringify(filtro.value));

  try {
    let eventoId = undefined;

    if (filtro.value.numero) {
      const retEv = await useCustomFetch("evento/getPopulate", "post", { filtro: { numero: filtro.value.numero }, select: { _id: 1 } }, undefined);
      if (retEv.valido) {
        eventoId = retEv.data[0]._id;
      } else {
        $q.loading.hide();
        $q.notify({
          color: "negative",
          message: retEv.data && retEv.data.message ? retEv.data.message : "Falha ao obter o evento!",
        });
        return;
      }
    }
    console.log({
      lixo: false,
      identificador: filtro.value.identificador || undefined,
      tipo: filtro.value.tipo || undefined,
      status: filtro.value.status || undefined,
      evento: eventoId || undefined,
      entidade: filtro.value.entidade || undefined,
      pagamentoMovimentacaoSequencial: filtro.value.pagamentoMovimentacaoSequencial || undefined,
      created_at:
        filtro.value.inicio || filtro.value.fim
          ? {
              $gte: filtro.value.inicio ? new Date(filtro.value.inicio) : undefined,
              $lte: filtro.value.fim ? new Date(filtro.value.fim) : undefined,
            }
          : undefined,
    });
    const ret = await useCustomFetch(
      "pagamentoRateio/getPopulate",
      "post",
      {
        filtro: {
          lixo: false,
          identificador: filtro.value.identificador || undefined,
          tipo: filtro.value.tipo || undefined,
          status: filtro.value.status || undefined,
          evento: eventoId || undefined,
          pagamentoMovimentacaoSequencial: filtro.value.pagamentoMovimentacaoSequencial || undefined,
          entidade: filtro.value.entidade || undefined,
          created_at:
            filtro.value.inicio || filtro.value.fim
              ? {
                  $gte: filtro.value.inicio ? new Date(filtro.value.inicio) : undefined,
                  $lte: filtro.value.fim ? new Date(filtro.value.fim) : undefined,
                }
              : undefined,
        },
        populateObj: [
          {
            path: "evento",
            select: { nome: 1, entidadeResponsavel: 1, numero: 1, sigla: 1, ano: 1 },
            populate: {
              path: "entidadeResponsavel",
              select: { sigla: 1 },
            },
          },
          {
            path: "entidade",
            select: { sigla: 1, logo: 1 },
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

const openModal = (index, id, copy) => {
  idSelecionado.value = id;
  indexSelecionado.value = index;

  $q.dialog({
    component: InscricaoModal,
    persistent: true,
    componentProps: {
      id: idSelecionado.value,
    },
  })
    .onOk(async (data) => {
      confirmSave(data);
    })
    .onCancel(() => {});
};

const exportCSV = async () => {
  let CSV = "";
  for (let index = 0; index < columns.value.length; index++) {
    const col = columns.value[index];
    if (col.field) CSV += col.label + ";";
  }
  CSV += "\r\n";
  for (let index = 0; index < rows.value.length; index++) {
    const row = rows.value[index];
    CSV += row.identificador + ";" + row.tipo + ";" + row.entidade.sigla + ";" + row.evento.sigla + ";" + $geralService.getDataHoraFormatada(row.dataLiberado) + ";" + $geralService.getDataHoraFormatada(row.dataPrevisao) + ";" + $geralService.getDataHoraFormatada(row.dataPagamento) + ";" + $geralService.numeroParaMoeda(row.valor) + ";" + row.status;
    CSV += "\r\n";
  }

  let fileName = (entidade.value ? entidade.value.sigla + "_" : "") + ("rateio_" + $geralService.getDataHoraFormatada(new Date()).replaceAll(" ", "-").replaceAll(":", "-"));
  let uri = "data:text/csv;charset=utf-8," + escape(CSV);
  let link = document.createElement("a");
  link.href = uri;
  // @ts-ignore
  link.style = "visibility:hidden";
  link.download = fileName + ".csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return { valido: true, data: { message: "CSV gerado com sucesso!" } };
};

const confirmSave = (obj) => {
  if (inserir.value) {
    rows.value.push(obj);
    $q.loading.hide();
  } else {
    aplicarFiltro();
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
