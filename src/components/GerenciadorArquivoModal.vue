<template>
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
        <q-card>
            <!-- GO toolbar -->
            <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                <q-icon name="check" size="30px" />
                <q-toolbar-title>
                    <q-item>
                        <q-item-section>
                            <q-item-label>Selecionar Arquivo</q-item-label>
                            <q-item-label v-if="extensao" caption>{{ `Somente ${extensao}` }}</q-item-label>
                        </q-item-section>
                    </q-item>

                </q-toolbar-title>
                <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                    :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
            </q-toolbar>


            <!-- <pre>{{ raiz }}</pre> -->
            <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll">

                <q-breadcrumbs gutter="sm" style="font-size: 15px">
                    <q-breadcrumbs-el class="cursor-pointer" v-for="(item, index) in pastas" @click="navegar(index, false)"
                        :key="index">
                        <q-btn :icon="index === 0 ? 'home' : undefined" flat :label="item" />

                    </q-breadcrumbs-el>
                </q-breadcrumbs>
                <q-separator />

                <div class="col-12 flex flex-center">
                    <q-list class="w-full container" style="background: transparent !important;">
                        <q-uploader class="q-pa-sm w-full" ref="uploader" auto-upload  @uploaded="finalizar"
                            :form-fields="[{ name: 'caminho', value: lista.Prefix }]" :accept="extensao"
                            :url="$geralService.configuracoes.BASE_REST + 'api/uploadS3'" label="Fazer Novo Upload"
                            :multiple="multiple">
                            <template v-slot:list="scope">
                                <q-list separator>
                                    <q-item v-for="(file, index) in scope.files" :key="index">
                                        <q-item-section>
                                            <q-item-label class="ellipsis">
                                                {{ file.name }}
                                            </q-item-label>

                                            <q-item-label
                                                :class="{ 'text-red': file.__status === 'failed', 'text-green': file.__status === 'uploaded' }"
                                                caption>
                                                Status: {{ file.__status }}
                                            </q-item-label>

                                            <q-item-label caption>
                                                {{ file.__sizeLabel }} / {{ file.__progressLabel }}
                                            </q-item-label>
                                        </q-item-section>

                                        <q-item-section v-if="file.__img" thumbnail>
                                            <img :src="file.__img.src">
                                        </q-item-section>

                                        <q-item-section top side>
                                            <q-btn size="12px" flat dense round icon="delete"
                                                @click="scope.removeFile(file)" />
                                        </q-item-section>
                                    </q-item>

                                </q-list>
                            </template>
                        </q-uploader>
                        <q-separator />



                        <div pt-2>Arquivos da Nuvem</div>


                        <div v-if="!travarCaminhoUpload">
                        <q-item @click="buscar(item.Prefix, false)" v-for="(item, index1) in lista.CommonPrefixes" :key="index1"
                            clickable v-ripple>
                            <q-item-section avatar top>
                                <q-avatar icon="folder" color="amber" text-color="white" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ removeCaminho(item.Prefix) }}</q-item-label>
                            </q-item-section>
                        </q-item>
                        </div>
                        <q-item class="px-0" clickable v-for="(file) in lista.Contents" :key="file.Etag" v-ripple>
                            <q-item-section clickable @click="save(file.Key)" avatar top>
                                <q-avatar
                                    :color="file.extensao === 'jpg' || file.extensao === 'jpg' ? 'primary' : 'secondary'"
                                    :icon="file.extensao === 'jpg' || file.extensao === 'jpg' ? 'image' : 'assignment'"
                                    text-color="white" />
                            </q-item-section>

                            <q-item-section clickable @click="save(file.Key)">
                                <q-item-label>{{ removeCaminho(file.Key) }}</q-item-label>
                                <q-item-label caption>Tamanho: {{ file.Size / 1000 }}kb</q-item-label>
                            </q-item-section>
                            <q-item-section v-if="!travarDeletar" side>
                                <q-btn size="14px" flat dense round icon="delete" @click="deleteFile(file)" />
                            </q-item-section>

                        </q-item>
                    </q-list>
                </div>
               
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>

import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';
const { $geralService, $constantes } = useNuxtApp()
const geral = useGeral();

const props = defineProps({
    raiz: null,
    caminhoInicial: {type: String, default: ''},
    travarCaminhoUpload: null,
    multiple: null,
    travarDeletar: null,
    extensao: null
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const $q = useQuasar();

const tab = ref('arquivos');
const pastas = ref<any>([props.raiz + props.caminhoInicial]);
const lista = ref<any>([]);

onMounted(async () => {
    navegar(0, true);
});

const cancel = async () => {
    onDialogCancel();
    return;
};
const save = async (caminho: any) => {
    onDialogOK($geralService.configuracoes.BASE_S3 + caminho);
};

const finalizar = (val: any) => {
    // console.log(val.files[0].name);
    // save(props.raiz + '/' + val.files[0].name);
    navegar((pastas.value.length - 1), true);
    // this.tab = 'arquivos';
};

const deleteFile = async (file: any) => {
    if (!props.travarDeletar) {
        $q.loading.show({ spinner: QSpinnerOval });
        let ret = await $geralService.deleteFile(file.Key, $constantes.THUMBNAILS);
        if (ret) {
            navegar((pastas.value.length - 1), true);
        }
        $q.loading.hide();
    }
};

const confirmUpload = () => {
    // console.log('tete');
};

const removeCaminho = (caminho: any) => {
    if (lista.value.Prefix) {
        caminho = caminho.replace(lista.value.Prefix, '');
        return caminho.replace('/', '');
    } else {
        return caminho;
    }
};

const navegar = async (idx: number, force: boolean) => {

    if (force || idx < (pastas.value.length - 1)) {
        let caminho = '';
        for (let index = 0; index < pastas.value.length; index++) {
            if (index <= idx) {
                caminho += (pastas.value[index] + '/');
            }
        }
        caminho = caminho.replace('(Home)', props.raiz);
        // console.log(caminho);
        buscar(caminho, idx===0);
    }
    // console.log(idx);
};

const buscar = async (caminho: any, forcar: boolean) => {
    if (!props.travarCaminhoUpload || forcar) {
        $q.loading.show({ spinner: QSpinnerOval });
        try {
            // console.log(caminho);
            const ret: any = await useCustomFetch('api/listObjectsS3', 'post', {
                caminho: caminho

            }, undefined);

            if (ret.valido) {
                lista.value = ret.data;

                lista.value.Contents = lista.value.Contents.filter((file: any, index: number) => {
                    if (file.Size === 0) {
                        return false;
                    }

                    if (props.extensao) {
                        // console.log(props.extensao);
                        // console.log(file);
                        if (!file.Key.endsWith(props.extensao)) {
                            return false;
                        }
                    }

                    if (((file.Key.endsWith('jpg') || file.Key.endsWith('png')) && file.Key.startsWith('thumbnail') || file.Key.endsWith('/'))) {
                        return false;
                    }
                    return true;
                });
                pastas.value = ret.data.Prefix.replace(props.raiz, '(Home)').split('/');
                pastas.value.splice((pastas.value.length - 1), 1);
            }
        } catch (error) {
            // console.log(error);
        }
        $q.loading.hide();
    }

}

</script>

