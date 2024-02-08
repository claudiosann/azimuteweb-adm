<template>
    <div class="container mx-auto p-1 sm:p-4">

        <q-grid v-if="rows" :data="rows" :columns="columns" :columns_filter="true">

            <template v-slot:top>
                <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
                    :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-lime-400 to-gray-600" name="fas fa-calendar-alt"
                        size="30px" />
                    <q-toolbar-title><span class="mr-3 text-weight-medium">Eventos</span></q-toolbar-title>
                    <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir"
                        v-if="geral.funcoesAcessos.eventoInserir" @click="insertRow" aria-label="Menu Sistema" icon="add">
                        <q-tooltip>Inserir Novo Registro</q-tooltip>
                    </q-btn>
                </q-toolbar>

            </template>

             <template v-slot:body="props">
              <q-tr :props="props">
                    <q-td key="numero"> {{ props.row.numero }} </q-td>
                    <q-td key="nome">
                      <q-img v-if="props.row.imagem" class="rounded-borders" style="width: 90px;" :ratio="1200 / 630" :src="getUrlImagemThumb(props.row.imagem)"></q-img>
                      {{ props.row.nome }}
                    </q-td>
                    <q-td key="sigla"> {{ props.row.sigla }} </q-td>
                    <q-td key="status"> {{ props.row.status }} </q-td>
                    <q-td key="uf"> {{ props.row.endereco.uf }} </q-td>
                    <q-td key="inicio">{{ $geralService.getDataFormatada(props.row.inicio) }}</q-td>
                    <q-td key="fim">{{ $geralService.getDataFormatada(props.row.fim) }}</q-td>
                    <q-td key="updated_at">{{ $geralService.getDataFormatada(props.row.updated_at) }}</q-td>
                    <q-td key="action">
                        <q-btn round push glossy btn-scale icon='settings' @click="$router.push('/cadastro/eventos/' + props.row._id)">
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
import EventoModal from "/components/cadastro/EventoModal.vue";
import { useGeral } from '/stores/geral';

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
        name: 'numero',
        required: true,
        label: 'Número',
        align: 'left',
        field: 'numero',
        sortable: true
    },
    {
        name: 'nome',
        required: true,
        label: 'Nome',
        align: 'left',
        field: 'nome',
        sortable: true
    },
    {
        name: 'sigla',
        required: true,
        label: 'Sigla',
        align: 'left',
        field: 'sigla',
        sortable: true,
    },
    {
        name: 'status',
        required: true,
        label: 'Status',
        align: 'left',
        field: 'status',
        sortable: true,
        filter_type: 'select',
        column_options: [
            'Ativo',
            'Inativo',
            'Cancelado',
            'Finalizado',
        ]
        
    },
    {
        name: 'endereco.uf',
        required: true,
        label: 'UF',
        align: 'left',
        field: 'endereco.uf',
        sortable: true
    },
    {
        name: 'inicio',
        label: 'Início',
        align: 'left',
        field: 'inicio',
        type: 'date',
        sortable: true
    },
    {
        name: 'fim',
        label: 'Fim',
        align: 'left',
        field: 'fim',
        type: 'date',
        sortable: true
    },
    {
        name: 'updated_at',
        align: 'left',
        field: 'updated_at',
        label: 'Última Alteração',
        type: 'date',
        sortable: true
    },
    {
        name: 'action',
        label: 'Ação',
        align: 'left',
        field: '',
        sortable: false,
        filter_type: 'none'
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

        if (!geral || !geral.pessoa || !geral.pessoa._id) {
            $q.loading.hide();
             $q.notify({
                color: "negative",
                message: ret.data && ret.data.message ? ret.data.message : "Falha ao obter os eventos logout e logue novamente!",
             });
            return
        }
        const ret = await useCustomFetch(
            "evento/getPopulate",
            "post",
            {
                filtro: { lixo: false, 'administradores.pessoa': geral.pessoa._id },
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
    if (geral.funcoesAcessos.eventoDeletar) {
        $q.loading.show({
            spinner: QSpinnerOval,
            spinnerColor: "white",
            spinnerSize: 60,
            message: "Deletando Registro... Aguarde!",
            messageColor: "white",
        });
        const ret = await useCustomFetch("evento/delete", "post", { _id: id, definitivo: false }, undefined);
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
    if (geral.verificaAcesso("eventoEditar")) {
        openModal(index, id, copy);
    }
};
const insertRow = () => {
    if (geral.verificaAcesso("eventoInserir")) {
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
        component: EventoModal,
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
