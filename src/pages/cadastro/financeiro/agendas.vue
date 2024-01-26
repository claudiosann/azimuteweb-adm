<template>
    <div class="container mx-auto p-1 sm:p-4">
        <q-table :rows="rows" :columns="columns" row-key="name" color="secondary" :pagination="initialPagination"
            rows-per-page-label="Registros por página:">
            <template v-slot:top>
                <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
                    :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-indigo-700 to-sky-400" name="calendar_month"
                        size="30px" />
                    <q-toolbar-title><span class="mr-3 text-weight-medium">Agenda Financeira</span></q-toolbar-title>
                    <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir"
                        v-if="geral.funcoesAcessos.financeiroAgendaInserir" @click="insertRow" aria-label="Menu Sistema" icon="add">
                        <q-tooltip>Inserir Novo Registro</q-tooltip>
                    </q-btn>
                </q-toolbar>

            </template>
            <template v-slot:body="props">
                
                <q-tr :props="props" :class="{'az-selecionado3': props.row.tipo=='C', 'az-selecionado2': props.row.tipo == 'D' }">
                   <q-td key="tipo">
                    <q-avatar size="32px" font-size="20px" :color="props.row.tipo=='C'?'positive':'negative'" text-color="white">
                        {{ props.row.tipo }}                    
                    </q-avatar>
                </q-td>
                <q-td key="dataVencimento">{{ $geralService.getDataFormatada(props.row.dataVencimento) }}</q-td>
                <q-td key="descricao">{{ props.row.descricao }}</q-td>
                <q-td key="valor">{{ $geralService.numeroParaMoeda(props.row.valor) }}</q-td>
                <q-td key="conta">{{ props.row.conta.descricao }}</q-td>
                <!-- <q-td key="planoDeConta">{{ props.row.planoDeConta }}</q-td> -->
                <q-td key="status"><q-chip class="q-mb-md" :color="props.row.status === 'Aberto' ? 'warning' : props.row.status === 'Concluído' ? 'positive' : 'negative'" text-color="white" :icon="props.row.status === 'Concluído' ? 'event_available' : props.row.status === 'Aberto' ? 'event' : 'event_busy'">
                                      {{ props.row.status }}
                                    </q-chip></q-td>
                    <q-td key="action">
                        <q-btn btn-scale push round glossy icon="more_vert">
                            <q-menu>
                                <q-list separator link>
                                    <q-item>
                                        <div class="row content-center">
                                            <span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}
                                        </div>
                                    </q-item>
                                    <q-item v-if="geral.funcoesAcessos.financeiroAgendaInserir" clickable v-close-popup
                                        @click="editRow(props.rowIndex, props.row._id)">
                                        <q-item-section avatar>
                                            <q-avatar rounded-xl color="amber-7" text-color="white" icon="edit" />
                                        </q-item-section>
                                        <q-item-section avatar> Editar </q-item-section>
                                    </q-item>
                                    <q-item v-if="geral.funcoesAcessos.financeiroAgendaInserir" clickable v-close-popup
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
import AgendaModal from "@/components/cadastro/financeiro/AgendaModal.vue";
import { useGeral } from '@/stores/geral';

const { $geralService } = useNuxtApp()
const $q = useQuasar();
const geral = useGeral();
const inserir = ref(false);
const idSelecionado = ref({});
const indexSelecionado = ref(-1);
const rows = ref([]);
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
        name: 'dataVencimento',
        align: 'left',
        field: 'dataVencimento',
        label: 'Vencimento',
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
        name: 'valor',
        required: true,
        label: 'Valor',
        align: 'left',
        field: 'valor',
        sortable: true
    },
    {
        name: 'conta',
        required: true,
        label: 'Conta',
        align: 'left',
        field: 'Conta',
        sortable: true
    },
    // {
    //   name: 'planoDeConta',
    //   required: true,
    //   label: 'Plano De Conta',
    //   align: 'left',
    //   field: 'Plano De Conta',
    //   sortable: true
    // },
    {
        name: 'status',
        required: true,
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

const getUrlImagemThumb = (caminho) => {
    return $geralService.getUrlS3Thumb(caminho, {
        height: 128
    })
}

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
            "financeiroAgenda/getPopulate",
            "post",
            {
                filtro: {
                    lixo: false,
                    entidade: geral.entidade._id,
                },
                sort: {
                    dataVencimento: 1,
                },
                
                populateObj: ['conta']
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

const deleteRow = async (index, id) => {
    if (geral.funcoesAcessos.financeiroAgendaDeletar) {
        $q.loading.show({
            spinner: QSpinnerOval,
            spinnerColor: "white",
            spinnerSize: 60,
            message: "Deletando Registro... Aguarde!",
            messageColor: "white",
        });
        const ret = await useCustomFetch("financeiroAgenda/delete", "post", { _id: id, definitivo: true }, undefined);
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
    if (geral.verificaAcesso("financeiroAgendaEditar")) {
        openModal(index, id, copy);
    }
};
const insertRow = () => {
    if (geral.verificaAcesso("financeiroAgendaInserir")) {
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
        component: AgendaModal,
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

<style scoped>
.truncate {
    width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
