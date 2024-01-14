<template>
  <div class="container mx-auto p-1 sm:p-4">
    <q-card class="rounded-lg">
    
     <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
            :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
            <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-teal-700 to-lime-400"
              name="format_list_numbered" size="30px" />
            <q-toolbar-title><span class="mr-3 text-weight-medium">Plano de Contas</span></q-toolbar-title>
            <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir"
              v-if="geral.funcoesAcessos.financeiroPlanoContaInserir" aria-label="Menu Sistema" icon="add">
              <q-tooltip>Inserir Novo Registro</q-tooltip>
            </q-btn>
          </q-toolbar>

      <div class="mx-0.1 q-gutter-sm row">
          <div>
              <q-tree selected-color="primary" no-selection-unset :key='forceRender' :nodes="lazy" ref="tree" @update:selected="selecionado" default-expand-all v-model:selected="selected" node-key="key">
                  <template v-slot:header-action="prop">
                      <div>{{ prop.node.label }}</div>
                      <div v-if="selected === prop.key" class="row" style="padding-left: 10px">
                          <q-btn  size="xs" glossy class="q-ml-md btn-scale" v-if="prop.node.plano.especificacao === 'Sintética'" color="primary" @click="insertNode" icon="add" style="width: 30px;" >
                              <q-tooltip>Inserir</q-tooltip>
                          </q-btn>
                          <q-btn size="xs" glossy class="q-ml-md btn-scale" color="warning" @click="editNode" icon="edit" style="width: 30px;">
                              <q-tooltip>Editar</q-tooltip>
                          </q-btn>
                          <q-btn v-if="!prop.node.children" glossy size="xs" class="q-ml-md btn-scale" color="negative" @click="deleteNode(prop)" icon="delete" style="width: 30px;">
                              <q-tooltip>Deletar</q-tooltip>
                          </q-btn>
                      </div>
                  </template>
              </q-tree>
          </div>
      </div>
      
      </q-card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
import { useQuasar, QSpinnerOval } from "quasar";
import PlanoDeContaModal from "@/components/cadastro/financeiro/PlanoDeContaModal.vue";
import { useGeral } from '@/stores/geral';

const $q = useQuasar();
const geral = useGeral();
const inserir = ref(false);

const forceRender = ref(0);
const nodePai = ref(null);
const selected = ref(null);
const listaPlanos = ref([]);
const lazy = ref<any>([]);
const movimentado = ref(false);
const tree = ref(null);

onMounted(() => {
  getList();
});

const selecionado = (target: any) => {
  // @ts-ignore
  tree.value.setExpanded(target, true);
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
      "financeiroPlanoConta/getPopulate",
      "post",
      {
        filtro: {
          lixo: false,
          entidade: geral.entidade._id,
        },
         sort: {
          identificador: 1
        }
      },
      undefined
    );
    // console.log('Leu o Banco de dados.');
    if (ret.valido) {
      listaPlanos.value = ret.data;
      await montaTree();
      $q.loading.hide();
    } else {
      listaPlanos.value = [];
      $q.loading.hide();
      $q.notify({
        color: "negative",
        message: ret.data && ret.data.message ? ret.data.message : "Falha ao obter a lista!",
      });
    }
  } catch (error) {
    $q.loading.hide();
  }
};

const montaTree = () => {
  let ultimoPai:any = null;
  let ultimoNode = null;

  const arrayDePais = [];

  for (let index = 0; index < listaPlanos.value.length; index++) {
    const plano:any = listaPlanos.value[index];
    const node = {
      label: plano.identificador + ' - ' + plano.descricao,
      key: plano._id,
      header: 'action',
      expandable: true,
      plano: plano
    };
    if (plano.financeiroPlanoContaPai) {
      if (plano.financeiroPlanoContaPai !== ultimoPai.plano._id) {
        let indiceJaFoiPai = -1;
        for (let index2 = 0; index2 < arrayDePais.length; index2++) {
          const nodePai = arrayDePais[index2];
          if (nodePai.plano._id === plano.financeiroPlanoContaPai) {
            indiceJaFoiPai = index2;
            break;
          }
        }
        if (indiceJaFoiPai < 0) {
          ultimoPai = ultimoNode;
          arrayDePais.push(ultimoPai);
        } else {
          ultimoPai = arrayDePais[indiceJaFoiPai];
        }
      }

      if (!ultimoPai.children) {
        ultimoPai.children = [];
      }
      ultimoPai.children.push(node);
    } else {
      lazy.value.push(node);
      ultimoPai = node;
      arrayDePais.push(ultimoPai);
    }
    ultimoNode = node;
  }
};

const deleteKey = (arr:Array<any>, key:String) => {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    if (element.key === key) {
      arr.splice(index, 1);
      return true;
    }
    if (element.children) {
      if (deleteKey(element.children, key)) {
        return true;
      }
    }
  }
  return false;
};

const deleteNode = async (prop: any) => {
  try {
    if (selected.value) {
      // @ts-ignore
      nodePai.value = tree.value.getNodeByKey(selected.value);
      // @ts-ignore
      const movimento = await useCustomFetch('financeiroMovimentacao/getPopulate', 'post', { filtro: { lixo: false, planoDeConta: nodePai.value.key }, limit: 1 }, undefined);
      if (movimento.valido) {
        if (movimento.data.length > 0) {
          $q.notify({
            color: 'negative',
            position: 'top',
            icon: 'warning',
            message: 'Impossível deletar, plano de conta possui lançamentos de movimentação!'
          });
        } else {
          // @ts-ignore
          if (nodePai.value.children !== undefined) {
            $q.notify({
              color: 'negative',
              position: 'top',
              icon: 'warning',
              message: 'Impossível deletar, plano de conta possui dependências!'
            });
          } else {
            if (geral.funcoesAcessos.financeiroPlanoContaDeletar) {
              $q.dialog({
                title: 'Confirmação',
                // @ts-ignore
                message: 'Deseja realmente deletar o plano de conta ' + nodePai.value.label,
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
                $q.loading.show({ spinner: QSpinnerOval });
                try {
                  // @ts-ignore
                  const ret = await useCustomFetch('financeiroPlanoConta/delete', 'post', { _id: nodePai.value.key, definitivo: false }, undefined);
                  if (ret.valido) {
                    $q.notify({
                      color: 'green',
                      position: 'top',
                      icon: 'mdi-check-all',
                      message: 'Registro excluído com sucesso!'
                    });
                    // @ts-ignore
                    deleteKey(lazy.value, nodePai.value.key);
                    forceRender.value++;
                  }
                } catch (error) {
                }
                $q.loading.hide();
              });
            }
          }
        }
      }
    }
  } catch (error) {
    $q.loading.hide();
  }
};

const insertNode = () => {
  if (geral.funcoesAcessos.financeiroPlanoContaInserir) {
    if (selected.value) {
      // @ts-ignore
      nodePai.value = tree.value.getNodeByKey(selected.value);
      inserir.value = true;
      openModal(nodePai.value,);
    }
  }
};

const editNode = () => {
  if (geral.funcoesAcessos.financeiroPlanoContaEditar) {
    if (selected.value) {
      // @ts-ignore
      nodePai.value = tree.value.getNodeByKey(selected.value);
      inserir.value = false;
      openModal(nodePai.value,);
    }
  }
};

const openModal = async (nodePai: any) => {
   $q.dialog({
    component: PlanoDeContaModal,
    persistent: true,
    componentProps: {
      inserir: inserir.value,
      nodePai:nodePai,
      id: !inserir.value?nodePai.key:null,
    },
  })
    .onOk(async (data) => {
      confirmSave(data);
    })
    .onCancel(() => { });
}

const confirmSave = (plano: any) => {
  const node = {
    label: plano.identificador + ' - ' + plano.descricao,
    key: plano._id,
    header: 'action',
    expandable: true,
    plano: plano
  };
  if (inserir.value) {

    $q.loading.hide();
    // @ts-ignore
    nodePai.value.children.push(node);
  } else {
    // @ts-ignore
    nodePai.value.label = node.label;
    // @ts-ignore
    nodePai.value.plano = node.plano;
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
