<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon name="fa-solid fa-newspaper" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Conteúdo</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave"
                        :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
                        <q-tab default name="dados" icon="line_style" label="Informações"><q-badge v-if="isInformacoesError"
                                color="red" label="Imcompleto" /></q-tab>
                        <q-tab name="conteudo" icon="notes" label="Conteúdo"><q-badge v-if="isConteudoError" color="red"
                                label="Imcompleto" /></q-tab>
                        <q-tab name="view" icon="visibility" label="Visualizar"></q-tab>
                    </q-tabs>
                    <q-separator />
                    <q-tab-panels v-model="tab" animated>
                        <q-tab-panel name="dados">
                            <div class="row q-ma-sm q-col-gutter-sm">
                                <div class="col-md-5 col-sm-12 col-12">
                                    <q-input ref="titulo" hide-bottom-space outlined v-model="state.conteudo.titulo"
                                        label="Título" :dense="dense" @blur="$v.conteudo.titulo.$touch"
                                        :error="$v.conteudo.titulo.$error" error-message="Campo obrigatório" />
                                </div>
                                <div class="col-md-5 col-sm-12 col-12">
                                    <q-input hide-bottom-space outlined v-model="state.conteudo.subTitulo" label="Sub-Título"
                                        :dense="dense" />
                                </div>
                                <div class="col-12">
                                    <q-field outlined label="Tags" stack-label :dense="dense">
                                        <template v-slot:control>
                                            <div class="self-center full-width no-outline" tabindex="0">
                                                <q-chip v-for="(tag, index) in state.conteudo.tags" :key="index" dense
                                                    removable @remove="state.conteudo.tags.splice(index, 1)" color="primary"
                                                    text-color="white">
                                                    {{ tag }}
                                                </q-chip>
                                            </div>
                                        </template>
                                        <template v-slot:append>
                                            <q-btn color="primary" @click="addTag()" icon="add" round>
                                                <q-tooltip>Adicionar Tag</q-tooltip>
                                            </q-btn>
                                        </template>
                                    </q-field>
                                </div>
                                <div class="col-12">
                                    <q-field outlined label="imagem" stack-label>
                                        <div mt-2>
                                            <q-card-section class="flex justify-center">
                                                <img class="responsive" style="max-height: 300px;" :src="getUrlImagem">
                                            </q-card-section>
                                            <q-card-section class="!pt-0">
                                                <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
                                                    <q-btn class="mr-2 " @click="buscarImagem" outline color="primary"
                                                        label="Buscar Imagem" />
                                                    <q-btn class="mr-2" v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && state.conteudo.imagem !== undefined && state.conteudo.imagem !== '')" @click="imageData = null" outline color="secondary" label="Ficar Sem" />
                                                    <q-btn class=""
                                                        v-if="imageData !== '' && (state.conteudo.imagem !== undefined && state.conteudo.imagem !== '')"
                                                        @click="imageData = ''" outline color="deep-purple"
                                                        label="Restaurar" />

                                                </div>
                                            </q-card-section>
                                        </div>
                                    </q-field>

                                </div>
                            </div>
                        </q-tab-panel>
                    </q-tab-panels>
                    <q-tab-panels v-model="tab" animated>
                        <q-tab-panel name="conteudo">
                            <!-- Editor de text -->
                            <q-editor v-model="state.conteudo.conteudoHtml" :definitions="definitions"
                                :dense="$q.screen.lt.md" :toolbar="editorConfiguracoes.toolbar"
                                :fonts="editorConfiguracoes.fonts" @blur="$v.conteudo.conteudoHtml.$touch"
                                :error="$v.conteudo.conteudoHtml.$error" error-message="Campo obrigatório" />
                            <!-- Fim do Editor -->
                        </q-tab-panel>
                    </q-tab-panels>
                    <q-tab-panels v-model="tab" animated>
                        <q-tab-panel name="view">
                            <q-card class="my-card">
                                <q-card-section>
                                    <div class="text-h2">{{ state.conteudo.titulo }}</div>
                                    <div class="text-h5">{{ state.conteudo.subTitulo }}</div>
                                    <div class="text-subtitle5">{{ $geralService.getDataFormatada(state.conteudo.publicacao)
                                    }}</div>
                                </q-card-section>

                                <q-card-section>
                                    <q-img :src="getUrlImagem" />
                                </q-card-section>

                                <q-card-section>
                                    <div v-html="state.conteudo.conteudoHtml">
                                    </div>
                                    <div>
                                        {{ state.conteudo.conteudoHtml }}
                                    </div>
                                </q-card-section>
                                <!-- <div class="q-pa-md">
                                    <q-carousel
                                      class="rounded-borders custom-carousel" keep-alive autoplay thumbnails animated v-model="slide" arrows infinite >
                                      <q-carousel-slide :name="1" img-src="https://cdn.quasar.dev/img/mountains.jpg" />
                                      <q-carousel-slide :name="2" img-src="https://cdn.quasar.dev/img/parallax1.jpg" />
                                      <q-carousel-slide :name="3" img-src="https://cdn.quasar.dev/img/parallax2.jpg" />
                                      <q-carousel-slide :name="4" img-src="https://cdn.quasar.dev/img/quasar.jpg" />
                                    </q-carousel>
                                  </div> -->
                            </q-card>
                        </q-tab-panel>
                    </q-tab-panels>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
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
    conteudo: {
        entidade: geral.entidade._id,
        tags: [],
        conteudoHtml: '',
        albuns: [],
    }
});
const dense = ref(false);
const $q = useQuasar();
const { $geralService } = useNuxtApp();

watch(() => state.conteudo.titulo, async (value, oldValue) => {
    state.conteudo.rota = geral.entidade.sigla.toLowerCase()+'-'+$geralService.removeCaracteresEspeciais(value);
    // console.log(state.conteudo.rota);
})

// GO valida
const validations = {
    conteudo: {
        titulo: {
            required
        },
        conteudoHtml: {
            required
        }
    }
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

onBeforeMount(async () => {
    if (props.id) {
        const ret: any = await useCustomFetch('conteudo/getPopulate', 'post', {
            filtro: {
                _id: props.id
            },
            populateObj: []
        }, undefined);
        if (ret.valido) {
            state.conteudo = ret.data[0];
            // console.log(ret.data);
            if (props.copia) {
                state.conteudo.titulo = state.conteudo.titulo + " (Cópia)";
                state.conteudo._id = undefined;
                state.conteudo.__v = undefined;
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
    getConteudoGrupo();
    // console.log(state.conteudo);
});

const insertImg = () => { // insertImg method
    // const conteudo = this.conteudo;
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
    //     // state.conteudo.conteudoHtml += '<div><img src="' + dataUrl + '" /></div>';
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


const tab = ref('dados');
const imageData = ref<any>('');
const imageUrl = ref('');
const grupo = ref([]);

const getUrlImagem = computed(() => {
    return $geralService.getUrlImagem(imageData.value, state.conteudo, 'imagem', imageUrl.value);
});

const addTag = () => {
    $q.dialog({
        title: 'Adicionar Tag',
        message: 'Digite uma tag por vez',
        prompt: {
            model: '',
            type: 'text' // optional
        },
        cancel: true
    }).onOk(data => {
        if (data) {
            state.conteudo.tags.push(data);
        }
    });
};


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
const isInformacoesError = computed(() => {

    if ($v.value.conteudo.titulo.$error) {
        return true;
    }
    return false;
});
const isConteudoError = computed(() => {
    if ($v.value.conteudo.conteudoHtml.$error) {
        return true;
    }
    return false;
});

const getConteudoGrupo = async () => {
    try {

        const ret = await useCustomFetch('conteudoGrupo/getPopulate', 'post', {
            filtro: {
                lixo: false
            }
        }, undefined);
        if (ret.valido) {
            grupo.value = ret.data;
        } else {
            grupo.value = [];
        }
    } catch (error) { }
};




const beforeSave = () => {
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Validando dados... Aguarde!',
        messageColor: 'white'
    });
    // $v.value.conteudo.vinculos.$touch();
    $v.value.conteudo.$touch();

    if ($v.value.conteudo.$error) {

        $q.loading.hide();
        $q.notify({
            color: 'warning',
            position: 'top',
            icon: 'check',
            message: 'Preeencha todos os campos obrigatórios para salvar!'
        });
        return;

    }

    // if ($v.value.conteudo.vinculos.$error) {
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

    delete state.conteudo.__v;


    const newConteudo = JSON.parse(JSON.stringify(state.conteudo));

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
        newConteudo,
        'imagem',
        imageData.value,
        inserir.value,
        'jpg',
        'conteudos/imagens/',
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
const save = async (newConteudo: any, nomeTempFile: any) => {
    // console.log(newConteudo);
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Salvando registro...Aguarde!',
        messageColor: 'white'
    });
    let url = 'conteudo';
    let tipo = 'post';
    if (!inserir.value) {
        url += ('/' + props.id);
        tipo = 'put';
    }

    const ret: any = await useCustomFetch(url, tipo, newConteudo, undefined);

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

const editorConfiguracoes = {
    toolbar: [
        [
            {
                label: $q.lang.editor.align,
                icon: $q.iconSet.editor.align,
                fixedLabel: true,
                options: ['left', 'center', 'right', 'justify']
            }
        ],
        ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
        ['token', 'hr', 'link', 'custom_btn'],
        ['print', 'fullscreen'],
        [
            {
                label: $q.lang.editor.formatting,
                icon: $q.iconSet.editor.formatting,
                list: 'no-icons',
                options: [
                    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'
                ]
            },
            {
                label: $q.lang.editor.fontSize,
                icon: $q.iconSet.editor.fontSize,
                fixedLabel: true,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                    'size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7'
                ]
            },
            {
                label: $q.lang.editor.defaultFont,
                icon: $q.iconSet.editor.font,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                    'default_font', 'arial', 'arial_black', 'comic_sans', 'courier_new', 'impact', 'lucida_grande', 'times_new_roman', 'verdana'
                ]
            },
            'removeFormat'
        ],
        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
        // ['undo', 'redo', 'insert_img'],
        ['undo', 'redo']
    ],
    fonts: {
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana'
    }
};
</script>

