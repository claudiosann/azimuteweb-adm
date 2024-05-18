<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon name="fa-solid fa-newspaper" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Notícia</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave" :label="$q.screen.gt.xs ? 'Salvar' : undefined"
                        icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
                            <q-tab default name="dados" icon="line_style" label="Informações"><q-badge v-if="isInformacoesError" color="red" label="Incompleto" /></q-tab>
                            <q-tab name="conteudo" icon="notes" label="Conteúdo"><q-badge v-if="isConteudoError" color="red" label="Incompleto" /></q-tab>
                            <q-tab name="view" icon="visibility" label="Visualizar"></q-tab>
                        </q-tabs>
                        <q-separator />
                        <q-tab-panels v-model="tab" animated>
                            <q-tab-panel name="dados">
                                <div class="row q-ma-sm q-col-gutter-sm">
                                    <div class="col-md-5 col-sm-12 col-12">
                                        <q-input ref="titulo" hide-bottom-space outlined v-model="state.noticia.titulo" label="Título" :dense="dense" @blur="$v.noticia.titulo.$touch" :error="$v.noticia.titulo.$error" error-message="Campo obrigatório" />
                                    </div>
                                    <div class="col-md-5 col-sm-12 col-12">
                                        <q-input hide-bottom-space outlined v-model="state.noticia.subTitulo" label="Sub-Título" :dense="dense" />
                                    </div>
                                    <div class="col-md-2 col-sm-4 col-12">
                                        <q-select  hide-bottom-space outlined v-model="state.noticia.noticiaGrupo" label="Grupo de Notícia" :dense="dense" option-label="descricao" :emit-value="true" map-options :option-value="(obj: any) => obj._id" :options="grupo" @blur="$v.noticia.noticiaGrupo.$touch" :error="$v.noticia.noticiaGrupo.$error" error-message="Campo obrigatório">
                                            <template v-slot:append>
                                            </template>
                                        </q-select>
                                    </div>
                                    <div class="col-md-2 col-sm-4 col-12">
                                        <CinputDate outlined v-model="state.noticia.publicacao" label="Data de Publicação" :dense="dense" @blur="$v.noticia.publicacao.$touch" :error="$v.noticia.publicacao.$error" error-message="Campo obrigatório"   />
                                    </div>
                                    <div class="col-md-2 col-sm-4 col-12">
                                        <CinputDate outlined v-model="state.noticia.remocaoAutomatica" label="Remoção Automática" :dense="dense" />
                                    </div>
                                    <!-- <div class="col-md-4 col-sm-6 col-12">
                                    <q-select hide-bottom-space outlined v-model="state.noticia.evento" :options="eventos" label="Vincular ao Evento" :dense="dense" />
                                </div> -->
                                        <div class="col-md-8 col-12">
                                            <q-field outlined label="Vincular ao Evento" :ref="'evento'" stack-label>
                                                <template v-if="state.noticia.evento && state.noticia.evento.imagem" v-slot:prepend>
                                                    <q-avatar rounded size="50px">
                                                        <q-img :src= "$geralService.getUrlS3Thumb(state.noticia.evento.imagem, { height: 128 })"></q-img>
                                                    </q-avatar>
                                                </template>
                                                <template v-slot:control>
                                                    <div class="self-center full-width no-outline" tabindex="0"><span v-if="state.noticia.evento">{{ state.noticia.evento.nome }}{{ ' (' + state.noticia.evento.sigla + ')' }}</span></div>
                                                </template>
                                                <template v-slot:append>
                                                    <q-btn color="primary" @click="selecionarEvento()" icon="search" round>
                                                        <q-tooltip>Localizar Evento</q-tooltip>
                                                    </q-btn>
                                                </template>
                                            </q-field>
                                        </div>
                                    <div class="col-12">
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">

                                         <q-item tag="label">
        <q-item-section avatar top>
          <q-checkbox v-model="state.noticia.publica"/>
        </q-item-section>
        <q-item-section>
          <q-item-label>Pública</q-item-label>
          <q-item-label v-if="state.noticia.publica" caption>
            Todos os portais integrados terão acesso a esta notícia.
          </q-item-label>
          <q-item-label v-else caption>
            Somente o portal da entidade tem acesso a esta notícia.
          </q-item-label>
        </q-item-section>
      </q-item>
                                        
                                    </div>
                                    </div>
                                    <div class="col-12">
                                        <q-field outlined label="Tags" stack-label :dense="dense">
                                            <template v-slot:control>
                                                <div class="self-center full-width no-outline" tabindex="0">
                                                    <q-chip v-for="(tag, index) in state.noticia.tags" :key="index" dense removable @remove="state.noticia.tags.splice(index, 1)" color="primary" text-color="white">
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
                                        <q-field outlined label="imagem" stack-label :error="!(imageData || state.noticia.imagem)" error-message="Imagem obrigatória">
                                            <div mt-2 >
                                                <q-card-section class="flex justify-center">
                                                    <img class="responsive" style="max-height: 300px;" :src="getUrlImagem">
                                                </q-card-section>
                                                <q-card-section class="!pt-0">
                                                    <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
                                                        <q-btn class="mr-2 " @click="buscarImagem" outline color="primary" label="Buscar Imagem" />
                                                        <!-- <q-btn class="mr-2" v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && state.noticia.imagem !== undefined && state.noticia.imagem !== '')" @click="imageData = null" outline color="secondary" label="Ficar Sem" /> -->
                                                        <q-btn class="" v-if="imageData !== '' && (state.noticia.imagem !== undefined && state.noticia.imagem !== '')" @click="imageData = ''" outline color="deep-purple" label="Restaurar" />

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
                                <q-editor ref="targetRef" v-model="state.noticia.htmlNoticia" :definitions="definitions" :dense="$q.screen.lt.md" :toolbar="editorConfiguracoes.toolbar" :fonts="editorConfiguracoes.fonts" @blur="$v.noticia.htmlNoticia.$touch" :error="$v.noticia.htmlNoticia.$error" error-message="Campo obrigatório" >
                              <template v-slot:addimage>
                                <q-btn
                                  flat
                                  round
                                  dense
                                  icon="image"
                                  @click="abrirGerenciadorArquivo"
                                  aria-label="Adicionar Imagem"
                                />
                              </template>
                              <template v-slot:token>
          <q-btn-dropdown
            dense
            no-caps
            ref="token"
            no-wrap
            unelevated
            color="white"
            text-color="primary"
            label="Text Color"
            size="sm"
          >
            <q-list dense>
              <q-item tag="label" clickable @click="color('backColor', highlight)">
                <q-item-section side>
                  <q-icon name="highlight" />
                </q-item-section>
                <q-item-section>
                  <q-color
                    v-model="highlight"
                    default-view="palette"
                    no-header
                    no-footer
                    :palette="[
                      '#ffccccaa',
                      '#ffe6ccaa',
                      '#ffffccaa',
                      '#ccffccaa',
                      '#ccffe6aa',
                      '#ccffffaa',
                      '#cce6ffaa',
                      '#ccccffaa',
                      '#e6ccffaa',
                      '#ffccffaa',
                      '#ff0000aa',
                      '#ff8000aa',
                      '#ffff00aa',
                      '#00ff00aa',
                      '#00ff80aa',
                      '#00ffffaa',
                      '#0080ffaa',
                      '#0000ffaa',
                      '#8000ffaa',
                      '#ff00ffaa'
                    ]"
                    class="my-picker"
                  />
                </q-item-section>
              </q-item>
              <q-item tag="label" clickable @click="color('foreColor', foreColor)">
                <q-item-section side>
                  <q-icon name="format_paint" />
                </q-item-section>
                <q-item-section>
                  <q-color
                    v-model="foreColor"
                    no-header
                    no-footer
                    default-view="palette"
                    :palette="[
    '#000000',
    '#444444',
    '#666666',
    '#999999',
    '#cccccc',
    '#eeeeee',
    '#f3f3f3',
    '#ffffff',
    // verde escuro
    '#004d00',
    // verde
    '#008000',

    
                      '#ff0000',
                      '#ff8000',
                      '#ffff00',
                      '#00ff00',
                      '#00ff80',
                      '#00ffff',
                      '#0080ff',
                      '#0000ff',
                      '#8000ff',
                      '#ff00ff'
                    ]"
                    class="my-picker"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
                                </q-editor>
                                <!-- Fim do Editor -->
                            </q-tab-panel>
                        </q-tab-panels>
                        <q-tab-panels v-model="tab" animated>
                            <q-tab-panel name="view">
                                <q-card class="my-card">
                                    <q-card-section>
                                        <div class="text-h2">{{ state.noticia.titulo }}</div>
                                        <div class="text-h5">{{ state.noticia.subTitulo }}</div>
                                        <div class="text-subtitle5">{{ $geralService.getDataFormatada(state.noticia.publicacao) }}</div>
                                    </q-card-section>

                                    <q-card-section>
                                        <q-img :src="getUrlImagem" />
                                    </q-card-section>

                                    <q-card-section>
                                      <div v-html="state.noticia.htmlNoticia">
                                      </div>
                                      <div>
                                        {{ state.noticia.htmlNoticia }}
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
import  SeletorEvento from "../SeletorEvento.vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';
import { reactive, ref, getCurrentInstance } from 'vue';
import ImageUpload2 from "../ImageUpload2.vue";
import GerenciadorArquivoModal from "../GerenciadorArquivoModal.vue";


const props = defineProps({
    id: { type: String, default: null },
    copia: null,
});
const geral = useGeral();

const foreColor = ref('#000000');
    const highlight = ref('#ffff00aa');
const targetRef = ref(null);
    const token = ref(null);
const { proxy } = getCurrentInstance() as { proxy: any };

    

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const state: any = reactive({
    noticia: {
        entidade: geral.entidade._id,
        tags: [],
        publica: true,
        htmlNoticia: '',
        albuns: [],
    }
});
const dense = ref(false);
const $q = useQuasar();
const { $geralService } = useNuxtApp();

watch(() => state.noticia.titulo, async (value, oldQuestion) => {
    state.noticia.rota = $geralService.removeCaracteresEspeciais(geral.entidade.sigla.toLowerCase()+'-'+value);
    // console.log(state.noticia.rota);
})


const abrirGerenciadorArquivo = () => {
  $q.dialog({
    component: GerenciadorArquivoModal,
    persistent: true,
    componentProps: {
      multiple: true,
      travarCaminhoUpload: false,
      travarDeletar: true,
      caminhoInicial: ``,
        raiz: `${geral.entidade.sigla}`,
      extensao: 'jpg, jpeg, png, gif'
    },
  })
    .onOk(async (data) => {
      console.log(data);
      const img = `<div><img class="responsive" src="${data}" /></div>`
        if (targetRef && targetRef.value) {
            // @ts-ignore
            targetRef.value.runCmd('insertHTML', img)
        }
    })
    .onCancel(() => { });
}

const color = (cmd: any, name: any) => {
    if (token && token.value) {
        // @ts-ignore
        token.value.hide()
    }
    if (targetRef && targetRef.value) {
        // @ts-ignore
        targetRef.value.runCmd(cmd, name);
        // @ts-ignore
        targetRef.value.focus();
    }
    }
    
// GO valida
const validations = {
    noticia: {
        titulo: {
            required
        },
        publicacao: {
            required
        },
        noticiaGrupo: {
            required
        },
        htmlNoticia: {
            required
        },
        // albuns: {
        //     $each: {
        //         idAlbum: {
        //             required
        //         },
        //         nome: {
        //             required
        //         }
        //     }
        // }
    }
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

onBeforeMount(async () => {
    if (props.id) {
        const ret: any = await useCustomFetch('noticia/getPopulate', 'post', {
            filtro: {
                _id: props.id
            },
            populateObj: [{path: 'evento', select: { nome: 1, sigla: 1, imagem: 1, numero: 1 }}]
        }, undefined);
        if (ret.valido) {
            state.noticia = ret.data[0];
            // console.log(ret.data);
            if (props.copia) {
                state.noticia.titulo = state.noticia.titulo + " (Cópia)";
                state.noticia._id = undefined;
                state.noticia.__v = undefined;
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
    getNoticiaGrupo();
    // console.log(state.noticia);
});

const insertImg = () => { // insertImg method
    // const noticia = this.noticia;
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
    //     // state.noticia.htmlNoticia += '<div><img src="' + dataUrl + '" /></div>';
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


const idAlbum = ref('');
const idUsuario = ref('');
const images = ref([]);
const loading = ref(false);
const tab = ref('dados');
const showImageUpload = ref(false);
const imageData = ref<any>('');
const imageUrl = ref('');
const grupo = ref([]);
const eventos = ref([]);
const showSeletorEvento = ref(false);
const tipo = ['Facebook', 'Instagram', 'Google Fotos', 'Flickr'];
const slide = ref(1);

const getUrlImagem = computed(() => {
    return $geralService.getUrlImagem(imageData.value, state.noticia, 'imagem', imageUrl.value);
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
            state.noticia.tags.push(data);
        }
    });
};

const selecionarEvento = () => {
    // console.log('selecionar evento');
    $q.dialog({
        component: SeletorEvento,
        persistent: true,
        componentProps: {
        },
    })
        .onOk(async (data) => {
            confirmSelecaoEvento(data);
        })
        .onCancel(() => { });

}

const confirmSelecaoEvento = (evento: any) => {
    // console.log(evento);
    state.noticia.evento = evento;
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

    if ($v.value.noticia.titulo.$error || $v.value.noticia.noticiaGrupo.$error || $v.value.noticia.publicacao.$error || !(imageData.value || state.noticia.imagem)) {
        return true;
    }
    return false;
});
const isConteudoError = computed(() => {
    if ($v.value.noticia.htmlNoticia.$error) {
        return true;
    }
    return false;
});

const getNoticiaGrupo = async () => {
    try {

        const ret = await useCustomFetch('noticiaGrupo/getPopulate', 'post', {
            filtro: {
                lixo: false,
                entidade: geral.entidade._id
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
    // $v.value.noticia.vinculos.$touch();
    $v.value.noticia.$touch();

    if ($v.value.noticia.$error || !(imageData.value || state.noticia.imagem)) {

        $q.loading.hide();
        $q.notify({
            color: 'warning',
            position: 'top',
            icon: 'check',
            message: 'Preeencha todos os campos obrigatórios para salvar!'
        });
        return;

    }

    // if ($v.value.noticia.vinculos.$error) {
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

    delete state.noticia.__v;

    
    const newNoticia = JSON.parse(JSON.stringify(state.noticia));

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
        'imagem',
        imageData.value,
        inserir.value,
        'jpg',
        'noticias/imagens/',
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
    let url = 'noticia';
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
        ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript','fontColor'],
        ['token','removeFormat'],
        ['hr', 'link', 'addimage'],
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
        ['undo', 'redo'],
        ,
        ['viewsource']
        
    ],
     fontColor: {                
       tip: 'Change font color', 
       icon: 'colorize',         
       label: 'Font Color',      
       handler: function (editor: any) { 
         editor.execCmd('foreColor', '#ff0000'); 
         },                  
        },
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

<style lang="sass" scoped>
.my-picker
  max-width: 150px
</style>