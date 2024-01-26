<template>
    <ExpansionItem v-model="conteudoObj.expanded" class="shadow-1 mb-2" rounded :erroPadrao="v$.$error" :titulo="conteudoObj.titulo"
        :icon="conteudoObj.icone">
        <div class="row q-col-gutter-sm">
            <span class="col-sm-6 col-12">
                <q-input ref="titulo_conteudo" autofocus hide-bottom-space outlined v-model="conteudoObj.titulo"
                    label="Título do Conteúdo" :error="v$.titulo.$error" error-message="Campo obrigatório" />
            </span>
            <span class="col-sm-6 col-12">
                <q-select outlined v-model="conteudoObj.icone" label="Ícone do Conteúdo" use-input input-debounce="100"
                    behavior="menu" @filter="filterFn" :options="listaIcones" :error="v$.icone.$error"
                    error-message="Campo obrigatório">
                    <template v-slot:prepend>
                        <q-icon :name="conteudoObj.icone" />
                    </template>
                    <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                            <q-item-section avatar>
                                <q-icon :name="scope.opt" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label caption>{{ scope.opt
                                }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                    <template v-slot:no-option>
                        <q-item>
                            <q-item-section class="text-grey"> No results
                            </q-item-section>
                        </q-item>
                    </template></q-select>
            </span>
            <span class="col-12">
                <q-editor v-model="conteudoObj.texto" :dense="$q.screen.lt.md" :toolbar="editorConfiguracoes.toolbar"
                    :fonts="editorConfiguracoes.fonts" :error="v$.texto.$error" error-message="Campo obrigatório" />
            </span>
        </div>
        <div class="col-12 q-mt-md">
            <q-btn color="red" outline @click="excluir" :label="'Excluir Conteúdo '" icon="delete">
                <q-tooltip>Excluir Conteúdo</q-tooltip>
            </q-btn>
        </div>
    </ExpansionItem>
</template>

<script setup lang="ts">
import icones from '../service/iconawesome';
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';
import { on } from 'events';

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({}),
    },
    index: {
        type: Number,
        default: null,
    },
});

const conteudoObj: any = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const rules = {
    titulo: {
        required
    },
    icone: {
        required
    },
    texto: {
        required
    }
};
const $q = useQuasar();

const listaIcones = ref<any>(icones);

const emit = defineEmits(["update:modelValue", "onExcluir"]);

const v$ = useVuelidate(rules, conteudoObj, { $autoDirty: true });

const excluir = () => {
    emit("onExcluir", 'conteudos', props.index);
}

const filterFn = (val: any, update: Function) => {
    // console.log(val);
    if (val === '') {
        update(() => {
            listaIcones.value = icones;
        });
        return;
    }
    update(() => {
        const needle = val.toLowerCase();
        listaIcones.value = icones.filter((v) => v.toLowerCase().indexOf(needle) > -1);
    });
};

onMounted(() => {
    v$.value.$touch();
});


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
const insertImg = () => { // insertImg method
    // const campeonato = this.campeonato;
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
    //     // state.campeonato.htmlNoticia += '<div><img src="' + dataUrl + '" /></div>';
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

</script>

<style scoped lang="scss"></style>
