<template>
  <div class="container mx-auto p-1 sm:p-4">
    <q-grid v-if="rows" :data="rows" :columns="columns" :columns_filter="true" :pagination="initialPagination" rows-per-page-label="Registros por página:">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg rounded-tr-lg" :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <span class="ml-3 px-1.5 py-1 rounded text-white bg-gradient-to-l from-emerald-500 to-emerald-700"><q-icon name="fas fa-id-card" size="25px" /></span>
          <q-toolbar-title><span class="mr-3 text-weight-medium">Pessoas Filiadas</span></q-toolbar-title>
        </q-toolbar>
        <!-- <q-expansion-item class="w-full" expand-separator icon="fas fa-filter" label="Filtro">
          <div class="row q-ma-sm q-col-gutter-sm">
            <div class="col-md-2 col-sm-4 col-12">
              <q-input dense outlined v-model="filtro.numero" type="text" label="Nome / Número/ CPF" />
            </div>
            <div class="col-md-2 col-sm-4 col-12">
              <q-select outlined dense v-model="filtro.status" :options="['Iniciada', 'Em Análise', 'Aguardando Pagamento', 'Ativa', 'Recusada', 'Cancelada', 'Desativada', 'Desfiliada', null]" label="Status Filiação" />
            </div>
            <div class="col-md-2 col-sm-4 col-12">
              <q-select outlined dense v-model="filtro.seguro" :options="['Válido', 'Vencido', 'Sem Seguro', null]" label="Seguro" />
            </div>
            <div v-if="geral.entidade.abrangencia == 'Nacional'" class="col-md-2 col-sm-4 col-12">
              <q-field dense outlined label="Federação" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    <span v-if="entidade">{{ " (" + entidade.sigla + ")" }}</span>
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
            <div v-if="geral.entidade.abrangencia == 'Nacional' || geral.entidade.abrangencia == 'Estadual'" class="col-md-2 col-sm-4 col-12">
              <q-field dense outlined label="Clube" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    <span v-if="entidade">{{ " (" + entidade.sigla + ")" }}</span>
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

            <div class="col-md-2 col-sm-4 col-12">
              <q-checkbox left-label v-model="filtro.cadUnico" label="CadÚnico" />
            </div>
            <div class="col-12">
              <q-btn color="primary" icon="check" label="Aplicar Filtro" @click="getList" />
            </div>
            <div class="col-12">
              <q-btn v-if="rows.length > 0 && filtro.numero" color="primary" icon="check" label="Exportar" @click="exportCSV" />
            </div>
          </div>
        </q-expansion-item> -->
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="nome">  
          <q-item class="!px-0">
            <q-item-section class="!pr-0" style="min-width: 50px;" v-if="props.row.pessoa.foto" top avatar>
              <q-img  class="rounded-borders" style="width: 45px" :ratio="32 / 32" :src="getUrlImagemThumb(props.row.pessoa.foto)"></q-img>
            </q-item-section>
            <q-item-section>
             <q-item-label>{{ props.row.pessoa.nome }} </q-item-label>
              <q-item-label><q-badge class="ml-2" v-if="props.row.temporaria" color="red">Filiação Temporária</q-badge> </q-item-label>
            </q-item-section>
          </q-item>
          </q-td>
          <q-td key="status">
            <q-badge :color="getCorStatus(props.row.status)">{{ props.row.status }}</q-badge></q-td
          >
          <q-td key="numero"> {{ props.row.numero }} </q-td>
          <q-td key="nivelDificuldade"> {{ props.row.nivelDificuldade }} </q-td>
          <q-td key="temporaria"> {{ props.row.temporaria }} </q-td>
          <q-td key="dataFiliacao"> {{ $geralService.getDataFormatada(props.row.dataFiliacao) }} </q-td>
          <q-td key="pessoa.nascimento"> {{ $geralService.getDataFormatada(props.row.pessoa.nascimento) }} </q-td>
          <q-td key="pessoa.validadeSeguro"> {{ $geralService.getDataFormatada(props.row.pessoa.validadeSeguro) }} </q-td>
          <q-td key="action">
            <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu>
                <q-list separator link>
                  <q-item>
                    <div class="row content-center"><span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}</div>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.filiacaoAcessar" clickable v-close-popup @click="editFiliacao(props.rowIndex, props.row._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="blue" text-color="white" icon="fas fa-id-card" />
                    </q-item-section>
                    <q-item-section avatar> Filiação </q-item-section>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.pessoaEditar" clickable v-close-popup @click="editRow(props.rowIndex, props.row.pessoa._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="amber-7" text-color="white" icon="edit" />
                    </q-item-section>
                    <q-item-section avatar> Editar Cadastro </q-item-section>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.nivelAtletaEditar" clickable v-close-popup @click="editarNivel(props)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="purple-7" text-color="white" icon="sports_martial_arts" />
                    </q-item-section>
                    <q-item-section avatar> Editar Nível </q-item-section>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.numeroEditar" clickable v-close-popup @click="editarNumero(props)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="deep-purple-7" text-color="white" icon="pin" />
                    </q-item-section>
                    <q-item-section avatar> Editar Número</q-item-section>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.pessoaDeletar" clickable v-close-popup @click="deleteRow(props)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="negative" text-color="white" icon="delete" />
                    </q-item-section>
                    <q-item-section avatar> Excluir Filiação</q-item-section>
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
import PessoaModal from "../../components/cadastro/PessoaModal.vue";


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
const filtro = ref({
  nome: null,
  status: null,
  estagioRateio: null,
  numero: null,
  cadUnico: false,
});
const filtroAplicar = ref({});

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
    column_options: ["Iniciada", "Em Análise", "Aguardando Pagamento", "Ativa", "Recusada", "Cancelada", "Desativada", "Desfiliada"],
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
    name: "nivelDificuldade",
    required: true,
    label: "Nível",
    align: "left",
    field: "nivelDificuldade",
    sortable: true,
  },
  {
    name: "temporaria",
    required: true,
    label: "Temporária",
    align: "left",
    field: "temporaria",
    sortable: true,
  },
  {
    name: "dataFiliacao",
    required: true,
    label: "Data Filiação",
    align: "left",
    field: "dataFiliacao",
    type: "date",
    sortable: true,
  },
  {
    name: "pessoa.nascimento",
    required: true,
    label: "Nascimento",
    align: "left",
    field: "pessoa.nascimento",
    type: "date",
    sortable: true,
  },
  {
    name: "pessoa.validadeSeguro",
    required: true,
    label: "Seguro",
    align: "left",
    field: "pessoa.validadeSeguro",
    type: "date",
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

const editarNumero = (props) => {
  $q.dialog({
    title: 'Editar Número de Filiação',
    message: props.row.pessoa.nome,
     prompt: {
          model: props.row.numero,
          type: 'number' // optional
        },
    cancel: true,
    persistent: true
  }).onOk(async data => {
    if (data) {
      console.log('>>>> OK, received', data)
      props.row.numero = data;
      const ret = await useCustomFetch('updateNumero', 'post', { pessoa: props.row.pessoa._id, numero: data }, undefined);
      console.log(ret);
    }
  }).onCancel(() => {
    // console.log('>>>> Cancel')
  }).onDismiss(() => {
    // console.log('I am triggered on both OK and Cancel')
  })
}
const editarNivel = (props) => {
  $q.dialog({
    title: 'Editar Nivel Atleta',
    message: props.row.pessoa.nome,
    options: {
      type: 'radio',
      model: 'opt1',
      // inline: true
      items: [
        { label: 'Iniciante', value: 0, color: 'secondary' },
        { label: 'Bravo', value: 1 },
        { label: 'Alpha', value: 2 },
        { label: 'Elite', value: 3 }
      ]
    },
    cancel: true,
    persistent: true
  }).onOk(async data => {
    console.log('>>>> OK, received', data)
    props.row.nivelDificuldade = data;
    const ret = await useCustomFetch('updateNivelDificuldade', 'post', { pessoa: props.row.pessoa._id, nivelDificuldade: data }, undefined);
    console.log(ret);
  }).onCancel(() => {
    // console.log('>>>> Cancel')
  }).onDismiss(() => {
    // console.log('I am triggered on both OK and Cancel')
  })
}

const confirmSelecaoEntidade = (ent) => {
  if (ent) {
    entidade.value = ent;
    filtro.value.entidade = ent._id;
  } else {
    entidade.value = null;
    filtro.value.entidade = undefined;
  }
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
    if (geral.entidade && geral.entidade._id) {
      const ret = await useCustomFetch(
        "filiacaoPessoa/getPopulate",
        "post",
        {
          filtro: {
            entidade: geral.entidade._id,
            lixo: false,
          },
          populateObj: [
            {
              path: "pessoa",
              select: {
                nome: 1,
                apelido: 1,
                nascimento: 1,
                validadeSeguro: 1,
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
    }
  } catch (error) {
    $q.loading.hide();
  }
};

const ajustaFiltro = () => {
  if (filtro.value.nome && filtro.value.nome.length > 0) {
    if (isNumeric(filtro.value.nome)) {
      if (filtro.value.nome.length === 11) {
        filtroAplicar.value.cpf = filtro.value.nome;
      } else {
        filtroAplicar.value.numero = filtro.value.nome;
      }
    } else {
      if (validateEmail(filtro.value.nome)) {
        filtroAplicar.value.email = {
          $regex: ".*" + filtro.value.nome + ".*",
        };
      } else {
        filtroAplicar.value.nome = {
          $regex: ".*" + filtro.value.nome + ".*",
          $options: "i",
        };
      }
    }
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

const deleteRow = async (props) => {
  console.log(props);
  if (geral.funcoesAcessos.pessoaDeletar) {
    $q.dialog({
      title: 'Confirmação',
      message: `Deseja realmente excluir a filiação de ${props.row.pessoa.nome}?`,
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
       $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Deletando Registro... Aguarde!",
      messageColor: "white",
    });
    const ret = await useCustomFetch("filiacaoPessoa/delete", "post", { _id: props.row._id }, undefined);
    $q.loading.hide();
    if (ret.valido) {
      $q.notify({
        type: "positive",
        position: "top",
        message: "Registro excluído com sucesso!",
      });
      getList();
    } else {
      // console.log(ret.data);
      $q.notify({
        type: "warning",
        message: "Falha ao deletar." + ret.data.message,
      });
    }
    });
  } else {
    $q.notify({
      type: "warning",
      message: "Você não tem acesso para deletar este registro!",
    });
  }
};

const editRow = (index, id) => {
  openModal(index, id, false);
};
const editFiliacao = (index, id) => {
  openModal(index, id, true);
};

const openModal = (index, id, filiacao) => {
  if (index > -1 && id) {
    inserir.value = false;
    idSelecionado.value = id;
    indexSelecionado.value = index;
  } else {
    inserir.value = true;
    idSelecionado.value = null;
    indexSelecionado.value = -1;
  }

  if (filiacao) {
    $q.dialog({
      component: PessoaFiliadaModal,
      persistent: true,
      componentProps: {
        inserir: false,
        id: idSelecionado.value,
      },
    })
      .onOk(async (data) => {
        confirmSave(data);
      })
      .onCancel(() => {});
  } else {
    $q.dialog({
      component: PessoaModal,
      persistent: true,
      componentProps: {
        inserir: false,
        id: idSelecionado.value,
      },
    })
      .onOk(async (data) => {
        confirmSave(data);
      })
      .onCancel(() => {});
  }
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
