<template>
    <div class="container mx-auto p-1 sm:p-4">
        <q-table :rows="rows" :columns="columns" row-key="name" color="secondary" :pagination="initialPagination"
            rows-per-page-label="Registros por página:">
            <template v-slot:top>
                <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
                    :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-pink-400 to-pink-600" name="fas fa-trophy"
                        size="30px" />
                    <q-toolbar-title><span class="mr-3 text-weight-medium">Campeonato</span></q-toolbar-title>
                    <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir"
                        v-if="geral.funcoesAcessos.campeonatoInserir" @click="insertRow" aria-label="Menu Sistema" icon="add">
                        <q-tooltip>Inserir Novo Registro</q-tooltip>
                    </q-btn>
                </q-toolbar>

            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="logo"> <q-img v-if="props.row.logo" class="rounded" style="width: 60px;"
                        :ratio="1200 / 630" :src="getUrlImagemThumb(props.row.logo)"></q-img></q-td>
                        <q-td key="numero"> {{ props.row.numero }} </q-td>
                        <q-td key="descricao"> {{ props.row.descricao }} </q-td>
                        <q-td key="ano"> {{ props.row.ano }} </q-td>
                    <q-td key="action">
                        <q-btn btn-scale push round glossy icon="more_vert">
                            <q-menu>
                                <q-list separator link>
                                    <q-item>
                                        <div class="row content-center">
                                            <span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}
                                        </div>
                                    </q-item>
                                    <q-item v-if="geral.funcoesAcessos.campeonatoInserir" clickable v-close-popup
                                        @click="editRow(props.rowIndex, props.row._id)">
                                        <q-item-section avatar>
                                            <q-avatar rounded-xl color="amber-7" text-color="white" icon="edit" />
                                        </q-item-section>
                                        <q-item-section avatar> Editar </q-item-section>
                                    </q-item>
                                    <q-item v-if="geral.funcoesAcessos.campeonatoInserir" clickable v-close-popup
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
import CampeonatoModal from "../../components/cadastro/CampeonatoModal.vue";
import DestaqueModal from "../../components/cadastro/DestaqueModal.vue";
import { useGeral } from '../../stores/geral';

const { $geralService } = useNuxtApp()
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
        name: 'logo',
        required: true,
        label: 'Imagem',
        align: 'left',
        field: 'Imagem',
        sortable: true
    },
    {
        name: 'numero',
        required: true,
        label: 'Número',
        align: 'left',
        field: 'Número',
        sortable: true
    },
    {
        name: 'descricao',
        required: true,
        label: 'Título',
        align: 'left',
        field: 'descricao',
        sortable: true
    },
    {
        name: 'ano',
        required: true,
        label: 'Ano',
        align: 'left',
        field: 'ano',
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
            "campeonato/getPopulate",
            "post",
            {
                filtro: {
                    lixo: false,
                    entidade: geral.entidade._id,
                },
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
    if (geral.funcoesAcessos.campeonatoDeletar) {
        $q.loading.show({
            spinner: QSpinnerOval,
            spinnerColor: "white",
            spinnerSize: 60,
            message: "Deletando Registro... Aguarde!",
            messageColor: "white",
        });
        const ret = await useCustomFetch("campeonato/delete", "post", { _id: id }, undefined);
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
    if (geral.verificaAcesso("campeonatoEditar")) {
        openModal(index, id, copy);
    }
};
const insertRow = () => {
    if (geral.verificaAcesso("campeonatoInserir")) {
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
        component: CampeonatoModal,
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
