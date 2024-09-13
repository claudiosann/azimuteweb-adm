<template>
  <div class="container mx-auto p-1 sm:p-4">
    <q-grid :data="rows" :columns="columns" :pagination="initialPagination" :columns_filter="true">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg rounded-tr-lg" :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-teal-400 to-teal-700" name="alt_route" size="30px" />
          <q-toolbar-title><span class="mr-3 text-weight-medium">Gerenciar Eleições</span></q-toolbar-title>
          <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir" @click="insertRow" aria-label="Menu Sistema" icon="add">
            <q-tooltip>Inserir Novo Registro</q-tooltip>
          </q-btn>
        </q-toolbar>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="imagemUrl"> <q-img v-if="props.row.imagemUrl" class="rounded" :ratio="1200 / 630" :src="getUrlImagemThumb(props.row.imagemUrl)"></q-img></q-td>
          <q-td key="sigla"> {{ props.row.entidadePai.sigla }} </q-td>
          <q-td key="status"> {{ props.row.titulo }} </q-td>
          <q-td key="inicio">{{ $geralService.getDataFormatada(props.row.inicio) }}</q-td>
          <q-td key="fim">{{ $geralService.getDataFormatada(props.row.fim) }}</q-td>
          <q-td key="nivelVotacao">{{ props.row.nivelVotacao }}</q-td>

          <q-td key="status">
            <q-badge
              py-2
              rounded-lg
              :class="{
                'bg-red-500! text-white': props.row.status === 'Cancelada',
                'bg-purple-500! text-white': props.row.status === 'Encerrada',
                'bg-lime-500! darken-4 text-white': props.row.status === 'Agendada',
                'bg-green-500! text-white': props.row.status === 'Ativa',
              }"
              :label="props.row.status"
            />
          </q-td>
          <q-td key="action">
            <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu v-if="geral.pessoa._id === '5aff4d2f47667633c7ace227' || props.row.funcaoAuditar || props.row.funcaoEditar || props.row.funcaoConsultar">
                <q-list separator link>
                  <q-item>
                    <div class="row content-center"><span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}</div>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.eleicaoInserir || props.row.funcaoEditar || props.row.funcaoConsultar" clickable v-close-popup @click="editRow(props.rowIndex, props.row._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl :color="(geral.pessoa._id === '5aff4d2f47667633c7ace227' || props.row.funcaoEditar) && !props.row.votacaoIniciada ? 'amber-7' : 'info'" text-color="white" :icon="(geral.pessoa._id === '5aff4d2f47667633c7ace227' || props.row.funcaoEditar) && !props.row.votacaoIniciada ? 'edit' : 'visibility'" />
                    </q-item-section>
                    <q-item-section avatar> {{ (geral.pessoa._id === '5aff4d2f47667633c7ace227' || props.row.funcaoEditar) && !props.row.votacaoIniciada ? "Editar" : "Consultar" }}</q-item-section>
                  </q-item>
                  <q-item v-if="geral.pessoa._id === '5aff4d2f47667633c7ace227' || props.row.funcaoEditar" clickable v-close-popup @click="editRow(props.rowIndex, props.row._id, true)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="blue" text-color="white" icon="content_copy" />
                    </q-item-section>
                    <q-item-section avatar> Duplicar </q-item-section>
                  </q-item>
                  <q-item v-if="(geral.pessoa._id === '5aff4d2f47667633c7ace227' || props.row.funcaoEditar) && props.row.status === 'Agendada'" clickable v-close-popup @click="ativarVotacao(props.rowIndex, props.row._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="positive" text-color="white" icon="fas fa-toggle-on" />
                    </q-item-section>
                    <q-item-section avatar> Ativar Votação</q-item-section>
                  </q-item>
                  <q-item v-if="(geral.pessoa._id === '5aff4d2f47667633c7ace227' || props.row.funcaoEditar) && props.row.status === 'Ativa'" clickable v-close-popup @click="encerrarVotacao(props.rowIndex, props.row._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="purple-7" text-color="white" icon="fas fa-toggle-off" />
                    </q-item-section>
                    <q-item-section avatar>Encerrar Votação</q-item-section>
                  </q-item>
                  <q-item v-if="geral.pessoa._id === '5aff4d2f47667633c7ace227' || props.row.funcaoAuditar" clickable v-close-popup @click="auditoriaCompleta(props.row._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="teal-7" text-color="white" icon="fas fa-user-shield" />
                    </q-item-section>
                    <q-item-section> Auditoria - Gerar / Baixar Arquivo. </q-item-section>
                  </q-item>
                  <q-item v-if="geral.pessoa._id === '5aff4d2f47667633c7ace227'" clickable v-close-popup @click="">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="red-7" text-color="white" icon="delete" />
                    </q-item-section>
                    <q-item-section> Deletar </q-item-section>
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
import { useQuasar, QSpinnerOval, QBadge } from "quasar";
import votacaoModal from "/components/cadastro/votacao/votacaoModal.vue";
import { useGeral } from "/stores/geral";

const $q = useQuasar();
const { $geralService } = useNuxtApp();
const geral = useGeral();
const inserir = ref(false);
const idSelecionado = ref({});
const indexSelecionado = ref(-1);
const rows = ref([]);
const initialPagination = ref({
  rowsPerPage: 0,
});
const columns = ref([
  {
    name: "imagemUrl",
    required: true,
    label: "Imagem",
    align: "left",
    field: "imagemUrl",
    sortable: true,
  },
  {
    name: "sigla",
    required: true,
    label: "Sigla",
    align: "left",
    field: "sigla",
    sortable: true,
  },
  {
    name: "titulo",
    required: true,
    label: "Título",
    align: "left",
    field: "titulo",
    sortable: true,
  },
  {
    name: "inicio",
    required: true,
    label: "Início",
    align: "left",
    field: "inicio",
    type: "date",
    sortable: true,
  },
  {
    name: "fim",
    required: true,
    label: "Fim",
    align: "left",
    field: "fim",
    type: "date",
    sortable: true,
  },
  {
    name: "nivelVotacao",
    required: true,
    label: "Nível de Votação",
    align: "left",
    field: "nivelVotacao",
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
    filter_type: "none",
  },
]);

const getUrlImagemThumb = (caminho) => {
  return $geralService.getUrlS3(caminho);
};

onMounted(() => {
  getList();
});

const getList = async () => {
  // rows.value = geral.votacoes;
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Buscando Dados... Aguarde!",
    messageColor: "white",
  });

  // try {
  //     const ret = await useCustomFetch(
  //         "votacao/getPopulate",
  //         "post",
  //         {
  //             filtro: { lixo: false },
  //         },
  //         undefined
  //     );
  //     // console.log('Leu o Banco de dados.');
  //     if (ret.valido) {
  //         rows.value = ret.data;
  //         console.log(ret.data);

  //         $q.loading.hide();
  //     } else {
  //         rows.value = [];
  //         console.log(ret.data);
  //         $q.loading.hide();
  //         $q.notify({
  //             color: "negative",
  //             message: ret.data && ret.data.message ? ret.data.message : "Falha ao obter a lista de acessos!",
  //         });
  //     }
  // } catch (error) {
  //     $q.loading.hide();
  // }
  try {
      const ret = await useCustomFetch("votacao/getPopulate", "post", { filtro: { lixo: false }, select: { votos: 0, opcoesDeVoto: 0, disputas: 0, votantes: 0 } }, undefined);
    const geral = useGeral();

    if (ret.valido) {
      // console.log(ret);
      const votacoes = ret.data
        .map((votacao) => {
          votacao.administradores.forEach((adm) => {
            if (adm.pessoa === geral.pessoa._id) {
              // eslint-disable-next-line
              adm.funcaoVotacao.forEach((funcao) => {
                switch (funcao.id) {
                  case 1:
                    votacao.funcaoConsultar = true;
                    break;
                  case 2:
                    votacao.funcaoEditar = true;
                    break;
                  case 3:
                    votacao.funcaoAuditar = true;
                    break;
                }
              });
            }
          });
          return votacao;
        })
        .filter((votacao) => geral.pessoa._id === '5aff4d2f47667633c7ace227' || votacao.funcaoConsultar || votacao.funcaoEditar || votacao.funcaoAuditar);

      rows.value = votacoes;
    }
  } catch (error) {
    console.error(error);
    } 
   $q.loading.hide();
};

const ativarVotacao = async (index, votacaoId) => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Ativando Votação... Aguarde!",
    messageColor: "white",
  });
  const ret = await useCustomFetch("ativarVotacao", "post", { _id: votacaoId }, undefined);
  $q.loading.hide();
  if (ret.valido) {
    $q.notify({
      type: "positive",
      position: "top",
      message: "Votação ativada com sucesso!",
    });
    rows.value[index].status = "Ativa";
  } else {
    // console.log(ret.data);
    $q.notify({
      type: "warning",
      position: "top",
      message: "Falha ao ativar votação." + ret.data.message,
    });
  }
};

const encerrarVotacao = async (index, votacaoId) => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Encerrando Votação... Aguarde!",
    messageColor: "white",
  });
  const ret = await useCustomFetch("encerrarVotacao", "post", { _id: votacaoId }, undefined);
  $q.loading.hide();
  if (ret.valido) {
    $q.notify({
      type: "positive",
      position: "top",
      message: "Votação encerrada com sucesso!",
    });
    rows.value[index].status = "Encerrada";
  } else {
    console.log(ret.data);
    $q.notify({
      type: "warning",
      position: "top",
      message: "Falha ao encerrar votação." + ret.data.message,
    });
  }
};

const deleteRow = async (index, id) => {
  if (geral.funcoesAcessos.votacaoDeletar) {
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Deletando Registro... Aguarde!",
      messageColor: "white",
    });
    const ret = await useCustomFetch("votacao/delete", "post", { _id: id, definitivo: true }, undefined);
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
  // console.log('editRow', index, id, copy);
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
    component: votacaoModal,
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

const confirmSave = async (obj) => {
  await getList();
  indexSelecionado.value = -1;
};

const auditoriaCompleta = async (votacaoId) => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Gerando Arquivo... Aguarde!",
    messageColor: "white",
  });

  const ret = await getCSVCompleto(votacaoId);
  $q.loading.hide();
  if (ret.valido) {
    $q.notify({
      type: "positive",
      position: "top",
      message: "Arquivo gerado com sucesso!",
    });
  } else {
    // console.log(ret.data);
    $q.notify({
      type: "warning",
      position: "top",
      message: "Falha ao gerar arquivo." + ret.data.message,
    });
  }
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
