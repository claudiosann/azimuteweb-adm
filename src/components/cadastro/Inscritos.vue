<template>
  <div class="p-1 sm:p-4">
    <q-grid v-if="rows" :data="rows" :columns="columns" :columns_filter="true" row-key="name" color="secondary" :pagination="initialPagination" rows-per-page-label="Registros por página:">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg rounded-tr-lg" :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-l from-amber-400 to-amber-700" name="reduce_capacity" size="30px" />
          <q-toolbar-title><span class="mr-3 text-weight-medium">Inscritos</span></q-toolbar-title>
          <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu>
                <q-list separator link>
                  <!-- <q-item>
                    <div class="row content-center"><span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}</div>
                  </q-item> -->
                  <q-item clickable @click="gerarListagemValores()" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="green-7" text-color="white" icon="fas fa-file-csv" />
                    </q-item-section>
                    <q-item-section avatar> Valor x Atleta x Consumível </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
        </q-toolbar>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="_id">{{ props.row._id }}</q-td>
          <q-td key="pessoa.nome"><q-img v-if="props.row.pessoa.foto" class="rounded" style="width: 50px" :ratio="200 / 200" :src="getUrlImagemThumb(props.row.pessoa.foto)"></q-img> {{ props.row.pessoa.nome }}</q-td>
          <q-td key="created_at">{{ $geralService.getDataHoraFormatada(props.row.created_at) }}</q-td>
          <q-td key="pagamento.tipo">{{ props.row.pagamento.tipo }}</q-td>
          <q-td key="totalLiquido">{{ $geralService.numeroParaMoeda(props.row.totalLiquido) }}</q-td>
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
                  <q-item clickable @click="editRow(props.rowIndex, props.row._id, true)" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="amber-7" text-color="white" icon="edit" />
                    </q-item-section>
                    <q-item-section avatar> Editar </q-item-section>
                  </q-item>
                  <q-item v-if="geral.pessoa._id == '5aff4d2f47667633c7ace227'" clickable @click="deleteRow(props.rowIndex, props.row)" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="red-7" text-color="white" icon="fas fa-trash" />
                    </q-item-section>
                    <q-item-section avatar> Excluir </q-item-section>
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

const props = defineProps({
  eventoId: null,
  evento: null,
});
import { useQuasar, QSpinnerOval } from "quasar";
import InscricaoModal from "./InscricaoModal.vue";
import { useGeral } from "../../stores/geral";

const getCorStatus = (status) => {
  switch (status) {
    case "Iniciada":
      return "accent";
    case "Aguardando o Pagamento":
      return "warning";
    case "Finalizada":
      return "positive";
    case "Recusada":
      return "negative";
    default:
      return "blue-gray-6";
  }
};

const { $geralService } = useNuxtApp();
const $q = useQuasar();
const geral = useGeral();
const inserir = ref(false);
const idSelecionado = ref({});
const indexSelecionado = ref(-1);
const rows = ref([]);
const initialPagination = ref({
  page: 1,
  rowsPerPage: 100,
});
const columns = ref([
  {
    name: "_id",
    required: true,
    label: "Id",
    align: "left",
    field: "_id",
    sortable: true,
  },
  {
    name: "pessoa.nome",
    required: true,
    label: "Nome Responsável",
    align: "left",
    field: "pessoa.nome",
    sortable: true,
  },
  {
    name: "created_at",
    required: true,
    label: "Data e Hora",
    align: "left",
    field: "created_at",
    sortable: true,
    type: "date",
  },
  {
    name: "papamento.tipo",
    required: true,
    label: "Tipo",
    align: "left",
    field: "pagamento.tipo",
    sortable: true,
  },
  {
    name: "totalLiquido",
    required: true,
    label: "Valor",
    align: "left",
    field: "totalLiquido",
    sortable: true,
  },
  {
    name: "status",
    required: true,
    label: "Status",
    align: "left",
    field: "status",
    sortable: true,
    filtro: "",
    filter_type: "select",
    column_options: ["Finalizada", "Aguardando o Pagamento", "Cancelada"],
  },
  {
    name: "action",
    label: "Ação",
    align: "left",
    field: "",
    sortable: false,
  },
]);

const getUrlImagemThumb = (caminho) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: 128,
  });
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

  try {
    const ret = await useCustomFetch(
      "inscricao/getPopulate",
      "post",
      {
        filtro: {
          lixo: false,
          evento: props.eventoId,
        },
        populateObj: [
          {
            path: "pessoa",
            select: { nome: 1, foto: 1 },
          },
          {
            path: "inscritos.pessoa",
            select: { nome: 1, cpf: 1, foto: 1 },
          },
          {
            path: "pagamento",
            pupulate: {
              path: "pagamento",
              select: { tipo: 1, tef: 1 },
            },
          },
          {
            path: "inscritos.consumiveis.consumivel",
            populate: {
              path: "arranjoPagamento.entidade",
              select: { sigla: 1 },
            },
          },
        ],
      },
      undefined
    );
    // // console.log('Leu o Banco de dados.');
    if (ret.valido) {
      rows.value = ret.data;
      // console.log(ret.data);
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

const consumiveis = ref([]);

const getConsumivelDescricao = (id) => {
  for (let index = 0; index < consumiveis.value.length; index++) {
    const element = consumiveis.value[index];
    if (element.id == id) {
      return element.descricao;
    }
  }
  return "";
};

const gerarListagemValores = async () => {
  const ret = await useCustomFetch("consumivel/getPopulate", "post", { filtro: { lixo: false, evento: props.eventoId } }, undefined);
  // console.log(props.eventoId);
  if (ret.valido) {
    consumiveis.value = [];
    for (let index = 0; index < ret.data.length; index++) {
      const element = ret.data[index];
      consumiveis.value.push({ descricao: $geralService.removeCaracteresEspeciais(element.descricao), id: element._id });
    }

    // console.log(consumiveis.value);
  } else {
    $q.notify({
      color: "negative",
      message: ret.data && ret.data.message ? ret.data.message : "Falha ao obter a lista de consumíveis!",
    });
    return;
  }

  let CSV = "";

  let listaInscritos = [];
  for (let index = 0; index < rows.value.length; index++) {
    const i = rows.value[index];
    if (i.status == "Finalizada") {
      for (let index2 = 0; index2 < i.inscritos.length; index2++) {
        const ai = i.inscritos[index2];

        const insc = {
          inscricao: i._id,
          // responsavel_id: i.pessoa._id,
          // responsavel_nome: i.pessoa.nome,
          inscricao_total: ai.totalAtletaLiquido,
          // inscrito_id: ai.pessoa._id,
          inscrito_nome: ai.pessoa.nome,
          inscrito_cpf: ai.pessoa.cpf,
          // consumivel_id: it.consumivel._id,
        };

        for (let index3 = 0; index3 < consumiveis.value.length; index3++) {
          const element = consumiveis.value[index3];
          insc[element.descricao + "_qtde"] = 0;
          insc[element.descricao + "_valor"] = 0;
          insc[element.descricao + "_descontos"] = "";
        }

        for (let index3 = 0; index3 < ai.consumiveis.length; index3++) {
          const it = ai.consumiveis[index3];
          // console.log(it);
          insc[getConsumivelDescricao(it.consumivel._id) + "_qtde"] = it.quantidade;
          insc[getConsumivelDescricao(it.consumivel._id) + "_valor"] = it.totalLiquido;
          insc[getConsumivelDescricao(it.consumivel._id) + "_descontos"] = it.descontos.map((desc) => desc.descricao + ": " + $geralService.numeroParaMoeda(desc.valor)).join(", ");
          if (!insc.cadUnico) {
            insc.cadUnico = verificaCadUnico(it);
          }
        }

        listaInscritos.push(insc);
      }
    }
  }
  // console.log(listaInscritos);

  CSV = Object.keys(listaInscritos[0]).join(";")+"\r\n";

  for (let index = 0; index < listaInscritos.length; index++) {
    const insc = listaInscritos[index];
    CSV += Object.values(insc).join(";")+"\r\n";;
  }
    let fileName = ("valor_atleta_consumivel_"+props.evento.sigla+"_"+props.evento.ano+"_"+props.evento.etapa+"_") + ($geralService.getDataHoraFormatada(new Date()).replaceAll(" ", "-").replaceAll(":", "-"));
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

const verificaCadUnico = (item) => {
  for (let index = 0; index < item.descontos.length; index++) {
    if (item.descontos[index].cadUnico) {
      return true;
    }
  }
  return false;
};

const deleteRow = async (index, inscricao) => {
  if (geral.pessoa._id === "5aff4d2f47667633c7ace227" && inscricao.status != "Finalizada") {
    $q.dialog({
      title: "Excluir",
      message: "Deseja realmente excluir o registro?",
      cancel: true,
      persistent: true,
    })
      .onOk(async () => {
        $q.loading.show({
          spinner: QSpinnerOval,
          spinnerColor: "white",
          spinnerSize: 60,
          message: "Excluindo Registro... Aguarde!",
          messageColor: "white",
        });
        try {
          // primeiro excluir o pagamento
          // console.log(inscricao.pagamento._id )
          // console.log(inscricao._id )

          // Verificar se já foi feito o repasse  (status pago)

          const ret = await useCustomFetch("pagamento/delete", "post", { _id: inscricao.pagamento._id }, undefined);
          if (ret.valido) {
            const ret2 = await useCustomFetch("inscricao/delete", "post", { _id: inscricao._id }, undefined);
            if (ret2.valido) {
              rows.value.splice(index, 1);
              $q.loading.hide();
              $q.notify({
                color: "positive",
                message: "Registro excluído com sucesso!",
              });
            } else {
              $q.loading.hide();
              $q.notify({
                color: "negative",
                message: ret.data && ret.data.message ? ret.data.message : "Falha ao excluir o registro!",
              });
            }
          } else {
            $q.loading.hide();
            $q.notify({
              color: "negative",
              message: ret.data && ret.data.message ? ret.data.message : "Falha ao excluir o registro!",
            });
          }
        } catch (error) {
          $q.loading.hide();
        }
      })
      .onCancel(() => {});
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
      eventoId: props.eventoId,
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

<style scoped>
.truncate {
  width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
