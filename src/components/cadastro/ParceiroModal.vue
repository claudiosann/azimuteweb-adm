<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon name="fa-solid fa-handshake" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Parceiro</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave"
                        :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                            <div class="row q-ma-sm q-col-gutter-sm">
                                <div class="col-md-5 col-sm-12 col-12">
                                    <q-input ref="nome" hide-bottom-space outlined v-model="state.parceiro.nome"
                                        label="Nome" :dense="dense" @blur="$v.parceiro.nome.$touch"
                                        :error="$v.parceiro.nome.$error" error-message="Campo obrigatório" />
                                </div>
                                <div class="col-md-5 col-sm-12 col-12">
                                    <q-input hide-bottom-space outlined v-model="state.parceiro.site" label="Site"
                                        :dense="dense" @blur="$v.parceiro.site.$touch"
                                            :error="$v.parceiro.site.$error" error-message="Campo obrigatório" />
                                </div>
                                <div class="col-md-2 col-sm-4 col-12">
                                    <q-select hide-bottom-space outlined v-model="state.parceiro.tipo"
                                        label="Tipo" :dense="dense" :options="tipo"
                                        >
                                        <template v-slot:append>
                                        </template>
                                    </q-select>
                                </div>
                                <div class="col-md-2 col-sm-4 col-12">
                                    <CinputDate outlined v-model="state.parceiro.inicio" label="Início da Parceira"
                                        :dense="dense" @blur="$v.parceiro.inicio.$touch"
                                        :error="$v.parceiro.inicio.$error" error-message="Campo obrigatório" />
                                </div>
                                <div class="col-md-2 col-sm-4 col-12">
                                    <CinputDate outlined v-model="state.parceiro.fim" label="Fim da Parceria"
                                        :dense="dense" @blur="$v.parceiro.fim.$touch"
                                        :error="$v.parceiro.fim.$error" error-message="Campo obrigatório" />
                                </div>
                                <!-- <div class="col-md-4 col-sm-6 col-12">
                                    <q-select hide-bottom-space outlined v-model="state.parceiro.evento" :options="eventos" label="Vincular ao Evento" :dense="dense" />
                                </div> -->
                                <div class="col-12">
                                    <q-field outlined label="Logo" stack-label
                                        :error="!(imageData || state.parceiro.logo)" error-message="Imagem obrigatória">
                                        <div mt-2>
                                            <q-card-section class="">
                                                <img class="responsive" style="max-height: 300px;" :src="getUrlImagem">
                                            </q-card-section>
                                            <q-card-section class="!pt-0">
                                                <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
                                                    <q-btn class="mr-2 " @click="buscarImagem" outline color="primary"
                                                        label="Buscar Imagem" />
                                                    <!-- <q-btn class="mr-2" v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && state.parceiro.logo !== undefined && state.parceiro.logo !== '')" @click="imageData = null" outline color="secondary" label="Ficar Sem" /> -->
                                                    <q-btn class=""
                                                        v-if="imageData !== '' && (state.parceiro.logo !== undefined && state.parceiro.logo !== '')"
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
});
const geral = useGeral();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const state: any = reactive({
    parceiro: {
        entidade: geral.entidade._id,
        tipo: 'Parceiro',
        site: '',
        nome: ''
    }
});
const dense = ref(false);
const $q = useQuasar();
const { $geralService } = useNuxtApp();
const imageData = ref<any>('');
const imageUrl = ref('');
const tipo = [
    'Parceiro', 'Apoiador', 'Patrocinador', 'Promotor'
];


watch(() => state.parceiro.nome, async (newQuestion, oldQuestion) => {
    state.parceiro.rota = $geralService.removeCaracteresEspeciais(newQuestion);
    // console.log(state.parceiro.rota);
})

// GO valida
const validations = {
    parceiro: {
        inicio: {
            required
        },
        fim: {
            required
        },
        nome: {
            required
        },
        logo: {
            required
        },
        site: {
            required
        }
    }
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

onBeforeMount(async () => {
    if (props.id) {
        const ret: any = await useCustomFetch('parceiro/getPopulate', 'post', {
            filtro: {
                _id: props.id
            },
            populateObj: []
        }, undefined);
        if (ret.valido) {
            state.parceiro = ret.data[0];
            // console.log(ret.data);
            if (props.copia) {
                state.parceiro.nome = state.parceiro.nome + " (Cópia)";
                state.parceiro._id = undefined;
                state.parceiro.__v = undefined;
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
    }
    // console.log(state.parceiro);
});

const insertImg = () => { // insertImg method
    // const parceiro = this.parceiro;
    // create an input file element to open file dialog
    const input = document.createElement('input');
    // input.type = 'file';
    // input.accept = '.png, .jpg'; // file extensions allowed
    // let file;
    // input.onchange = _ => {
    //   const files = Array.from(input.files);
    //   file = files[0];

    //   // lets load the file as dataUrl
    //   const reader = new FileReader();
    //   let dataUrl = '';
    //   reader.onloadend = function () {
    //     dataUrl = reader.result;

    //     // append result to the body of your post
    //     // state.parceiro.htmlNoticia += '<div><img src="' + dataUrl + '" /></div>';
    //     document.execCommand('insertHTML', true, '<div><img src="https://azimuteweb.s3.sa-east-1.amazonaws.com/eventos/5e99d4fc0284694c3e693465/documentos/thumbnail-H32-WhatsApp+Image+2023-03-01+at+19.53.01.jpeg" /></div>');
    //   };
    //   reader.readAsDataURL(file);
    // };
    document.execCommand('insertHTML', true, '<div><img src="https://azimuteweb.s3.sa-east-1.amazonaws.com/eventos/5e99d4fc0284694c3e693465/documentos/thumbnail-H32-WhatsApp+Image+2023-03-01+at+19.53.01.jpeg" /></div>');
    input.click();
}
const definitions = {
    insert_img: {
        tip: 'Insertar Imagen',
        icon: 'photo',
        handler: insertImg // handler will call insertImg() method
    }
}



const getUrlImagem = computed(() => {
    return $geralService.getUrlImagem(imageData.value, state.parceiro, 'logo', imageUrl.value);
});




const buscarImagem = () => {
    $q.dialog({
        component: ImageUpload2,
        persistent: true,
        componentProps: {
            winit: 600,
            hinit: 600
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
    // $v.value.parceiro.vinculos.$touch();
    $v.value.parceiro.$touch();

    if ($v.value.parceiro.$error || !(imageData.value || state.parceiro.logo)) {

        $q.loading.hide();
        $q.notify({
            color: 'warning',
            position: 'top',
            icon: 'check',
            message: 'Preeencha todos os campos obrigatórios para salvar!'
        });
        return;

    }

    // if ($v.value.parceiro.vinculos.$error) {
    //     tab.value = 'adms';
    //     $q.loading.hide();
    //     $q.notify({
    //         color: 'warning',
    //         position: 'top',
    //         icon: 'check',
    //         message: 'Preeencha todos os campos obrigatórios para salvar!'
    //     });
    //     return;
    // }

    delete state.parceiro.__v;


    const newNoticia = JSON.parse(JSON.stringify(state.parceiro));

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
        newNoticia,
        'logo',
        imageData.value,
        inserir.value,
        'jpg',
        'parceiros/imagens/',
        save,
        undefined
    );
};

const cancel = async () => {
    // console.log('passou aquitttt');
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
const save = async (newNoticia: any, nomeTempFile: any) => {
    // console.log(newNoticia);
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Salvando registro...Aguarde!',
        messageColor: 'white'
    });
    let url = 'parceiro';
    let tipo = 'post';
    if (!inserir.value) {
        url += ('/' + props.id);
        tipo = 'put';
    }

    const ret: any = await useCustomFetch(url, tipo, newNoticia, undefined);

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
        // console.log(ret);
        $q.loading.hide();
        if (nomeTempFile) {
            $geralService.deleteImagem(nomeTempFile);
            $q.loading.hide();
        }
    }
};

</script>

