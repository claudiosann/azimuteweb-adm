<template>
   <div class="container mx-auto p-1 sm:p-4">
   <q-grid v-if="rows" :data="rows" :columns="columns" :columns_filter="true" :pagination="initialPagination" rows-per-page-label="Registros por página:">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
            :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
            <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-l from-blue-500 to-amber-700"
                          name="fas fa-shield-alt" size="30px" />
            <q-toolbar-title><span class="mr-3 text-weight-medium">Acessos</span></q-toolbar-title>
          </q-toolbar>
        
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="nome"> <q-img v-if="props.row.pessoa.foto" class="rounded-borders" style="width: 32px;" :ratio="32 / 32" :src="getUrlImagemThumb(props.row.pessoa.foto)"></q-img> {{ props.row.pessoa.nome }} </q-td>
          <q-td key="entidade"> <q-img v-if="props.row.entidade.logo" class="rounded-borders" style="width: 32px;" :ratio="32 / 32" :src="getUrlImagemThumb(props.row.entidade.logo)"></q-img> {{ props.row.entidade.sigla }} </q-td>
          <q-td key="Cargo">{{ props.row.cargo }}</q-td>
          <q-td key="action">
            <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu>
                <q-list separator link>
                  <q-item>
                    <div class="row content-center">
                      <span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}
                    </div>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.entidadeInserir" clickable v-close-popup>
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
  middleware: "suporte",
});

import { useQuasar, QSpinnerOval } from "quasar";
import { useGeral } from '../stores/geral';


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
  name: 'pessoa.nome',
  required: true,
  label: 'Nome',
  align: 'left',
  field: 'pessoa.nome',
  sortable: true
},
{
  name: 'entidade.sigla',
  required: true,
  label: 'Entidade',
  align: 'left',
  field: 'entidade.sigla',
  sortable: true
},
{
  name: 'pessoa.cargo',
  label: 'Cargo',
  align: 'left',
  field: 'pessoa.cargo',
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
      "vinculo/getPopulate",
      "post",
      {
        filtro: {
          lixo: false,
          },
          sort: {
            "entidade": 1
          },
          populateObj: [
            { path: 'pessoa', select: { nome: 1, apelido: 1, email: 1, foto: 1 } },
            {path: 'entidade', select: { nomeRazao: 1, sigla: 1, logo: 1 } }
        ]
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


// const openModal = (index, id, copy) => {
//   // <acesso-sistema-cadastro v-on:confirmSave="confirmSave" v-if="show"  :inserir="inserir" :acesso-sistema-id="idSelecionado"></acesso-sistema-cadastro>
//   if (index > -1 && id) {
//     inserir.value = false;
//     idSelecionado.value = id;
//     indexSelecionado.value = index;
//   } else {
//     inserir.value = true;
//     idSelecionado.value = null;
//     indexSelecionado.value = -1;
//   }

//   $q.dialog({
//     component: PessoaModal,
//     persistent: true,
//     componentProps: {
//       copia: copy,
//       inserir: inserir.value,
//       id: idSelecionado.value,
//     },
//   })
//     .onOk(async (data) => {
//       confirmSave(data);
//     })
//     .onCancel(() => { });
// }

// const confirmSave = (obj) => {
//   if (inserir.value) {
//     rows.value.push(obj);
//     $q.loading.hide();
//   } else {
//     //getList();
//   }
//   indexSelecionado.value = -1;
// };

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
