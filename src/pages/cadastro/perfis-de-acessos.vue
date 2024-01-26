<template>
  <div class="container mx-auto p-1 sm:p-4">
    <q-table :rows="rows" :columns="columns" row-key="name" color="secondary" :pagination="initialPagination"
      rows-per-page-label="Registros por página:">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
          :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon size="30px" class="ml-3 p-1  rounded text-white bg-gradient-to-l from-amber-500 to-amber-700" name="badge" />
          <q-toolbar-title><span class="mr-3 text-weight-medium">Perfis de Acessos</span></q-toolbar-title>
          <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir"
            v-if="geral.funcoesAcessos.acessoSistemaInserir" @click="insertRow" aria-label="Menu Sistema" icon="add">
            <q-tooltip>Inserir Novo Registro</q-tooltip>
          </q-btn>
        </q-toolbar>

      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="descricao">{{ props.row.descricao }}</q-td>
          <q-td key="created_at">{{ $geralService.getDataFormatada(props.row.created_at) }}</q-td>
          <q-td key="updated_at">{{ $geralService.getDataFormatada(props.row.updated_at) }}</q-td>
          <q-td key="action">
            <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu>
                <q-list separator link>
                  <q-item>
                    <div class="row content-center">
                      <span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}
                    </div>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.acessoSistemaInserir" clickable v-close-popup
                    @click="editRow(props.rowIndex, props.row._id)">
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="amber-7" text-color="white" icon="edit" />
                    </q-item-section>
                    <q-item-section avatar> Editar </q-item-section>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.acessoSistemaInserir" clickable v-close-popup
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
import AcessoSistemaModal from "../../components/cadastro/AcessoSistemaModal.vue";
import { useGeral } from '../../stores/geral';

const $q = useQuasar();
const geral = useGeral();
const inserir = ref(false);
const idSelecionado = ref({});
const indexSelecionado = ref(-1);
const rows = ref([]);
const initialPagination = ref({
  page: 1,
  rowsPerPage: 10
});
const columns = ref([
  {
    name: "descricao",
    required: true,
    label: "Descrição",
    align: "left",
    field: "descricao",
    sortable: true,
  },
  {
    name: "created_at",
    label: "Data Criação",
    align: "left",
    field: "created_at",
    sortable: true,
  },
  {
    name: "updated_at",
    align: "left",
    field: "updated_at",
    label: "Data Alteração",
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
      "acessoSistema/getPopulate",
      "post",
      {
        filtro: {
          entidade: geral.entidade._id,
          lixo: false,
        },
      },
      undefined
    );
    // // console.log('Leu o Banco de dados.');
    if (ret.valido) {
      rows.value = ret.data;
      // console.log(rows.value);
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

const deleteRow = async (index, id) => {
  if (geral.funcoesAcessos.acessoSistemaDeletar) {
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Deletando Registro... Aguarde!",
      messageColor: "white",
    });
    const ret = await useCustomFetch("acessoSistema", "delete", { _id: id }, undefined);
    $q.loading.hide();
    if (ret.valido) {
      $q.notify({
        type: "positive",
        position: "top",
        message: "Registro excluído com sucesso!",
      });
      rows.value.splice(index, 1);
    } else {
      $q.notify({
        type: "warning",
        message: "Falha ao deletar." + response.data.message,
      });
      // console.log(response.data);
    }
  } else {
    $q.notify({
      type: "warning",
      message: "Você não tem acesso para deletar este registro!",
    });
  }
};
const editRow = (index, id, copy) => {
  if (geral.verificaAcesso("acessoSistemaEditar")) {
    openModal(index, id, copy);
  }
};
const insertRow = () => {
  if (geral.verificaAcesso("acessoSistemaInserir")) {
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
    component: AcessoSistemaModal,
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
    getList();
  }
  indexSelecionado.value = -1;
};
</script>
