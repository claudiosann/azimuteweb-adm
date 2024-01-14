<template>
    <q-dialog :persistent="true" ref="dialogRef" @hide="onDialogHide">
        <q-card style="min-width: 300px">
            <q-toolbar v-if="showBar" :class="$q.dark.isActive ? 'text-grey-2 bg-black-8' : 'bg-grey-2 text-grey-9'">
                <q-icon name="mdi-home-modern" size="30px" />
                <q-toolbar-title>Localizar Entidade</q-toolbar-title>
                <q-btn flat round dense @click="cancel" icon="close" />
                <!-- GO btnSave -->
            </q-toolbar>
            <q-card-section>
                <q-input class="q-mb-md" outlined autofocus hint="Pressione ENTER para localizizar" label="Nome, sigla ou número"
                   v-model="nome" @keyup.enter="buscarEntidade">
                    <template v-slot:append>
                        <q-btn @click="buscarEntidade" round dense color="primary" icon="search" />
                    </template>
                </q-input>
                <q-list class="rounded-borders" separator bordered v-if="!muitosResultados && listaEntidades.length > 0"
                    highlight inset-separator>
                    <q-item clickable v-ripple @click="confirm(entidade)" v-for="entidade in listaEntidades" :key="entidade._id">
                        <q-item-section avatar>
                            <q-avatar rounded size="64px">
                                <q-img :src="getUrlImagem(entidade)"></q-img>
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-bold" lines="1">{{ entidade.sigla}}</q-item-label>
                            <q-item-label class="caption" lines="2">{{ entidade.nome }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
                <div style="margin-top:5px;" v-if="!muitosResultados && listaEntidades.length === 0">
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
            nomeRazao: 1,
            sigla: 1,
            nomeFantasia: 1,
            logo: 1
        } }
});

defineEmits([
    ...useDialogPluginComponent.emits
])

const { $geralService } = useNuxtApp()

const $q = useQuasar();

const listaEntidades = ref<any>([]);
const muitosResultados = ref(false);
const nome = ref('');


const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const getUrlImagem = (entidade: any) => {
    console.log(entidade);
    return $geralService.getUrlS3Thumb(entidade.logo, {
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
            filtro.cnpj = nome.value;
        } else {
            filtro.$or = [
                {
                    sigla: {
                        $regex: '.*' + nome.value + '.*', $options: 'i'
                    }
                },
                {
                    nomeRasao: {
                        $regex: '.*' + nome.value + '.*', $options: 'i'
                    }
                },
                {
                    nomeFantasia: {
                        $regex: '.*' + nome.value + '.*', $options: 'i'
                    }
                }
            ];
        }
    }
    return filtro;
}


const buscarEntidade = async () => {
    if (nome.value) {
        try {
            const ret = await useCustomFetch('entidade/getPopulate', 'post', {
                filtro: getFiltro(),
                populateObj: props.populateObj,
                select: props.select,
                maxRetorno: 10
            }, undefined);
            if (ret.valido) {
                muitosResultados.value = false;
                listaEntidades.value = ret.data;
            } else {
                if (ret.data.erroMaxRetorno) {
                    muitosResultados.value = true;
                } else {
                    console.error(ret);
                    $q.notify({
                        position: 'top',
                        icon: 'error',
                        color: 'negative',
                        message: 'Falha ao buscar entidade!'
                    });
                    muitosResultados.value = false;
                }
                listaEntidades.value = [];
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
        listaEntidades.value = [];
    }
}

// GO confirm
const confirm = (entidade: any) => {
    onDialogOK(entidade)
};
// GO confirm
const cancel = () => {
    onDialogCancel();
};
</script>
