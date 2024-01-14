<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon name="star" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Destaque</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave"
                        :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                            <div class="row q-ma-sm q-col-gutter-sm">
                                 
                                <div class="col-md-6 col-sm-12 col-12">
                                    <q-input  hide-bottom-space outlined v-model="state.destaque.titulo"
                                        label="Título" :dense="dense" />
                                </div>
                                <div class="col-md-6 col-sm-12 col-12">
                                    <q-input hide-bottom-space outlined v-model="state.destaque.subTitulo" label="Sub-Título"
                                        :dense="dense" />
                                </div>
                               
                                <div class="col-md-3 col-sm-4 col-12">
                                    <CinputDate outlined v-model="state.destaque.inicio" label="Data de Publicação"
                                        :dense="dense" @blur="$v.destaque.inicio.$touch"
                                        :error="$v.destaque.inicio.$error" error-message="Campo obrigatório" />
                                </div>
                                <div class="col-md-3 col-sm-4 col-12">
                                    <CinputDate outlined v-model="state.destaque.fim"
                                        label="Remoção Automática" :dense="dense" />
                                </div>
                                 <div class="col-md-6 col-sm-12 col-12">
                                        <q-input  hide-bottom-space outlined v-model="state.destaque.link"
                                            label="Link / URL" :dense="dense" @blur="$v.destaque.link.$touch"
                                            :error="$v.destaque.link.$error" error-message="Campo obrigatório" />
                                    </div>
                                <div class="col-12">
                                    <q-field outlined label="imagem" stack-label
                                        :error="!(imageData || state.destaque.imagem)" error-message="Imagem obrigatória">
                                        <div mt-2>
                                            <q-card-section class="flex justify-center">
                                                <img class="responsive" style="max-height: 300px;" :src="getUrlImagem">
                                            </q-card-section>
                                            <q-card-section class="!pt-0">
                                                <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
                                                    <q-btn class="mr-2 " @click="buscarImagem" outline color="primary"
                                                        label="Buscar Imagem" />
                                                    <!-- <q-btn class="mr-2" v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && state.destaque.imagem !== undefined && state.destaque.imagem !== '')" @click="imageData = null" outline color="secondary" label="Ficar Sem" /> -->
                                                    <q-btn class=""
                                                        v-if="imageData !== '' && (state.destaque.imagem !== undefined && state.destaque.imagem !== '')"
                                                        @click="imageData = ''" outline color="deep-purple"
                                                        label="Restaurar" />

                                                </div>
                                            </q-card-section>
                                        </div>
                                    </q-field>

                                </div>
                            </div>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import SeletorEvento from "../SeletorEvento.vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';
import { reactive } from 'vue';
import ImageUpload2 from "../ImageUpload2.vue";

const props = defineProps({
    id: { type: String, default: null },
    copia: null,
    obj: null,
});
const geral = useGeral();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const state: any = reactive({
    destaque: {
        entidade: geral.entidade._id,
        tipo: 'Evento',
        link: '',
        imagem: '',
        albuns: [],
    }
});
const dense = ref(false);
const $q = useQuasar();
const { $geralService } = useNuxtApp();


// GO valida
const validations = {
    destaque: {
        link: {
            required
        },
        imagem: {
            required
        },
        inicio: {
            required
        }
    }
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

onBeforeMount(async () => {
    if (props.id) {
        const ret: any = await useCustomFetch('destaque/getPopulate', 'post', {
            filtro: {
                _id: props.id
            },
            populateObj: []
        }, undefined);
        if (ret.valido) {
            state.destaque = ret.data[0];
            console.log(ret.data);
            if (props.copia) {
                state.destaque.titulo = state.destaque.titulo + " (Cópia)";
                state.destaque._id = undefined;
                state.destaque.__v = undefined;
                inserir.value = true;
            } else {
                inserir.value = false;
            }
        } else {
            setTimeout(async () => {
                await cancel();
                // navigateTo('/login');
            }, 1);
        }
    } else {
        inserir.value = true;

        if(props.obj){
            state.destaque = props.obj;
        }
    }
});

const imageData = ref<any>('');
const imageUrl = ref('');


const getUrlImagem = computed(() => {
    return $geralService.getUrlImagem(imageData.value, state.destaque, 'imagem', imageUrl.value);
});

const buscarImagem = () => {
    $q.dialog({
        component: ImageUpload2,
        persistent: true,
        componentProps: {
            winit: 1200,
            hinit: 630
        },
    })
        .onOk(async (data) => {
            confirmImageUpload(data.data, data.fileName)
        })
        .onCancel(() => { });

};
const confirmImageUpload = (blobImage: any, fileName: string) => {
    if (fileName !== undefined && fileName !== null) {
        imageData.value = blobImage;
        imageUrl.value = window.URL.createObjectURL(blobImage);
    }
};

const beforeSave = () => {
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Validando dados... Aguarde!',
        messageColor: 'white'
    });
    // $v.value.destaque.vinculos.$touch();
    $v.value.destaque.$touch();

    if ($v.value.destaque.$error || !(imageData.value || state.destaque.imagem)) {

        $q.loading.hide();
        $q.notify({
            color: 'warning',
            position: 'top',
            icon: 'check',
            message: 'Preeencha todos os campos obrigatórios para salvar!'
        });
        return;

    }

    delete state.destaque.__v;


    const newDestaque = JSON.parse(JSON.stringify(state.destaque));

    if (imageData.value !== '') {
        $q.loading.show({
            spinner: QSpinnerOval,
            spinnerColor: 'white',
            spinnerSize: 60,
            message: 'Fazendo upload de imagem...Aguarde!',
            messageColor: 'white'
        });
    }


    $geralService.executaUpload(
        newDestaque,
        'imagem',
        imageData.value,
        inserir.value,
        'jpg',
        'destaques/imagens/',
        save,
        undefined,
        true
    );
};

const cancel = async () => {
    console.log('passou aquitttt');
    onDialogCancel();
    $q.notify({
        position: "top",
        type: "info",
        textColor: "white",
        message: (inserir.value ? "Inserção " : "Edição ") + "cancelada!",
    });
    return;
};
// TO save
// TO save
const save = async (newDestaque: any, nomeTempFile: any) => {
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Salvando registro...Aguarde!',
        messageColor: 'white'
    });
    let url = 'destaque';
    let tipo = 'post';
    if (!inserir.value) {
        url += ('/' + props.id);
        tipo = 'put';
    }

    const ret: any = await useCustomFetch(url, tipo, newDestaque, undefined);

    if (ret.valido) {
        $q.loading.hide();
        $q.notify({
            color: 'green',
            position: 'top',
            icon: 'check',
            message: 'Registro salvo com sucesso!'
        });
        onDialogOK(ret.data);
    } else {
        console.log(ret);
        $q.loading.hide();
        if (nomeTempFile) {
            $geralService.deleteImagem(nomeTempFile);
            $q.loading.hide();
        }
    }
};

</script>

