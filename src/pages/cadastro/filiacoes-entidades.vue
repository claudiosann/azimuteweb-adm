<template>
    <div class="container mx-auto p-1 sm:p-4">
        <q-table :rows="rows" :columns="columns" row-key="name" color="secondary" :pagination="initialPagination"
            rows-per-page-label="Registros por página:">
            <template v-slot:top>
                <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
                    :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon size="30px" class="ml-3 p-1  rounded text-white bg-gradient-to-l from-indigo-500 to-indigo-700" name="join_left" />
                    <q-toolbar-title><span class="mr-3 text-weight-medium"> {{ `Filiacões em Entidades (${rows.length})` }}</span></q-toolbar-title>
                    <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Nova"
                        v-if="geral.funcoesAcessos.entidadeInserir" @click="insertRow" aria-label="Menu Sistema" icon="note_add">
                        <q-tooltip>Nova Filiação</q-tooltip>
                    </q-btn>
                </q-toolbar>

            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="nomeRazao"> <q-img v-if="props.row.entidade.logo" class="rounded-borders" style="width: 48px;"
                            :ratio="48 / 48" :src="getUrlImagemThumb(props.row.entidade.logo)"></q-img> {{ `${props.row.entidade.nomeRazao} (${props.row.entidade.sigla})` }}
                    </q-td>

                    <q-td key="status">
                        
                        <q-badge :color="getCorStatus(props.row.status)" >{{ props.row.status }}</q-badge>
                    </q-td>
                    <q-td key="action">
                <q-btn btn-scale push round glossy @click="editRow(props.rowIndex, props.row._id)" icon="preview">
                <q-tooltip>
                    Visualizar
                </q-tooltip>
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
import FiliacaoEntidadeModal from "../../components/cadastro/FiliacaoEntidadeModal.vue";
import { useGeral } from '../../stores/geral';

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
    name: 'nomeRazao',
    required: true,
    label: 'Entidade Mãe',
    align: 'left',
    field: row => row.entidade.nomeRazao,
    sortable: true
},

{
    name: 'status',
    label: 'Status',
    align: 'left',
    field: 'status',
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

const getCorStatus = (status) => {
    switch (status) {
        case 'Ativa':
            return 'positive';
        case 'Em Análise':
            return 'warning';
        case 'Aguardando Pagamento':
            return 'teal';
        case 'Iniciada':
            return 'primary';
        case 'Recusada':
            return 'negative';
        case 'Cancelada':
            return 'grey';
        case 'Desativada':
            return 'accent';
        default:
            return 'red';
    }
}

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
            "filiacaoEntidade/getPopulate",
            "post",
            {
                filtro: {
                    entidadeFilha: geral.entidade._id,
                    lixo: false
                },
                populateObj: [{
                    path: 'entidade',
                    select: { nomeRazao: 1, logo: 1, sigla: 1, nomeFantasia: 1 }
                }]
            },
            undefined
        );
        // console.log('Leu o Banco de dados.');
        if (ret.valido) {
            rows.value = ret.data;
            $q.loading.hide();
        } else {
            rows.value = [];
            console.log(ret.data);
            $q.loading.hide();
            $q.notify({
                color: "negative",
                message: ret.data && ret.data.message ? ret.data.message : "Falha ao obter a lista de entidades!",
            });
        }
    } catch (error) {
        $q.loading.hide();
    }
};

const deleteRow = async (index, id) => {
    if (geral.funcoesAcessos.entidadeDeletar) {
        $q.loading.show({
            spinner: QSpinnerOval,
            spinnerColor: "white",
            spinnerSize: 60,
            message: "Deletando Registro... Aguarde!",
            messageColor: "white",
        });
        const ret = await useCustomFetch("entidade/delete", "post", { _id: id }, undefined);
        $q.loading.hide();
        if (ret.valido) {
            $q.notify({
                type: "positive",
                position: "top",
                message: "Registro excluído com sucesso!",
            });
            rows.value.splice(index, 1);
        } else {
            console.log(ret.data);
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
    if (geral.verificaAcesso("entidadeEditar")) {
        openModal(index, id, copy);
    }
};
const insertRow = () => {
    if (geral.verificaAcesso("entidadeInserir")) {
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
        component: FiliacaoEntidadeModal,
        persistent: true,
        componentProps: {
            copia: copy,
            inserir: inserir.value,
            id: idSelecionado.value,
        },
    }).onOk(async (data) => {
        console.log(data);
        console.log('aqui');
        confirmSave();
    }).onCancel(() => {
        console.log('ops');
    });
}

const confirmSave = () => {
    getList();
    indexSelecionado.value = -1;
    console.log('atualizou');
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
