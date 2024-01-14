<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon name="people_alt" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Diretoria</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave" :label="$q.screen.gt.xs ? 'Salvar' : undefined"
                        icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
                                <q-tab default name="dados" icon="line_style" label="Informações" />
                                <q-tab name="logo" icon="image" label="Logo" />
                            </q-tabs>
                            <q-separator />
                            <q-tab-panels v-model="tab" animated>
                                <q-tab-panel name="dados">
                                    <div class="row q-col-gutter-sm">
                                        <div class="col-sm-6 col-12">
                                            <q-input hide-bottom-space outlined v-model="state.diretoria.nome" label="Nome" :dense="dense" @blur="$v.diretoria.nome.$touch" :error="$v.diretoria.nome.$error" error-message="Campo obrigatório" />
                                        </div>
                                        <div class="col-sm-3 col-12">
                                            <CinputDate outlined :error="$v.diretoria.vigenciaInicio.$error" :error-message="$v.diretoria.vigenciaInicio.$error ? 'Campo Obrigatório' : 'Data inválida'" :dense="false" v-model="state.diretoria.vigenciaInicio" label="Vigência Início" />
                                        </div>
                                        <div class="col-sm-3 col-12">
                                            <CinputDate outlined :error="$v.diretoria.vigenciaFim.$error" :error-message="$v.diretoria.vigenciaFim.$error ? 'Campo Obrigatório' : 'Data inválida'" :dense="false" v-model="state.diretoria.vigenciaFim" label="Vigência Fim" />
                                        </div>
                                    </div>
                                    <!-- GO Membros -->
                                    <div class="row q-col-gutter-sm q-pt-md">
                                        <div class="col-12 col-md-12">
                                            <q-list bordered class="rounded-borders">
                                                <q-item-label :dense="true" style="padding: 5px; font-size: 17px;">Membros
                                                    <q-btn color="primary" @click="inserirMembroDiretoria" round size="xs" icon="add">
                                                        <q-tooltip>Inserir Membro</q-tooltip>
                                                    </q-btn>
                                                </q-item-label>
                                                <div v-for="(membro, index) in state.diretoria.membros" :key="index">
                                                    <q-separator />
                                                    <q-expansion-item group="membrosDiretoriaGroup" dense dense-toggle expand-separator v-model="membro.open">
                                                        <template v-slot:header>
                                                            <q-item-section>
                                                                <q-item class="pl-0" dense>
                                                                    <q-item-section v-if="!membro.open && membro.pessoa && membro.pessoa.foto" avatar>
                                                                         <q-avatar size="50px">
                                                                        <q-img :ratio="32 / 32"  :src="getUrlImagemThumb(membro.pessoa.foto, 128)"></q-img>
                                                                        </q-avatar>
                                                                    </q-item-section>
                                                                    <q-item-section>
                                                                        <q-item-label>{{ (membro.cargo ? (membro.cargo + ': ') : '') }} {{ (membro.pessoa ? (membro.pessoa.nome + (membro.pessoa.nome !== membro.pessoa.apelido ? ' (' + membro.pessoa.apelido + ')' : '')) : '') }}</q-item-label>
                                                                    </q-item-section>
                                                                </q-item>
                                                            </q-item-section>
                                                        </template>
                                                        <div class="row q-col-gutter-sm q-pa-md">
                                                           
                                                            <div class="col-sm-7 col-12">
                                                                <q-field outlined label="Pessoa" :ref="'diretoria.membros' + index + '.pessoa'" stack-label :dense="dense" :error="!membro.pessoa" error-message="Campo obrigatório">
                                                                    <template v-if="membro.pessoa && membro.pessoa.foto" v-slot:prepend>
                                                                        <q-avatar size="50px">
                                                                            <q-img :ratio="32 / 32" :src="getUrlImagemThumb(membro.pessoa.foto, 128)"></q-img>
                                                                        </q-avatar>
                                                                    </template>
                                                                    <template v-slot:control>
                                                                        <div class="self-center full-width no-outline" tabindex="0"><span v-if="membro.pessoa">{{ membro.pessoa.nome }}{{ membro.pessoa.nome !== membro.pessoa.apelido ? ' (' + membro.pessoa.apelido + ')' : '' }}</span></div>
                                                                    </template>
                                                                    <template v-slot:append>
                                                                        <q-btn color="primary" @click="localizarPessoa(index)" icon="search" round>
                                                                            <q-tooltip>Localizar Pessoa</q-tooltip>
                                                                        </q-btn>
                                                                    </template>
                                                                </q-field>
                                                            </div>
                                                             <div class="col-sm-5 col-12">
                                                                    <!-- GO Cargo -->
                                                                    <q-input outlined autofocus label="Cargo" maxlength="100" :ref="'diretoria.membros' + index + '.cargo'" v-model="membro.cargo" :error="$v.diretoria.membros.$each.$response.$data[index].cargo.$error" error-message="Campo obrigatório" />
                                                                </div>
                                                            <div class="col-12">
                                                                <q-field outlined label="Atribuições do Cargo" stack-label counter :dense="dense">
                                                                    <template v-slot:control>
                                                                        <div class="self-center full-width no-outline" tabindex="0">
                                                                            <!-- GO Atribuições ...  -->
                                                                            <q-chip v-for="(atribuicao, index2) in membro.atribuicoes" :key="index2" removable @remove="membro.atribuicoes.splice(index2, 1)" color="primary" text-color="white">
                                                                                {{ atribuicao }}
                                                                            </q-chip>
                                                                        </div>
                                                                    </template>
                                                                    <template v-slot:append>
                                                                        <q-btn color="primary" @click="addAtribuicao(membro)" icon="add" round>
                                                                            <q-tooltip>Adicionar Atribuição</q-tooltip>
                                                                        </q-btn>
                                                                    </template>
                                                                </q-field>
                                                            </div>
                                                            <div class="col-sm-3 col-12">
                                                                <!-- GO Telefone -->
                                                                <q-input outlined label="Telefone" maxlength="100" :ref="'diretoria.membros' + index + '.telefone'" v-model="membro.telefone" unmasked-value :mask="((membro.telefone) && state.diretoria.membros[index].telefone.toString().length === 10) ? '(##) ####-#####' : '(##) #####-####'"/>
                                                            </div>
                                                            <div class="col-sm-5 col-12">
                                                                <!-- GO E-mail -->
                                                                <q-input type="email" outlined label="E-Mail" maxlength="50" :ref="'diretoria.membros' + index + '.email'" v-model="membro.email" />
                                                            </div>
                                                            <div class="col-sm-4 col-12">
                                                                <q-field outlined label="Divulgar no site e no Sistema CBO" stack-label dense>
                                                                    <template v-slot:control>
                                                                        <div class="self-center full-width no-outline" tabindex="0">
                                                                            <!-- GO Divulgar ...  -->
                                                                            <q-checkbox keep-color v-model="membro.divulgarNomeNoSite" label="Nome" />
                                                                            <q-checkbox keep-color v-model="membro.divulgarTelefoneNoSite" label="Telefone" />
                                                                            <q-checkbox keep-color v-model="membro.divulgarEmailNoSite" label="E-mail" />
                                                                            <q-checkbox keep-color v-model="membro.divulgarFotoNoSite" label="Foto" />
                                                                        </div>
                                                                    </template>
                                                                </q-field>
                                                            </div>
                                                            <div class="col-12">
                                                                <q-btn color="red" outline @click="excluirMembroDiretoria(index, $event)" label="Excluir Membro" icon="delete">
                                                                    <q-tooltip>Excluir membro da diretoria</q-tooltip>
                                                                </q-btn>
                                                            </div>
                                                        </div>
                                                    </q-expansion-item>
                                                </div>
                                            </q-list>
                                        </div>
                                    </div>
                                </q-tab-panel>
                                <q-tab-panel keep-alive name="logo">
                                    <div class="row q-col-gutter-sm">
                                        <div class="col-12">
                                            <div class="layout-padding">
                                                <div
                                                    class="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-6 offset-lg-3 align-center justify-center row wrap">
                                                    <q-card inline class="bigger q-ma-sm">
                                                        <q-card-section class="flex justify-center">
                                                            <img style="max-height: 300px; max-width: 300px;" :src="getUrlImagem">
                                                        </q-card-section>
                                                        <q-separator />
                                                        <q-card-section class="flex justify-between gap-2">
                                                            <q-btn class="q-mt-sm" @click="buscarImagem" outline color="primary"
                                                                label="Buscar Imagem" />
                                                            <q-btn class="q-mt-sm"
                                                                v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && state.diretoria.logo !== undefined && state.diretoria.logo !== '')"
                                                                @click="imageData = null" outline color="secondary"
                                                                label="Ficar Sem" />
                                                            <q-btn class="q-mt-sm"
                                                                v-if="imageData !== '' && (state.diretoria.logo !== undefined && state.diretoria.logo !== '')"
                                                                @click="imageData = ''" outline color="deep-purple"
                                                                label="Restaurar" />
                                                        </q-card-section>
                                                    </q-card>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </q-tab-panel>
                            </q-tab-panels>
                    
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts" setup>

import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minLength } from "@vuelidate/validators";
import BuscarPessoa from "../BuscarPessoa.vue";
import ImageUpload2 from "../ImageUpload2.vue";

import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';
import { reactive } from 'vue';

const { $geralService, $constantes } = useNuxtApp()

const geral = useGeral();

const props = defineProps({
    id: { type: String, default: null },
    copia: null,
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const state: any = reactive({ diretoria: { membros: [] } });
const dense = ref(false);
const $q = useQuasar();
const imageData = ref<any>('');
const imageUrl = ref('');
const tab = ref('dados');
const mensagemRequired = ref('Campo Obrigatório.');
const indexMembro = ref(-1);


// GO valida
const validations = {
    diretoria: {
       nome: {
            required
        },
        vigenciaInicio: {
            required
        },
        vigenciaFim: {
            required
        },
         membros: {
            $each: helpers.forEach({
                cargo: {
                    required
                }
            })
        }
    }
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);


onBeforeMount(async () => {
    if (props.id) {
        const ret: any = await useCustomFetch('diretoria/getPopulate', 'post', {
            filtro: {
                _id: props.id
            },
            populateObj: ['membros.pessoa']
        }, undefined);
        if (ret.valido) {
            state.diretoria = ret.data[0];
            console.log(ret.data);
            if (!state.diretoria.membros) {
                state.diretoria.membros = [];
            }
            state.diretoria = JSON.parse(JSON.stringify(state.diretoria));
            if (props.copia) {
                state.diretoria.descricao = state.diretoria.descricao + " (Cópia)";
                state.diretoria._id = undefined;
                state.diretoria.__v = undefined;
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
        state.diretoria = {
            membros: [],
            entidade: geral.entidade._id
        };
        inserir.value = true;
    }
    console.log($v.value);
    console.log(state.diretoria);
});

const cancel = async () => {
    onDialogCancel();
    $q.notify({
        position: "top",
        type: "info",
        textColor: "white",
        message: (inserir.value ? "Inserção " : "Edição ") + "cancelada!",
    });
    return;
};

const confirmSelecaoAdm = (pessoa: any) => {
    if (pessoa) {
        state.diretoria.membros[indexMembro.value].pessoa = pessoa;
    }
};
const localizarPessoa = (index: number) => {
    indexMembro.value = index
    $q.dialog({
        component: BuscarPessoa,
        persistent: true,
        componentProps: {
        },
    })
        .onOk(async (data) => {
            confirmSelecaoAdm(data);
        })
        .onCancel(() => { });

}

const getUrlImagemThumb = (caminho: any, tamanho: any) => {
    return $geralService.getUrlS3Thumb(caminho, {
        height: (tamanho !== undefined ? tamanho : 128)
    });
};

const getUrlImagem = computed(() => {
    return $geralService.getUrlImagem(imageData.value, state.diretoria, 'logo', imageUrl.value);
});


// GO setPrincipal
const setPrincipal = (indice: number, lista: any) => {
    for (let index = 0; index < lista.length; index++) {
        if (indice !== index) {
            lista[index].principal = false;
        }
    }
};

const addAtribuicao = (membro: any) => {
    $q.dialog({
        title: 'Adicionar Atribuição',
        message: 'Digite textos curtos',
        prompt: {
            model: '',
            type: 'text' // optional
        },
        cancel: true
    }).onOk(data => {
        if (data) {
            if (!membro.atribuicoes) {
                membro.atribuicoes = [data];
            
            } else {
                membro.atribuicoes.push(data);
            }
            
        }
    });
};
const buscarImagem = () => {
     $q.dialog({
        component: ImageUpload2,
        persistent: true,
         componentProps: {
             winit: 300,
           hinit: 300
        },
    })
        .onOk(async (data) => {
            confirmImageUpload(data.data, data.fileName)
        })
        .onCancel(() => { });
    
};
const excluirMembroDiretoria = (index: number, event: any) => {
    $q
        .dialog({
            title: 'Confirmação',
            message: 'Excluir o membro da diretoria?',
            cancel: 'Não',
            ok: 'Sim'
        })
        .onOk(() => {
                event.preventDefault();
            state.diretoria.membros.splice(index, 1);

        });
};
const inserirMembroDiretoria = async () => {
    for (let index = 0; index < state.diretoria.membros.length; index++) {
        state.diretoria.membros[index].open = false;
    }
    const id = await $geralService.getId();
    state.diretoria.membros.push({
        divulgarNomeNoSite: true,
        divulgarFotoNoSite: true,
        divulgarEmailNoSite: true,
        divulgarTelefoneNoSite: true,
        _id: id,
        open: true,
        cargo:'',
        atribuicoes: []
    });
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
    // $v.value.vinculos.$touch();
    $v.value.diretoria.$touch();

    if ($v.value.diretoria.$error) {

        $q.loading.hide();
        $q.notify({
            color: 'warning',
            position: 'top',
            icon: 'check',
            message: 'Preeencha todos os campos obrigatórios para salvar!'
        });
        return;

    }

    // if ($v.value.vinculos.$error) {
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

    delete state.diretoria.__v;

    // Cria newDiretoria para não bagunçar as máscaras em caso de alguma falha de comunicação
    const newDiretoria = JSON.parse(JSON.stringify(state.diretoria));

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
        newDiretoria,
        'logo',
        imageData.value,
        inserir.value,
        'jpg',
        `diretorias/${geral.entidade._id}/logos/`,
        save,
        undefined
    );
};
// TO save
const save = async (newDiretoria: any, nomeTempFile: any) => {
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Salvando registro...Aguarde!',
        messageColor: 'white'
    });
    let url = 'diretoria';
    let tipo = 'post';
    if (!inserir.value) {
        url += ('/' + props.id);
        tipo = 'put';
    }

    const ret: any = await useCustomFetch(url, tipo, newDiretoria, undefined);


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
        if (nomeTempFile) {
            $geralService.deleteImagem(nomeTempFile);
            $q.loading.hide();
        }
    }
};


</script>

