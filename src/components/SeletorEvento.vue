<template>
    <q-dialog :persistent="true" ref="dialogRef" @hide="onDialogHide">
        <q-card style="min-width: 300px">
            <q-toolbar v-if="showBar" :class="$q.dark.isActive ? 'text-grey-2 bg-black-8' : 'bg-grey-2 text-grey-9'">
                <q-icon name="mdi-home-modern" size="30px" />
                <q-toolbar-title>Localizar Evento</q-toolbar-title>
                <q-btn flat round dense @click="cancel" icon="close" />
                <!-- GO btnSave -->
            </q-toolbar>
            <q-card-section>
                <q-input class="q-mb-md" outlined autofocus  hint="Pressione ENTER para localizizar" label="Nome, sigla ou número"
                   v-model="nome" @keyup.enter="buscarEvento">
                    <template v-slot:append>
                        <q-btn @click="buscarEvento" round dense color="primary" icon="search" />
                    </template>
                </q-input>
                <q-list class="rounded-borders" separator bordered v-if="!muitosResultados && listaEventos.length > 0"
                    highlight inset-separator>
                    <q-item clickable v-ripple @click="confirm(evento)" v-for="evento in listaEventos" :key="evento._id">
                        <q-item-section avatar>
                            <q-avatar rounded size="64px">
                                <q-img :src="getUrlImagem(evento)"></q-img>
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-bold" lines="1">{{ evento.sigla}}</q-item-label>
                            <q-item-label class="caption" lines="2">{{ evento.nome }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
                <div style="margin-top:5px;" v-if="!muitosResultados && listaEventos.length === 0">
                    Nenhum Resultado.
                </div>
                <div style="margin-top:5px;" v-if="muitosResultados">
                    Muitos Resultados! Melhore seu filtro.
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
import { useDialogPluginComponent } from 'quasar';

const props = defineProps({
    showBar: { type: Boolean, default: true },
    populateObj: { type: Array, default: [] },
    select: { type: Object, default: {
            nome: 1,
            sigla: 1,
            numero: 1,
            etapa: 1,
            inicio: 1,
            imagem: 1
        } }
});

defineEmits([
    ...useDialogPluginComponent.emits
])

const { $geralService } = useNuxtApp()

const $q = useQuasar();

const listaEventos = ref<any>([]);
const muitosResultados = ref(false);
const nome = ref('');


const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const getUrlImagem = (evento: any) => {
    console.log(evento);
    return $geralService.getUrlS3Thumb(evento.imagem, {
        height: 128
    });
};


const isNumeric = (n: any) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

const getFiltro = () => {
    const filtro: any = {};
    if (nome.value.length > 0) {
        if (isNumeric(nome.value)) {
            filtro.numero = nome.value;
        } else {
            filtro.$or = [
                {
                    sigla: {
                        $regex: '.*' + nome.value + '.*', $options: 'i'
                    }
                },
                {
                    nome: {
                        $regex: '.*' + nome.value + '.*', $options: 'i'
                    }
                }
            ];
        }
    }
    return filtro;
}


const buscarEvento = async () => {
    if (nome.value) {
        try {
            const ret = await useCustomFetch('evento/getPopulate', 'post', {
                filtro: getFiltro(),
                populateObj: props.populateObj,
                select: props.select,
                maxRetorno: 10
            }, undefined);
            if (ret.valido) {
                muitosResultados.value = false;
                listaEventos.value = ret.data;
            } else {
                if (ret.data.erroMaxRetorno) {
                    muitosResultados.value = true;
                } else {
                    console.error(ret);
                    $q.notify({
                        position: 'top',
                        icon: 'error',
                        color: 'negative',
                        message: 'Falha ao buscar evento!'
                    });
                    muitosResultados.value = false;
                }
                listaEventos.value = [];
            }
        } catch (error) {
            console.error(error);
            $q.notify({
                position: 'top',
                icon: 'error',
                color: 'negative',
                message: 'Erro de comunicação!'
            });
        }
    } else {
        listaEventos.value = [];
    }
}

// GO confirm
const confirm = (evento: any) => {
    onDialogOK(evento)
};
// GO confirm
const cancel = () => {
    onDialogCancel();
};
</script>
