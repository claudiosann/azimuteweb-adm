<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon name="fa-solid fa-trophy" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Campeonato</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave"
                        :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
                        <q-tab default name="dados" icon="line_style" label="Informações"><q-badge
                                v-if="$v.$validationGroups.informacoesError.$error" color="red"
                                label="Incompleto" /></q-tab>
                        <q-tab name="etapas" icon="settings" label="Etapas">
                            <q-badge v-if="$v.campeonato.etapas.$error" color="red" label="Incompleto" />
                        </q-tab>
                        <q-tab name="logo" icon="image" label="Logo">
                            <q-badge v-if="!(imageData || state.campeonato.logo)" color="red" label="Incompleto" />
                        </q-tab>
                        <q-tab v-if="!$v.$validationGroups.informacoesError.$error && state.campeonato.sigla" name="pagina"
                            icon="present_to_all" label="Página do Campeonato">

                        </q-tab>
                    </q-tabs>
                    <q-separator />
                    <q-tab-panels v-model="tab" animated>
                        <q-tab-panel name="dados">
                            <div class="row q-ma-sm q-col-gutter-sm">
                                <div class="col-md-8 col-sm-12 col-12">
                                    <q-input ref="descricao" counter maxlength="100" hide-bottom-space outlined
                                        v-model="state.campeonato.descricao" label="Nome" :dense="dense"
                                        :error="$v.campeonato.descricao.$error"
                                        error-message="Campo obrigatório" />
                                </div>
                                <div class="col-md-2 col-sm-6 col-12">
                                    <q-input ref="sigla" maxlength="15" hide-bottom-space outlined
                                        v-model="state.campeonato.sigla" label="Sigla" counter :dense="dense"
                                        :error="$v.campeonato.sigla.$error"
                                        error-message="Campo obrigatório" />
                                </div>
                                <div class="col-md-2 col-sm-6 col-12">
                                    <q-select hide-bottom-space outlined v-model="state.campeonato.ano" label="Ano"
                                        :dense="dense" :options="listaAnos">
                                    </q-select>
                                </div>
                                <div class="col-md-4 col-sm-6 col-12">
                                    <q-select hide-bottom-space outlined v-model="state.campeonato.abrangencia"
                                        label="Abrangência" :dense="dense" :options="$constantes.ABRANGENCIA">
                                    </q-select>
                                </div>
                                <div class="col-md-4 col-sm-6 col-12">
                                    <q-select hide-bottom-space outlined v-model="state.campeonato.modeloPontuacao"
                                        label="Modelo de Pontuação" :dense="dense" option-label="descricao"
                                        :emit-value="true" map-options :option-value="(obj) => obj._id"
                                        :options="listaModeloPontuacao"
                                        :error="$v.campeonato.modeloPontuacao.$error" error-message="Campo obrigatório">
                                        <template v-slot:append>
                                        </template>
                                    </q-select>
                                </div>
                                <div class="col-md-4 col-sm-6 col-12">
                                    <q-select hide-bottom-space outlined v-model="state.campeonato.modeloCategoria"
                                        label="Modelo de Categoria" :dense="dense" option-label="descricao"
                                        :emit-value="true" map-options :option-value="(obj) => obj._id"
                                        :options="listaModeloCategoria"
                                        :error="$v.campeonato.modeloCategoria.$error" error-message="Campo obrigatório">
                                        <template v-slot:append>
                                        </template>
                                    </q-select>
                                </div>
                                <div class="col-md-4 col-sm-6 col-12">
                                    <q-select v-model="state.campeonato.esporte" hide-bottom-space outlined label="Esporte"
                                        :dense="dense" option-label="descricao" :emit-value="true" map-options
                                        :option-value="(obj) => obj._id" :options="listaEsportes"
                                        :error="$v.campeonato.esporte.$error"
                                        @update:model-value="(value) => changeEsporte(value)"
                                        error-message="Campo obrigatório">
                                        <template v-slot:append>
                                        </template>
                                    </q-select>
                                </div>
                                <div class="col-md-4 col-sm-6 col-12">
                                    <q-select v-model="state.campeonato.modalidadeEsportiva" hide-bottom-space outlined
                                        label="Modalidade Esportiva" :dense="dense" :emit-value="true" map-options
                                        :options="listaModalidadesEsportivas"
                                        :error="$v.campeonato.modalidadeEsportiva.$error" error-message="Campo obrigatório">
                                        <template v-slot:append>
                                        </template>
                                    </q-select>
                                </div>


                            </div>
                            <div class="row q-ma-sm q-col-gutter-sm">
                                <div class="col-12">
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <q-checkbox v-model="state.campeonato.filiacaoNacionalObrigatoria"
                                            label="Filiação Nacional Obrigatória" />
                                        <q-checkbox v-model="state.campeonato.filiacaoEstadualObrigatoria"
                                            label="Filiação Estadual Obrigatória" />
                                        <q-checkbox v-model="state.campeonato.filiacaoInternacionalObrigatoria"
                                            label="Filiação Internacional Obrigatória" />
                                    </div>
                                </div>
                            </div>
                        </q-tab-panel>

                        <q-tab-panel name="etapas">
                            <q-card>
                                <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
                                    :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                                    <!-- <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-pink-400 to-pink-600"
                                        name="fas fa-trophy" size="30px" /> -->
                                    <q-toolbar-title><span class="mx-3 text-weight-medium">Etapas</span><q-btn
                                            class="btn-scale m-2" color="primary" push glossy round
                                            v-if="geral.funcoesAcessos.campeonatoInserir" @click="inserirEtapa"
                                            aria-label="inserir etapa" icon="add">
                                            <q-tooltip>Inserir</q-tooltip>
                                        </q-btn></q-toolbar-title>

                                </q-toolbar>
                                <q-card-section>
                                    <q-expansion-item class="shadow-1 overflow-hidden rounded-lg mb-4"
                                        v-for="(item, index) in state.campeonato.etapas" :key="index"
                                        header-class="rounded-lg pl-0!" group="etapasGroup" v-model="item.open">

                                        <template v-slot:header>


                                            <q-item-section avatar ml-2>
                                                <q-avatar v-if="!item.percurso" rounded icon="question_mark"
                                                    class="bg-gradient-to-r from-red-600 to-rose-400" text-color="white" />
                                                <q-avatar v-if="item.percurso" rounded
                                                    class="bg-gradient-to-r from-sky-600 to-rose-400" text-color="white">
                                                    {{ index + 1 }}
                                                </q-avatar>

                                            </q-item-section>
                                            <q-item-section class="text-weight-bold">
                                                <!-- <q-item-label >{{(item.evento ? item.evento.nome : 'Incompleto')}}</q-item-label>
                                        <q-item-label caption>{{item.evento ? `${item.evento.sigla} - ${item.evento.etapa}` : 'Selecione um evento'}} </q-item-label> -->
                                                <q-item-label>{{ (item.percurso ? item.evento.etapa : 'Incompleto')
                                                }}</q-item-label>
                                                <q-item-label>{{ (item.percurso ?
                                                    $geralService.getDataFormatada(item.evento.inicio) :
                                                    'Incompleto') }}</q-item-label>


                                            </q-item-section>

                                        </template>

                                        <div class="row q-ma-sm q-col-gutter-sm">

                                            <div class="col-md-6 col-12 mb-2">
                                                <q-field outlined label="Evento" stack-label :error="isErrorEvento(index)"
                                                    :error-message="(!item.evento) ? 'Campo Obrigatório' : 'Evento sem percursos cadastrados!'">
                                                    <template v-if="item.evento && item.evento.imagem" v-slot:prepend>
                                                        <q-avatar rounded size="50px">
                                                            <q-img
                                                                :src="$geralService.getUrlS3Thumb(item.evento.imagem, { height: 128 })"></q-img>
                                                        </q-avatar>
                                                    </template>
                                                    <template v-slot:control>
                                                        <div class="self-center full-width no-outline" tabindex="0"><span
                                                                v-if="item.evento">{{ item.evento.nome }}{{ ' (' +
                                                                    item.evento.sigla + ')' }}</span></div>
                                                    </template>
                                                    <template v-slot:append>
                                                        <q-btn color="primary" @click="selecionarEvento(index)"
                                                            icon="search" round>
                                                            <q-tooltip>Localizar Evento</q-tooltip>
                                                        </q-btn>
                                                    </template>
                                                </q-field>
                                            </div>
                                            <div v-if="item.evento" class="col-md-6 col-12">
                                                <q-select hide-bottom-space outlined v-model="item.percurso"
                                                    label="Percurso" :dense="dense" option-label="descricao"
                                                    :emit-value="true" map-options :option-value="(obj) => obj._id"
                                                    :options="item.evento.percursos"
                                                    :error="$v.campeonato.etapas.$each.$response.$errors[index].percurso && $v.campeonato.etapas.$each.$response.$errors[index].percurso.length > 0">
                                                    <template v-slot:append>
                                                    </template>
                                                </q-select>
                                            </div>
                                        </div>
                                        <div class="row q-ma-sm q-col-gutter-sm">
                                            <q-btn color="red" icon="delete" label="Delete"
                                                @click="state.campeonato.etapas.splice(index, 1)" />
                                        </div>

                                    </q-expansion-item>

                                </q-card-section>
                            </q-card>


                        </q-tab-panel>

                        <q-tab-panel name="logo">
                            <div class="row q-col-gutter-sm">
                                <div class="col-12">
                                    <div class="layout-padding">
                                        <div
                                            class="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-6 offset-lg-3 align-center justify-center row wrap">
                                            <q-card inline class="bigger q-ma-sm">
                                                <q-card-section class="flex justify-center">
                                                    <img style="max-height: 1200px; max-width: 630px;" :src="getUrlImagem">
                                                </q-card-section>
                                                <q-separator />
                                                <q-card-section class="flex justify-between gap-2">
                                                    <q-btn class="q-mt-sm" @click="buscarImagem" outline color="primary"
                                                        label="Buscar Imagem" />
                                                    <q-btn class="q-mt-sm"
                                                        v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && state.campeonato.logo !== undefined && state.campeonato.logo !== '')"
                                                        @click="imageData = null" outline color="secondary"
                                                        label="Ficar Sem" />
                                                    <q-btn class="q-mt-sm"
                                                        v-if="imageData !== '' && (state.campeonato.logo !== undefined && state.campeonato.logo !== '')"
                                                        @click="imageData = ''" outline color="deep-purple"
                                                        label="Restaurar" />
                                                </q-card-section>
                                            </q-card>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </q-tab-panel>

                        <q-tab-panel name="pagina">
                            <q-list bordered class="rounded-lg">
                                <Expansion group="grupoGeral" icon="link" labelBotao="Inserir Grupo" corBotao="indigo" :erroPadrao="$v.campeonato.grupoLinks.$error" titulo="Grupos de Links" @onInserir="inserirGrupoLink" >
                                <GrupoLink v-for="(item, index) in state.campeonato.grupoLinks"
                                                        draggable="true"
                                                        @dragend="(e: any) => finishDrag(state.campeonato.grupoLinks, item, index, e)"
                                                        @dragstart="(e: any) => startDrag(item, index, e)"
                                                    :key="'grupoLink' + index" v-model="state.campeonato.grupoLinks[index]"
                                                    :id="state.campeonato._id" :index="index"
                                                    :collectionName="'campeonato/' + state.campeonato.sigla + '/' + state.campeonato.ano"
                                                    @onExcluirGrupoLink="excluirGrupoLink" />
                                </Expansion>
                                <Expansion group="grupoGeral" labelBotao="Inserir Conteudo" corBotao="indigo" icon="ballot" :erroPadrao="$v.campeonato.conteudos.$error" titulo="Conteúdos Extras" @onInserir="inserirConteudo">
                                    <ConteudoExtra v-for="(item, index) in state.campeonato.conteudos"
                                    draggable="true"
                                                        @dragend="(e: any) => finishDrag(state.campeonato.conteudos, item, index, e)"
                                                        @dragstart="(e: any) => startDrag(item, index, e)"
                                                        :key="'conteudo' + index" v-model="state.campeonato.conteudos[index]"
                                                        @onExcluir="deletarGeral" />
                                </Expansion>
                                <Expansion group="grupoGeral" labelBotao="Inserir Contato" corBotao="indigo" icon="contacts" :erroPadrao="$v.campeonato.contatos.$error" titulo="Contatos" @onInserir="inserirContato">
                                    <Contato v-for="(item, index) in state.campeonato.contatos"
                                        @dragover="(e: any) => onDragOver(item, index, e)" draggable="true"
                                                    @dragend="(e: any) => finishDrag(state.campeonato.contatos, item, index, e)"
                                                    @dragstart="(e: any) => startDrag(item, index, e)"
                                                        :key="'contato' + index" v-model="state.campeonato.contatos[index]"
                                                        :index="index"
                                                        @onExcluir="deletarGeral" />
                                </Expansion>
                                <Expansion group="grupoGeral" labelBotao="Inserir" corBotao="indigo" icon="more_time" :erroPadrao="$v.campeonato.programacoes.$error" titulo="Programação" @onInserir="inserirProgramacoes">
                                <Programacao v-for="(item, index) in state.campeonato.programacoes"
                                            @dragover="(e: any) => onDragOver(item, index, e)" draggable="true"
                                                        @dragend="(e: any) => finishDrag(state.campeonato.programacoes, item, index, e)"
                                                        @dragstart="(e: any) => startDrag(item, index, e)"
                                                            :key="'programacao' + index" v-model="state.campeonato.programacoes[index]"
                                                            :index="index"
                                                            @onExcluir="deletarGeral" />   
                                </Expansion>
                                
                                <q-expansion-item group="grupoGeral" header-class="az-radius-top" expand-separator icon="tag"
                                        label="Tags">
                                        <div class="row q-col-gutter-sm p-4">
                                        <div class="col-12">
                                            <q-field outlined label="Tags" stack-label :dense="dense">
                                                <template v-slot:control>
                                                    <div class="self-center full-width no-outline" tabindex="0">
                                                        <q-chip v-for="(tag, index) in state.campeonato.tags" :key="index" dense
                                                            removable @remove="state.campeonato.tags.splice(index, 1)"
                                                            color="primary" text-color="white">
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
                                        </div>
                                    </q-expansion-item>
                            </q-list>
                        </q-tab-panel>
                    </q-tab-panels>

                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import SeletorEvento from "../SeletorEvento.vue";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, requiredIf, email } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';
import { reactive } from 'vue';
import ImageUpload2 from "../ImageUpload2.vue";
import icones from '../../service/iconawesome';


const props = defineProps({
    id: { type: String, default: null },
    copia: null,
});
const geral = useGeral();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const state: any = reactive({
    campeonato: { grupoLinks: [], conteudos: [], contatos: [], programacoes: [], administradores: [] },
});

const listaIcones = ref<any>(icones);
const dense = ref(false);
const $q = useQuasar();
const { $geralService } = useNuxtApp();
const indexEtapa = ref(-1);
const tab = ref('dados');
const objSelecionadoIndex = ref(-1);
const objSelecionado = ref<any>(null);
const objSelecionadoNome = ref<String>('');
const imageData = ref<any>('');
const imageUrl = ref('');
const listaModeloPontuacao = ref([]);
const listaModeloCategoria = ref([]);
const listaEsportes = ref([]);
const listaModalidadesEsportivas = ref([]);
const over = ref<any>({});
const startLoc = ref(0);
const dragging = ref(false);
const dragFrom = ref({});
const startDrag = (item: any, i: any, e: any) => {
    startLoc.value = e.clientY;
    dragging.value = true;
    dragFrom.value = item;
};
const finishDrag = (lista: any, item: any, pos: number, e: any) => {
    lista.splice(pos, 1)
    lista.splice(over.value.pos, 0, item);
    over.value = {}
};
const onDragOver = (item: any, pos: number, e: any) => {
    const dir = (startLoc.value < e.clientY) ? 'down' : 'up';
    setTimeout(() => {
        over.value = { item, pos, dir };
    }, 50)
};
const selectEvento = {
    nome: 1,
    sigla: 1,
    numero: 1,
    etapa: 1,
    inicio: 1,
    percursos: 1,
    imagem: 1
};
const selectPercurso = {
    descricao: 1,
    modeloCategoria: 1,
    tipo: 1,
    inicio: 1,
};

// GO valida
const validations = {
    campeonato: {
        descricao: {
            required
        },
        sigla: {
            required
        },
        modeloPontuacao: {
            required
        },
        modeloCategoria: {
            required
        },
        esporte: {
            required
        },
        modalidadeEsportiva: {
            required
        },
        etapas: {
            $each: helpers.forEach({
                evento: { required },
                percurso: { required },
            })
        },
        administradores: {
            $each: helpers.forEach({
                pessoa: {
                    required
                }
            })
        },
        grupoLinks: {
            $each: helpers.forEach({
                descricao: {
                    required
                },
                icone: {
                    required
                },
                links: {
                    $each: helpers.forEach({
                        descricao: {
                            required
                        },
                        url: {
                            required
                        }
                    })
                }
            })
        },
        conteudos: {
            $each: helpers.forEach({
                titulo: {
                    required
                },
                texto: {
                    required
                },
                icone: {
                    required
                }
            })
        },
        contatos: {
            $each: helpers.forEach({
                nome: {
                    required
                },
                cargo: {
                    required
                },
                telefone: {
                    // @ts-ignore
                    requiredIfFuction: requiredIf((dd: any, obj: any) => {
                        if (obj.email) {
                            return false;
                        }
                        return true;
                    }),
                },
                email: {
                    email,
                    // @ts-ignore
                    requiredIfFuction: requiredIf((dd: any, obj: any) => {
                        if (obj.telefone) {
                            return false;
                        }
                        return true;
                    }),
                }
            })
        },
        programacoes: {
            $each: helpers.forEach({
                titulo: {
                    required
                },
                inicio: {
                    required
                },
                fim: {
                    required
                }
            })
        }
    },
    $validationGroups: {
        informacoesError: ["campeonato.descricao", "campeonato.sigla", "campeonato.modeloPontuacao", "campeonato.modeloCategoria", "campeonato.esporte", "campeonato.modalidadeEsportiva"]
    },
};
const verificarPercursoDuplicado = () => {
    const lista = state.campeonato.etapas.map((item: any) => item.percurso);
    const listaFiltrada = lista.filter((item: any, index: number) => lista.indexOf(item) === index);
    return lista.length === listaFiltrada.length;
};
const verificarModalidadeCategoria = () => {
    const listaFiltrada = state.campeonato.etapas.filter((item: any) => {
        if (!item.percurso) {
            return false;
        }
        // console.log(item.evento.percursos.indexOf(item.percurso));
        // console.log(item.evento.percursos[item.evento.percursos.indexOf(item.percurso)].modeloCategoria);
        // console.log(state.campeonato.modeloCategoria);
        return item.percurso.modeloCategoria !== state.campeonato.modeloCategoria
    });
    return listaFiltrada.length == 0;
};
const $v = useVuelidate(validations, state);
const isErrorEvento = (index: number) => {
    if (state.campeonato.etapas[index].evento) {
        return state.campeonato.etapas[index].evento.percursos.length === 0;
    } else {
        return true;
        // return $v.value.campeonato.etapas.$each.$response.$errors[index].evento && $v.value.campeonato.etapas.$each.$response.$errors[index].evento.length > 0;
    }

}
const inserir = ref(true);
const getUrlImagem = computed(() => {
    return $geralService.getUrlImagem(imageData.value, state.campeonato, 'logo', imageUrl.value);
});

watch(() => state.campeonato.descricao, async (newQuestion, oldQuestion) => {

    state.campeonato.rota = $geralService.removeCaracteresEspeciais(newQuestion);
})

const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        years.push(i);
    }
    return years;
};
const listaAnos = getYears();


onBeforeMount(async () => {
    await setListaModeloPontuacao();
    await setListaModeloCategoria();
    await setListaEsportes();


    if (props.id) {
        const ret: any = await useCustomFetch('campeonato/getPopulate', 'post', {
            filtro: {
                _id: props.id
            },
            populateObj: [
                { path: 'etapas.evento', select: selecionarEvento, populate: { path: 'percursos', select: selectPercurso } }
            ]
        }, undefined);
        if (ret.valido) {
            state.campeonato = JSON.parse(JSON.stringify(ret.data[0]));
            setListaModalidadeEsportiva();
            if (props.copia) {
                state.campeonato.descricao = state.campeonato.descricao + " (Cópia)";
                state.campeonato._id = await $geralService.getId();
                state.campeonato.__v = undefined;
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
        state.campeonato = {
            _id: await $geralService.getId(),
            entidade: geral.entidade._id,
            descricao: null,
            sigla:null,
            tags: [],
            etapas: [],
            campeonatos: [],
            grupoLinks: [],
            contatos: [],
            administradores: [],
            documentos: [],
            programacoes: [],
            conteudos: [],
            parceiros: [],
            ano: new Date().getFullYear(),
            abrangencia: 'Estadual',
            filiacaoEstadualObrigatoria: false,
            filiacaoNacionalObrigatoria: true,
            filiacaoInternacionalObrigatoria: false,
        }

        inserir.value = true;
    }
    $v.value.campeonato.$touch();

});


const changeEsporte = async (value: String) => {
    await setListaModalidadeEsportiva();
    state.campeonato.modalidadeEsportiva = undefined;
};

const inserirEtapa = () => {
    $v.value.campeonato.etapas.$model.push({ open: true, evento: null, percurso: null });
    $v.value.campeonato.etapas.$touch();
};

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
            state.campeonato.tags.push(data);
        }
    });
};


const selecionarEvento = (index: number) => {
    indexEtapa.value = index;
    $q.dialog({
        component: SeletorEvento,
        persistent: true,
        componentProps: {
            select: selectEvento,
            populateObj: [{ path: 'percursos', select: selectPercurso }]
        },
    })
        .onOk(async (data) => {
            confirmSelecaoEvento(data);
        })
        .onCancel(() => { });



}

const confirmSelecaoEvento = (evento: any) => {
    if (state.campeonato.etapas[indexEtapa.value].evento && state.campeonato.etapas[indexEtapa.value].evento._id !== evento._id) {
        state.campeonato.etapas[indexEtapa.value].percurso = undefined;
    }
    state.campeonato.etapas[indexEtapa.value].evento = evento;
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


const setListaModalidadeEsportiva = async () => {
    const ret1: any = await useCustomFetch('modalidadeEsportiva/getPopulate', 'post', {
        filtro: {
            lixo: false,
            esporte: state.campeonato.esporte
        },
        populateObj: []
    }, undefined);

    if (ret1.valido) {
        listaModalidadesEsportivas.value = ret1.data.map((esporte: any) => {
            return {
                label: esporte.descricao,
                value: esporte._id,
                obj: esporte
            };
        });

    } else {
        listaModalidadesEsportivas.value = [];
    }
};

const setListaEsportes = async () => {
    const ret = await useCustomFetch(
        'esporte/getPopulate',
        'post', {
        filtro: {
            lixo: false
        },
        select: {
            descricao: 1
        },
        populateObj: []
    },
        null
    );
    if (ret.valido) {
        listaEsportes.value = ret.data;
        if (listaEsportes.value.length === 0) {
            $q.notify({
                position: 'top',
                icon: 'warning',
                color: 'warning',
                message: 'Nenhum esporte cadastrado! Cadastre os esportes primeiro.'
            });
            cancel();
        }
    } else {
        $q.notify({
            position: 'top',
            icon: 'warning',
            color: 'warning',
            message: 'Falha as buscar os esportes.'
        });
        cancel();
    }
};

const setListaModeloPontuacao = async () => {
    try {

        const ret = await useCustomFetch('modeloPontuacao/getPopulate', 'post', {
            filtro: {
                lixo: false
            }
        }, undefined);
        if (ret.valido) {
            listaModeloPontuacao.value = ret.data;
        } else {
            listaModeloPontuacao.value = [];
        }
    } catch (error) { }
};
const setListaModeloCategoria = async () => {
    try {

        const ret = await useCustomFetch('modeloCategoria/getPopulate', 'post', {
            filtro: {
                lixo: false
            }
        }, undefined);
        if (ret.valido) {
            listaModeloCategoria.value = ret.data;
        } else {
            listaModeloCategoria.value = [];
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
    // $v.value.campeonato.vinculos.$touch();
    $v.value.campeonato.$touch();

    if ($v.value.campeonato.$error || !(imageData.value || state.campeonato.logo)) {
// console.log($v.value.campeonato);
        $q.loading.hide();
        $q.notify({
            color: 'warning',
            position: 'top',
            icon: 'check',
            message: 'Preeencha todos os campos obrigatórios para salvar!'
        });
        return;


    }
    if (!verificarModalidadeCategoria()) {
        $q.loading.hide();
        $q.notify({
            color: 'red',
            position: 'top',
            icon: 'error',
            message: 'Erro nas etapas!',
            caption: 'Não é permitido selecionar um percurso com modelo de categoria diferente do modelo de categoria do campeonato!'
        });
        return;
    }
    if (!verificarPercursoDuplicado()) {
        $q.loading.hide();
        $q.notify({
            color: 'red',
            position: 'top',
            icon: 'error',
            message: 'Erro nas etapas!',
            caption: 'Não é permitido selecionar o mesmo percurso em mais de uma etapa!'
        });
        return;
    }


    // if ($v.value.campeonato.vinculos.$error) {
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

    delete state.campeonato.__v;

    const newNoticia = JSON.parse(JSON.stringify(state.campeonato));

    if (imageData.value !== '') {
        $q.loading.show({
            spinner: QSpinnerOval,
            spinnerColor: 'white',
            spinnerSize: 60,
            message: 'Fazendo upload de logo...Aguarde!',
            messageColor: 'white'
        });
    }

    $geralService.executaUpload(
        newNoticia,
        'logo',
        imageData.value,
        inserir.value,
        'jpg',
        'campeonatos/imagens/',
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
const save = async (newNoticia: any, nomeTempFile: any) => {
    // console.log(newNoticia);
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Salvando registro...Aguarde!',
        messageColor: 'white'
    });
    let url = 'campeonato';
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


const inserirGeral = (nomeLista: any, inicio: any) => {
    objSelecionadoIndex.value = -1;
    objSelecionadoNome.value = nomeLista;
    objSelecionado.value = null;
    state.campeonato[nomeLista].forEach((element: any) => {
        element.expanded = false;
    });
    state.campeonato[nomeLista].push(inicio || {});
};
const deletarGeral = (nomeLista: any, index: number) => {
    state.campeonato[nomeLista].splice(index, 1);
    state.campeonato[nomeLista].forEach((element: any) => {
        element.expanded = false;
    });
};

const inserirGrupoLink = () => {
    state.campeonato.grupoLinks.forEach((element: any) => {
        element.expanded = false;
    });

    if (state.campeonato.grupoLinks.length === 0) {
        state.campeonato.grupoLinks.push({
            links: [],
            descricao: 'Documentos',
            icone: 'fas fa-folder-open',
            expanded: true
        });
    } else {
        state.campeonato.grupoLinks.push({
            links: [],
            descricao: null,
            icone: null,
            expanded: true
        });
    }
};
const excluirGrupoLink = (index: number) => {
    // if (state.campeonato.grupoLinks[index].documentos.length > 0) {
    // }
    $q
        .dialog({
            title: 'Confirmação',
            message: `Deseja realmente excluir o grupo ${state.campeonato.grupoLinks[index].descricao}? Todos os links deste grupo serão excluídos juntos.`,
            focus: 'cancel',
            ok: {
                color: 'primary',
                label: 'sim'
            },
            cancel: {
                color: 'negative',
                label: 'Não'
            }
        })
        .onOk(async () => {
            state.campeonato.grupoLinks.splice(index, 1);
            state.campeonato.grupoLinks.forEach((element: any) => {
                element.expanded = false;
            });
        });
};

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
const inserirConteudo = () => {
    inserirGeral('conteudos', { titulo: '', texto: '', icone: '', expanded: true });
}
const inserirContato = () => {
    inserirGeral('contatos', { nome: null, cargo: null, telefone: null, email: null, expanded: true });
}
const inserirProgramacoes = () => {
    inserirGeral('programacoes', { titulo: null, inicio: null, fim: null, icone: null, descricao: null, expanded: true });
}

</script>