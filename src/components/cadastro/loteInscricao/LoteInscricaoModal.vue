<template>
    <div>
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-l from-lime-400 to-green-700"
                        name="event_note" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Lote de Inscrição</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="save" :label="$q.screen.gt.xs ? 'Salvar' : undefined"
                        icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <div class="row q-col-gutter-sm">
                        <div class="col-sm-4 col-md-6 col-12">
                            <q-input autofocus hide-bottom-space outlined v-model="state.loteInscricao.descricao"
                                label="Descricao" :dense="dense" @blur="$v.loteInscricao.descricao.$touch"
                                :error="$v.loteInscricao.descricao.$error" error-message="Campo obrigatório" />
                        </div>
                        <div class="col-sm-4 col-md-3 col-6">
                            <CinputDate tipo="datetime" hide-bottom-space outlined v-model="state.loteInscricao.inicio" label="Inicio"
                                :dense="dense" @blur="$v.loteInscricao.inicio.$touch"
                                :error="$v.loteInscricao.inicio.$error" error-message="Campo obrigatório" />
                        </div>
                        <div class="col-sm-4 col-md-3 col-6">
                            <CinputDate  tipo="datetime" hide-bottom-space outlined v-model="state.loteInscricao.fim" label="Fim"
                                :dense="dense" @blur="$v.loteInscricao.fim.$touch" :error="$v.loteInscricao.fim.$error"
                                error-message="Campo obrigatório" />
                        </div>
                        <!-- <div class="col-sm-6 col-md-4 col-12 row">
                            <div class="col-6">
                                <q-checkbox v-model="state.loteInscricao.taxaComodidade" label="Taxa" />
                            </div>
                            <div class="col-6">
                                <q-input type="number" hide-bottom-space outlined :readonly="!state.loteInscricao.taxaComodidade" v-model="state.loteInscricao.taxaComodidadeIndice" label="Taxa Comodidade Indice" :dense="dense" />
                            </div>
              </div>-->
                        <!-- Configuração Consumíveis -->
                        <div class="col-12 my-2 ">
                            <q-list bordered class="rounded-lg">
                                <q-item-label class="az-selecionado az-radius-top" :dense="true" style="padding: 5px;">
                                    <span class="text-bold text-subtitle1">
                                        Configurações de Consumíveis
                                    </span>
                                    <q-btn class="q-ml-sm" color="indigo" @click="inserirConsumido" icon="add" round push
                                        glossy size="sm">
                                        <q-tooltip>Inserir Nova Configuração de Consumível</q-tooltip>
                                    </q-btn>
                                </q-item-label>
                                <span v-for="(consumido, index) in state.loteInscricao.consumiveis" :key="index">
                                    <CadastroLoteInscricaoConsumivel v-model="state.loteInscricao.consumiveis[index]"
                                        :listaConsumiveis="listaConsumiveis" :index="index" @onExcluir="excluirConsumido">
                                        <div v-if="consumido.consumivel" class="col-12">
                                            <!-- TO Descontos -->
                                            <q-list bordered class="rounded-lg">
                                                <q-item-label class="az-selecionado2 az-radius-top font-bold" :dense="true"
                                                    style="padding: 5px;">
                                                    Dsescontos {{ consumido.consumivel ?
                                                        `(${consumido.consumivel.descricao})` : '' }}
                                                    <q-btn color="indigo"
                                                        @click="inserirAcrescimoDesconto(index, 'descontos')" icon="add"
                                                        round push glossy size="sm">
                                                        <q-tooltip>Inserir Novo Desconto</q-tooltip>
                                                    </q-btn>
                                                </q-item-label>


                                                <span v-for="(desconto, index2) in consumido.descontos">
                                                    <CadastroLoteInscricaoConsumivelDesconto @add-categoria="addCategoria"
                                                        @addEntidade="addEntidade" @on-excluir="excluirAcrescimoDesconto"
                                                        v-model="state.loteInscricao.consumiveis[index].descontos[index2]"
                                                        :getUrlImagem="getUrlImagem"
                                                        :percurso="!(consumido.consumivel.percurso == null)" :key="index2"
                                                        :index="index" :index2="index2">
                                                    </CadastroLoteInscricaoConsumivelDesconto>
                                                </span>

                                            </q-list>
                                            <!-- TO Dependentes -->
                                            <q-list bordered class="rounded-lg mt-4">
                                                <q-item-label class="az-selecionado4 az-radius-top font-bold" :dense="true"
                                                    style="padding: 5px;">
                                                    Descontos Para Dependentes {{ consumido.consumivel ?
                                                        `(${consumido.consumivel.descricao})` : '' }}
                                                    <q-btn color="indigo"
                                                        @click="inserirAcrescimoDesconto(index, 'descontosDependentes')"
                                                        icon="add" round push glossy size="sm">
                                                        <q-tooltip>Inserir Novo Desconto</q-tooltip>
                                                    </q-btn>
                                                </q-item-label>

                                                <span v-for="(descDep, index2) in consumido.descontosDependentes">
                                                    <CadastroLoteInscricaoConsumivelDescontoDependente
                                                        v-model="state.loteInscricao.consumiveis[index].descontosDependentes[index2]"
                                                        :getUrlImagem="getUrlImagem"
                                                        :percurso="!(consumido.consumivel.percurso == null)" :key="index2"
                                                        :index="index" :index2="index2"
                                                        @addCategoria="addCategoria" @addEntidade="addEntidade" @onAddValores="addValores" @onExcluir="excluirAcrescimoDesconto"
                                                        >
                                                    </CadastroLoteInscricaoConsumivelDescontoDependente>
                                                </span>

                                            </q-list>
                                            <!-- TO Acréscimos -->
                                            <q-list bordered class="rounded-lg mt-4">
                                                <q-item-label class="az-selecionado3 az-radius-top font-bold" :dense="true"
                                                    style="padding: 5px;">
                                                    Acréscimos {{ consumido.consumivel ?
                                                        `(${consumido.consumivel.descricao})` : '' }}
                                                    <q-btn color="indigo"
                                                        @click="inserirAcrescimoDesconto(index, 'acrescimos')" icon="add"
                                                        round push glossy size="sm">
                                                        <q-tooltip>Inserir Novo Acréscimo</q-tooltip>
                                                    </q-btn>
                                                </q-item-label>
                                                <span v-for="(acrescimo, index2) in consumido.acrescimos">
                                                    <CadastroLoteInscricaoConsumivelAcrescimo @add-categoria="addCategoria"
                                                        @add-entidade="addEntidade" @on-excluir="excluirAcrescimoDesconto"
                                                        v-model="state.loteInscricao.consumiveis[index].acrescimos[index2]"
                                                        :getUrlImagem="getUrlImagem"
                                                        :percurso="!(consumido.consumivel.percurso == null)" :key="index2"
                                                        :index="index" :index2="index2">
                                                    </CadastroLoteInscricaoConsumivelAcrescimo>
                                                </span>
                                            </q-list>
                                        </div>

                                    </CadastroLoteInscricaoConsumivel>
                                </span>
                            </q-list>
                        </div>
                        <!-- Desconto Pacotes -->
                        <div class="col-12">
                            <q-list bordered class="rounded-lg">
                                <q-item-label class="az-selecionado5 az-radius-top" :dense="true" style="padding: 5px;">
                                    <span class="text-bold text-subtitle1 q-mr-sm">Descontos Para Pacotes</span>
                                    <q-btn color="indigo" @click="inserirPacote" icon="add" round push glossy size="sm">
                                        <q-tooltip>Inserir Novo Desconto</q-tooltip>
                                    </q-btn>
                                </q-item-label>
                                <span v-for="(pacote, indexo) in state.loteInscricao.descontoPacote" :key="indexo">
                                    <CadastroLoteInscricaoDescontoPacote :index="indexo"
                                        v-model="state.loteInscricao.descontoPacote[indexo]"
                                        :listaConsumiveis="listaConsumiveis" @onExcluir="excluirPacote">
                                        <q-list bordered class="rounded-lg my-4">
                                            <q-item-label class="az-selecionado7 az-radius-top" :dense="true"
                                                style="padding: 5px;">
                                                <span class="text-bold text-subtitle1 q-mr-sm">Consumiveis do Pacote</span>
                                                <q-btn color="indigo" @click="inserirPacoteConsumivel(indexo)" icon="add" round push glossy
                                                    size="sm">
                                                    <q-tooltip>Inserir Consumível</q-tooltip>
                                                </q-btn>
                                            </q-item-label>
                                            <span v-for="(pacote, indexo2) in state.loteInscricao.descontoPacote[indexo].consumiveis"
                                                :key="indexo">
                                                <CadastroLoteInscricaoDescontoPacoteConsumivel :index="indexo" :index2="indexo2"
                                                    v-model="state.loteInscricao.descontoPacote[indexo].consumiveis[indexo2]"
                                                    :listaConsumiveis="listaConsumiveis" @onExcluir="excluirPacoteConsumivel">
                                                </CadastroLoteInscricaoDescontoPacoteConsumivel>
                                            </span>
                                        </q-list>
                                    </CadastroLoteInscricaoDescontoPacote>
                                </span>
                            </q-list>
                            
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minLength } from "@vuelidate/validators";
import SeletorCategoriaModal from "@/components/SeletorCategoriaModal.vue";
import BuscarEntidade from "@/components/BuscarEntidade.vue";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';
import { reactive } from 'vue';


const props = defineProps({
    id: { type: String, default: null },
    evento: { type: String, default: null },
    copia: null,
});

const state: any = reactive({
    loteInscricao: {
        evento: props.evento,
        descricao: null,
        inicio: null,
        fim: null,
        taxaComodidade: false,
        consumiveis: [],
        descontoPacote: [],
        descontosDependentes: []
    }
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data


const listaConsumiveis = ref([]);

const { $geralService } = useNuxtApp();
const dense = ref(false);
const $q = useQuasar();

const tipoIndex = ref<String>('');
const indexConsumivel = ref<number>(-1);
const indexAcrescimoDesconto = ref<number>(-1);
const modeloCategoriaTemp = ref<any>(null);
const mensagemRequired = 'Campo Obrigatório.';


// GO valida
const validations = {
    loteInscricao: {
        descricao: {
            required
        },
        inicio: {
            required
        },
        fim: {
            required
        },
    }

};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

onMounted(async () => {
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: "white",
        spinnerSize: 60,
        message: "Buscando Dados... Aguarde!",
        messageColor: "white",
    });
    await setListaConsumiveis();
    if (props.id) {
        const ret: any = await useCustomFetch('loteInscricao/getPopulate',
            'post', {
            filtro: {
                _id: props.id
            },
            populateObj: [{
                path: 'consumiveis.consumivel',
                populate: {
                    path: 'percurso',
                    populate: 'modeloCategoria'
                }
            },
            {
                path: 'consumiveis.descontos.entidades',
                select: {
                    sigla: 1,
                    logo: 1
                }
            },
            {
                path: 'consumiveis.descontosDependentes.entidades',
                select: {
                    sigla: 1,
                    logo: 1
                }
            },
            {
                path: 'consumiveis.acrescimos.entidades',
                select: {
                    sigla: 1,
                    logo: 1
                }
            }
            ]
        }, undefined);
        if (ret.valido) {
            state.loteInscricao = ret.data[0];
            if (props.copia) {
                state.loteInscricao.descricao = state.loteInscricao.descricao + " (Cópia)";
                state.loteInscricao._id = undefined;
                state.loteInscricao.__v = undefined;
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
    $q.loading.hide();
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
// TO save
const save = async () => {
    $v.value.$touch();

    if ($v.value.$error) {
        $q.notify({
            color: "warning",
            position: "top",
            icon: "warning",
            message: "Não é possível salvar!",
            caption: "Preencha todos os campos obrigatórios.",
        });
        return;
    }

    let url = "loteInscricao";
    let tipo = "post";
    if (!inserir.value) {
        url += "/" + props.id;
        tipo = "put";
    }
    // const ret = await this.$geralService.comunicaAsync(url, tipo, state.loteInscricao, "salvar loteInscricao");
    const ret: any = await useCustomFetch(url, tipo, state.loteInscricao, undefined);
    if (ret.valido) {
        onDialogOK(ret.data);
        $q.notify({
            type: "positive",
            message: "Registro salvo com sucesso!",
        });
    } else {
        $q.notify({
            type: "negative",
            message: "Falha ao salvar",
        });
    }
};

const setListaConsumiveis = async () => {
    const ret = await useCustomFetch(
        'consumivel/getPopulate',
        'post', {
        filtro: {
            evento: props.evento,
            lixo: false
        },
        select: {
            descricao: 1,
            imagem: 1,
            percurso: 1,
            quantidadeDisponivel: 1
        },
        populateObj: [{
            path: 'percurso',
            populate: 'modeloCategoria'
        }]
    }, undefined
    );
    if (ret.valido) {
        listaConsumiveis.value = ret.data;
    }
};

const inserirAcrescimoDesconto = (index: number, tipo: any) => {
    const arr = state.loteInscricao.consumiveis[index][tipo];
    const addTmp: any = {
        descricao: '',
        idadeMinima: '0',
        idadeMaxima: '120',
        sexo: 'Qualquer',
        categorias: [],
        entidades: [],
        open: false
    };

    if (tipo === 'descontosDependentes') {
        addTmp.tipos = [];
        addTmp.sexo = undefined;
        addTmp.minimo = 0;
        addTmp.maximo = 100;
        addTmp.sequenciaDescontos = [];
    }
    arr.push(addTmp);

    // Faceta para não dar problema de renderização no expansion-item do
    setTimeout(() => {
        arr[arr.length - 1].open = true;
        setTimeout(() => {
            // this.$refs['loteInscricao.consumiveis' + index + '.' + tipo + (arr.length - 1) + '.descricao'][0].focus();
            // $v.value.loteInscricao.consumiveis.$touch();
        }, 300);
    }, 100);
};

// const itemRefsConsumiveis = ref([])
// const itemRefsDescontoPacote = ref([])

const excluirAcrescimoDesconto = (index: number, index2: number, tipo: any, event: any) => {
    state.loteInscricao.consumiveis[index][tipo].splice(index2, 1);
};
// GO inserir Pacote Descontos
const inserirPacote = () => {
    const arr = state.loteInscricao.descontoPacote;
    arr.push({
        descricao: '',
        consumiveis: [],
        open: true
    });
};

const excluirPacoteConsumivel = (index: number, index2: number) => {
    state.loteInscricao.descontoPacote[index].consumiveis.splice(index2, 1);
};

// GO inserir Pacote Descontos
const inserirPacoteConsumivel = (index: number) => {
    const arr = state.loteInscricao.descontoPacote[index].consumiveis;
    arr.push({
        consumivel: null,
        valor: '',
        agrupador: null,
        cetegorias:[],
        tipo: 'Valor',
        open: true
    });
};

const excluirPacote = (index: number, event: any) => {
    state.loteInscricao.descontoPacote.splice(index, 1);
};

// GO inserir Consumido
const inserirConsumido = () => {
    if (listaConsumiveis.value.length > 0) {
        state.loteInscricao.consumiveis.push({
            consumivel: undefined,
            valor: 0,
            quantidade: 0,
            descontos: [],
            descontosDependentes: [],
            acrescimos: [],
            descontosCumulativos: false,
            open: true
        });

    } else {
        $q.notify({
            position: 'top',
            icon: 'warning',
            color: 'warning',
            message: 'Ação Cancelada! Primeiro cadastre consumímeis para este evento.'
        });
    }
};
const excluirConsumido = (index: number) => {
    state.loteInscricao.consumiveis.splice(index, 1);
    state.loteInscricao.consumiveis.forEach((element: any) => {
        element.open = false;
    });
};

const addCategoria = (idxConsumivel: number, idxAcrescimoDesconto: number, tipo: String) => {
    indexConsumivel.value = idxConsumivel;
    indexAcrescimoDesconto.value = idxAcrescimoDesconto;
    tipoIndex.value = tipo;
    modeloCategoriaTemp.value = state.loteInscricao.consumiveis[idxConsumivel].consumivel.percurso.modeloCategoria;

    $q.dialog({
        component: SeletorCategoriaModal,
        persistent: true,
        componentProps: {
            modeloCategoria: modeloCategoriaTemp.value,
        },
    })
        .onOk(async (data) => {
            confirmSelecaoCategoria(data);
        })
        .onCancel(() => { });

    // // console.log(modeloCategoriaTemp.value);
    // openSeletorCategoria();
};

const addEntidade = (idxConsumivel: number, idxAcrescimoDesconto: number, tipo: String) => {
    console.log('addEntidade');
    tipoIndex.value = tipo;
    indexConsumivel.value = idxConsumivel;
    indexAcrescimoDesconto.value = idxAcrescimoDesconto;
    tipoIndex.value = tipo;
    $q.dialog({
        component: BuscarEntidade,
        persistent: true,
        componentProps: {
            modeloCategoria: modeloCategoriaTemp.value,
        },
    })
        .onOk(async (data) => {
            confirmSelecao(data);
        })
        .onCancel(() => { });

};

const confirmSelecao = (objEntidade: any) => {
    console.log('confirmSelecao');
    let add = true;
    for (
        let index = 0; index <

        // @ts-ignore
        state.loteInscricao.consumiveis[indexConsumivel.value][tipoIndex.value][indexAcrescimoDesconto.value].entidades.length; index++
    ) {

        // @ts-ignore
        const element = state.loteInscricao.consumiveis[indexConsumivel.value][tipoIndex.value][indexAcrescimoDesconto.value].entidades[index];
        if (element._id === objEntidade._id) {
            add = false;
            break;
        }
    }
    if (add) {
        // @ts-ignore
        state.loteInscricao.consumiveis[indexConsumivel.value][tipoIndex.value][indexAcrescimoDesconto.value].entidades.push(objEntidade);
    }
};

const addValores = (index: number, index2: number) => {
    $q.dialog({
        title: 'Adicionar Desconto',
        message: 'Digite o valor',
        position: !$q.platform.is.desktop ? 'top' : 'standard',
        prompt: {
            model: '',
            type: 'number',
            outlined: true,
            prefix: 'R$ '
        },
        cancel: true,
        persistent: true
    }).onOk(data => {
        if (data) {
            state.loteInscricao.consumiveis[index].descontosDependentes[index2].sequenciaDescontos.push(data);
            // this.item.obs.push(data);
            // this.$forceUpdate();
        }
    });
};

const confirmSelecaoCategoria = (obj: any) => {
    obj.forEach((element: any) => {
        if (
            // @ts-ignore
            state.loteInscricao.consumiveis[indexConsumivel.value][tipoIndex.value][indexAcrescimoDesconto.value].categorias.indexOf(element.descricao) === -1
        ) {
            // @ts-ignore
            state.loteInscricao.consumiveis[indexConsumivel.value][tipoIndex.value][indexAcrescimoDesconto.value].categorias.push(element.descricao);
        }
    });
};

const getListaCategorias = (modeloCategoria: any) => {
    const teste = modeloCategoria.categorias.map((obj: any) => obj.descricao);
    return teste;
};

const getUrlImagem = (caminho: String, tamanho: number) => {
    return $geralService.getUrlS3Thumb(caminho, {
        height: tamanho
    });
};

</script>

