<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-indigo-700 to-sky-400" name="event"
                        size="30px" />

                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Agenda</q-toolbar-title>
                    <!-- GO btnSave -->

                    <q-btn
                        v-if="state.financeiroAgenda.status !== 'Concluído' && !inserir && state.financeiroAgenda.dataPagamento && state.financeiroAgenda.valorPago > 0 && (novoComp || state.financeiroAgenda.comprovanteImagem)"
                        color="primary" @click="beforeSave(true)" aria-label="Pagar - " push glossy
                        :round="$q.screen.xs ? true : false" class="btn-scale mr-3" :label="$q.screen.gt.xs ? 'Salvar e Concluir': undefined"
                        icon="event_available"></q-btn>
                    <q-btn v-if="state.financeiroAgenda.status !== 'Cancelado' && !inserir" color="negative"
                        @click="cancelarFinanceiroAgenda()" aria-label="Cancelar - " push glossy
                        :round="$q.screen.xs ? true : false" class="btn-scale mr-3" :label = "$q.screen.gt.xs ? 'Excluir Agenda': undefined"
                        icon="event_busy"></q-btn>
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave(false)"
                        :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>



                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <q-tabs class=""
                        v-model="tab" :active-color="$q.dark.isActive ? 'info' : 'primary'" indicator-color="primary"
                        align="justify" narrow-indicator>
                        <q-tab default name="dados" icon="line_style" label="Informações" />
                        <q-tab name="documento" icon="image" label="Documento" />
                        <q-tab name="comprovante" v-if="!inserir" icon="image" label="Comprovante" />
                    </q-tabs>
                    <q-tab-panels v-model="tab" animated>
                        <q-tab-panel name="dados">
                            <div class="q-ma-sm">
                                <q-chip class="q-mb-md"
                                    :color="state.financeiroAgenda.status === 'Aberto' ? 'warning' : state.financeiroAgenda.status === 'Concluído' ? 'positive' : 'negative'"
                                    text-color="white"
                                    :icon="state.financeiroAgenda.status === 'Concluído' ? 'event_available' : state.financeiroAgenda.status === 'Aberto' ? 'event' : 'event_busy'">
                                    {{ state.financeiroAgenda.status }}
                                </q-chip>
                                <div class="row q-col-gutter-sm">
                                    <div class="col-md-3 col-sm-6 col-12">
                                        <q-field hide-bottom-space outlined label="Tipo" dense stack-label>
                                            <template v-slot:control>
                                                <div class="col-md-4 col-sm-6 col-12 self-center full-width no-outline row"
                                                    tabindex="0">
                                                    <q-radio :readonly="state.financeiroAgenda.status === 'Concluído'"
                                                        class="col-6" v-model="state.financeiroAgenda.tipo" val="D"
                                                        label="Débito" />
                                                    <q-radio :readonly="state.financeiroAgenda.status === 'Concluído'"
                                                        class="col-6" v-model="state.financeiroAgenda.tipo" val="C"
                                                        label="Crédito" />
                                                </div>
                                            </template>
                                        </q-field>
                                    </div>
                                    <div class="col-md-6 col-sm-6 col-12">
                                        <q-input :readonly="state.financeiroAgenda.status === 'Concluído'" hide-bottom-space
                                            outlined v-model="state.financeiroAgenda.descricao" label="Descrição"
                                            :dense="dense" @blur="$v.financeiroAgenda.descricao.$touch"
                                            :error="$v.financeiroAgenda.descricao.$error"
                                            error-message="Campo obrigatório" />
                                    </div>
                                    <div class="col-md-3 col-sm-6 col-12">
                                        <q-input :readonly="state.financeiroAgenda.status === 'Concluído'" hide-bottom-space
                                            type="number" outlined v-model="state.financeiroAgenda.valor"
                                            label="Valor Documento" :dense="dense" prefix="R$"
                                            @blur="$v.financeiroAgenda.valor.$touch"
                                            :error="$v.financeiroAgenda.valor.$error"
                                            error-message="Campo obrigatório" />
                                    </div>

                                    <!-- <div v-if="inserir === false" class="col-md-3 col-sm-6 col-12">
                                        <q-select :readonly="state.financeiroAgenda.status==='Concluído'" hide-bottom-space outlined v-model="state.financeiroAgenda.status" :options="status" label="Status" :dense="dense" />
                                    </div> -->
                                </div>
                                <div class="row q-col-gutter-sm q-mt-sm">
                                    <div class="col-md-2 col-sm-6 col-12">
                                        <q-input :readonly="state.financeiroAgenda.status === 'Concluído'" hide-bottom-space
                                            outlined hint="ex. NF 0057" v-model="state.financeiroAgenda.documento"
                                            label="Documento" :dense="dense" />
                                    </div>
                                    <div class="col-md-3 col-sm-6 col-12">
                                        <q-select :readonly="state.financeiroAgenda.status === 'Concluído'" hide-bottom-space
                                            outlined v-model="state.financeiroAgenda.conta" label="Conta" :dense="dense"
                                            option-label="descricao" :emit-value="true" map-options option-value="_id"
                                            :options="listaConta" @blur="$v.financeiroAgenda.conta.$touch"
                                            :error="$v.financeiroAgenda.conta.$error"
                                            error-message="Campo obrigatório">
                                            <template v-slot:append>
                                                <q-icon name="search" />
                                            </template>
                                        </q-select>
                                    </div>
                                    <div class="col-md-3 col-sm-6 col-12">
                                        <q-select :readonly="state.financeiroAgenda.status === 'Concluído'" hide-bottom-space
                                            outlined v-model="state.financeiroAgenda.planoDeConta"
                                            :option-disable="opt => opt.especificacao === 'Sintética'"
                                            @update:model-value="inputPlanoConta" label="Plano de Conta" :dense="dense" map-options
                                            :option-label="getDescricaoPlanoConta" :emit-value="true" option-value="_id"
                                            :options="getListaPlanoFiltro"
                                            @blur="$v.financeiroAgenda.planoDeConta.$touch"
                                            :error="$v.financeiroAgenda.planoDeConta.$error"
                                            error-message="Campo obrigatório">
                                            <template v-slot:append>
                                                <q-icon name="search" />
                                            </template>
                                            <template v-slot:option="scope">
                                                <q-item v-bind="scope.itemProps">
                                                    <q-item-section>
                                                        <q-item-label>
                                                            {{ scope.opt.identificador }} - {{ scope.opt.descricao }}
                                                        </q-item-label>
                                                    </q-item-section>
                                                </q-item>
                                            </template>
                                        </q-select>
                                    </div>
                                    <div class="col-md-2 col-sm-6 col-12">
                                        <q-field outlined label="Emissão" stack-label>
                                            {{ $geralService.getDataHoraFormatada(state.financeiroAgenda.dataEmissao) }}
                                        </q-field>
                                        <!-- <CinputDate :readonly="state.financeiroAgenda.status === 'Concluído'"
                                            :dark="$q.dark.isActive" outlined hide-bottom-space
                                            v-model="state.financeiroAgenda.dataEmissao" label="Dt. Emissão"
                                            @blur="$v.financeiroAgenda.dataEmissao.$touch"
                                            :error="$v.financeiroAgenda.dataEmissao.$error"
                                            error-message="Campo obrigatório" :dense="dense" /> -->
                                    </div>
                                    <div class="col-md-2 col-sm-6 col-12">
                                        <CinputDate :readonly="state.financeiroAgenda.status === 'Concluído'"
                                            :dark="$q.dark.isActive" outlined hide-bottom-space
                                            v-model="state.financeiroAgenda.dataVencimento" label="Dt. Vencimento"
                                            @blur="$v.financeiroAgenda.dataVencimento.$touch"
                                            :error="$v.financeiroAgenda.dataVencimento.$error"
                                            error-message="Campo obrigatório" :dense="dense" />
                                    </div>
                                    <div v-if="!inserir" class="col-md-2 col-sm-6 col-12">
                                        <CinputDate
                                            :readonly="state.financeiroAgenda.status === 'Concluído'"
                                            :dark="$q.dark.isActive" outlined hide-bottom-space
                                            v-model="state.financeiroAgenda.dataPagamento" label="Dt. Pagamento"
                                            :dense="dense" />
                                    </div>
                                    <div v-if="!inserir" class="col-md-3 col-sm-6 col-12">
                                            <q-input min="0" :readonly="state.financeiroAgenda.status === 'Concluído'" hide-bottom-space
                                                type="number" outlined v-model="state.financeiroAgenda.valorPago"
                                                label="Valor Pago" :dense="dense" prefix="R$"/>
                                        </div>
                                </div>
                            </div>
                        </q-tab-panel>
                        <q-tab-panel name="documento">
                            <div class="row q-col-gutter-sm">
                                <div class="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2">
                                    <q-file style="display: none" ref='filea' accept=".png, .jpg, .jpeg, .pdf"
                                        @update:model-value="onFileDoc" label="Documento" outlined v-model="novoDocumento"
                                        error-message="Clique ou arreste o arquivo no campo">
                                        <template v-slot:prepend>
                                            <q-icon class="cursor-pointer" name="attach_file" @click.stop />
                                        </template>
                                    </q-file>
                                    <q-card inline class="q-ma-sm">
                                        <q-card-section v-if="state.financeiroAgenda.status !== 'Concluído'">
                                            <q-btn icon="attach_file" class="q-mr-sm" @click="filea.$el.click()" outline
                                                color="primary" label="Buscar" />
                                            <q-btn class="q-mr-sm"
                                                v-if="(novoDoc) || (state.financeiroAgenda.documentoImagem)"
                                                @click="novoDoc = null; novoDocumento = null; state.financeiroAgenda.documentoImagem = '';"
                                                outline color="secondary" label="Ficar Sem" />
                                            <q-btn class="q-mr-sm"
                                                v-if="!inserir && (state.financeiroAgenda.documentoImagem != documentoPadrao || (novoDoc))"
                                                @click="novoDoc = null; novoDocumento = null; state.financeiroAgenda.documentoImagem = documentoPadrao"
                                                outline color="deep-purple" label="Restaurar" />
                                        </q-card-section>
                                        <q-card-section>
                                            
                                            <q-img
                                                v-if="!documentoIsPdf && (novoDoc || state.financeiroAgenda.documentoImagem)"
                                                :src="novoDoc ? novoDoc : ($geralService.configuracoes.BASE_S3 + state.financeiroAgenda.documentoImagem)"
                                                spinner-color="primary" spinner-size="82px"></q-img>
                                        </q-card-section>
                                    </q-card>
                                </div>
                            </div>
                        </q-tab-panel>
                        <q-tab-panel name="comprovante">
                            <div class="row q-col-gutter-sm">
                                <div class="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2">
                                    <q-file style="display: none" ref='fileb' accept=".png, .jpg, .jpeg, .pdf"
                                        @update:model-value="onFileComp" label="Documento" outlined v-model="novoComprovante"
                                        error-message="Clique ou arreste o arquivo no campo">
                                        <template v-slot:prepend>
                                            <q-icon class="cursor-pointer" name="attach_file" @click.stop />
                                        </template>
                                    </q-file>
                                    <q-card inline class="q-ma-sm">
                                        <q-card-section v-if="state.financeiroAgenda.status !== 'Concluído'">
                                            <q-btn icon="attach_file" class="q-mr-sm" @click="fileb.$el.click()" outline color="primary" label="Buscar" />
                                            <q-btn class="q-mr-sm"
                                                v-if="(novoComp) || (state.financeiroAgenda.comprovanteImagem)"
                                                @click="novoComp = null; novoComprovante = null; state.financeiroAgenda.comprovanteImagem = '';"
                                                outline color="secondary" label="Ficar Sem" />
                                            <q-btn class="q-mr-sm"
                                                v-if="!inserir && (state.financeiroAgenda.comprovanteImagem != comprovantePadrao || (novoComp))"
                                                @click="novoComp = null; novoComprovante = null; state.financeiroAgenda.comprovanteImagem = comprovantePadrao"
                                                outline color="deep-purple" label="Restaurar" />
                                        </q-card-section>
                                        <q-separator v-if="state.financeiroAgenda.status !== 'Concluído'" />
                                        <q-card-section>
                                            <q-img
                                                v-if="!comprovanteIsPdf && (novoComp || state.financeiroAgenda.comprovanteImagem)"
                                                :src="novoComp ? novoComp : ($geralService.configuracoes.BASE_S3 + state.financeiroAgenda.comprovanteImagem)"
                                                spinner-color="primary" spinner-size="82px"></q-img>
                                            <!-- <q-pdfviewer v-if="comprovanteIsPdf" v-model="show" :src="novoComp ? novoComp : ($configuracoes.BASE_S3 + state.financeiroAgenda.comprovanteImagem)" type="pdfjs" content-class="fit container" inner-content-class="fit container" /> -->
                                        </q-card-section>
                                    </q-card>
                                </div>
                            </div>
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
import ImageUpload2 from "@/components/ImageUpload2.vue";

const props = defineProps({
    id: { type: String, default: null },
    copia: null,
});


defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const state: any = reactive({
    financeiroAgenda: {
        _id: null,
        descricao: null,
        entidade: null,
        pessoaLancamento: null,
        tipo: 'D',
        sequencial: 0,
        planoDeConta: '',
        status: 'Aberto',
        documentoImagem: '',
        comprovanteImagem: '',
        dataEmissao: null,
    }
});

const geral = useGeral();
const dense = ref(false);
const $q = useQuasar();
const { $geralService } = useNuxtApp();
const tab = ref('dados');

// GO valida
const validations = {
    financeiroAgenda: {
        conta: {
            required
        },
        planoDeConta: {
            required
        },
        dataVencimento: {
            required
        },
        dataEmissao: {
            required
        },
        descricao: {
            required
        },
        valor: {
            required
        }
    }
};
const listaConta = ref<Array<any>>([]);
const listaPlanos = ref<Array<any>>([]);

const $v = useVuelidate(validations, state);
const filesTemp = ref<Array<any>>([]);

const inserir = ref(true);
const filea = ref<any>(null);
const fileb = ref<any>(null);

const novoComp = ref<any>(null);
const novoDoc = ref<any>(null);
const tipoImagem = ref<any>(null);
const documentoImagem = ref<any>(null);
const novoDocumento = ref<any>(null);
const novoComprovante = ref<any>(null);
const documentoPadrao = ref<any>(null);
const comprovantePadrao = ref<any>(null);

const documentoIsPdf = computed(() => {
    if (novoDocumento.value) {
        return novoDocumento.value.name.split('.')[1] === 'pdf';
    } else {
        return state.financeiroAgenda.documentoImagem ? state.financeiroAgenda.documentoImagem.split('.')[1] === 'pdf' : false;
    }
});
const comprovanteIsPdf = computed(() => {
    if (novoComprovante.value) {
        return novoComprovante.value.name.split('.')[1] === 'pdf';
    } else {
        return state.financeiroAgenda.comprovanteImagem ? state.financeiroAgenda.comprovanteImagem.split('.')[1] === 'pdf' : false;
    }
});

const getListaPlanoFiltro = computed(() => {
    const newArray = [];
    for (let index = 0; index < listaPlanos.value.length; index++) {
        const plano = listaPlanos.value[index];
        if (plano.tipo === state.financeiroAgenda.tipo) {
            newArray.push(plano);
        }
    }
    return newArray;
});

const getDescricaoPlanoConta = (obj: any) => { return obj ? obj.identificador + ' - ' + obj.descricao : '' };

const onFileDoc = (value: any) => {
    novoDoc.value = URL.createObjectURL(value);
};
const onFileComp = (value: any) => {
    novoComp.value = URL.createObjectURL(value);
};
const getImagem = (tipo: any) => {
    tipoImagem.value = tipo;
};

const tipoDocumento = () => {
    const extensoesImage = ['.gif', '.jpg', '.png,', 'jpeg'];
    const extensaoPDF = '.pdf';
    let extensaoImage = '';

    if (!documentoImagem.value) {
        const extensao = documentoImagem.value.substr(documentoImagem.value.length - 4).toLowerCase();

        for (let index = 0; index < extensoesImage.length; index++) {
            extensaoImage = extensoesImage[index];
            if (extensao === extensaoImage) {
                state.financeiroAgenda.documentoImagem = documentoImagem.value;
                documentoImagem.value = 'img';
            } else if (extensao === extensaoPDF) {
                state.financeiroAgenda.documentoImagem = documentoImagem.value;
                documentoImagem.value = 'pdf';
            } else {
                $q.notify({
                    position: 'top',
                    icon: 'warning',
                    color: 'warning',
                    message: 'Formato não suportado!!'
                });
            }
        }
    } else {
        console.log('documentoImagem Iniciando com valor');
    }
};

const setListaConta = async () => {
    try {
        const ret = await useCustomFetch(
            'financeiroConta/getPopulate',
            'post', {
            filtro: {
                entidade: geral.entidade._id,
                lixo: false
            }
        },
            undefined
        );
        if (ret.valido) {
            listaConta.value = ret.data;
        } else {
            listaConta.value = [];

        }
    } catch (error) {
        listaConta.value = [];
    }
};

const setListaPlano = async () => {
    try {
        const ret = await useCustomFetch(
            'financeiroPlanoConta/getPopulate',
            'post', {
            filtro: {
                entidade: geral.entidade._id,
                lixo: false
            },
            sort: {
                identificador: 1
            }
        },
            undefined
        );
        if (ret.valido) {
            listaPlanos.value = ret.data;
        } else {
            listaPlanos.value = [];
        }
    } catch (error) {
        listaPlanos.value = [];
    }
};

const inputPlanoConta = (value: any) => {
    state.financeiroAgenda.planoDeContaArvore = montaArvore(value);
};

const montaArvore = (value: any, arrArvore?: Array<any>): Array<any> => {
    const arvore: any = (arrArvore !== undefined ? arrArvore : []);
    arvore.push({ planoDeConta: value });
    for (let index = 0; index < listaPlanos.value.length; index++) {
        const plano = listaPlanos.value[index];
        if (plano._id === value) {
            if (plano.financeiroPlanoContaPai) {
                return montaArvore(plano.financeiroPlanoContaPai, arvore);
            }
            break;
        }
    }
    return arvore;
};

onBeforeMount(async () => {
    await setListaConta();
    await setListaPlano();
    if (props.id) {
        const ret: any = await useCustomFetch('financeiroAgenda/getPopulate', 'post', {
            filtro: {
                _id: props.id
            },
            populateObj: []
        }, undefined);
        if (ret.valido) {
            state.financeiroAgenda = ret.data[0];
            if (props.copia) {
                state.financeiroAgenda.descricao = state.financeiroAgenda.descricao + " (Cópia)";
                state.financeiroAgenda._id = undefined;
                state.financeiroAgenda.__v = undefined;
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
        state.financeiroAgenda = {
            _id: await $geralService.getId(),
            entidade: geral.entidade._id,
            pessoaLancamento: geral.pessoa._id,
            tipo: 'D',
            sequencial: 0,
            planoDeConta: '',
            status: 'Aberto',
            documentoImagem: '',
            comprovanteImagem: '',
            dataEmissao: new Date().toISOString(),
        };
        inserir.value = true;
    }
});

const imageData = ref<any>('');
const imageUrl = ref('');


const getUrlImagem = computed(() => {
    return $geralService.getUrlImagem(imageData.value, state.financeiroAgenda, 'logo', imageUrl.value);
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

const beforeSave = async (isPagar: boolean) => {
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Validando dados... Aguarde!',
        messageColor: 'white'
    });
    // $v.value.financeiroAgenda.vinculos.$touch();
    $v.value.financeiroAgenda.$touch();

    if ($v.value.financeiroAgenda.$error) {

        $q.loading.hide();
        $q.notify({
            color: 'warning',
            position: 'top',
            icon: 'check',
            message: 'Preeencha todos os campos obrigatórios para salvar!'
        });
        return;

    }

    if (state.financeiroAgenda.status !== 'Aberto') {
        state.financeiroAgenda.pessoaEncerramento = geral.pessoa._id;
        state.financeiroAgenda.dataEncerramento = new Date();
    }

    delete state.financeiroAgenda.__v;


    const newFinanceiroAgenda = JSON.parse(JSON.stringify(state.financeiroAgenda));

    filesTemp.value = [];

    const retUD = await uploadDocumento(newFinanceiroAgenda);
    if (retUD) {
        // Em caso de alteração que exista um documento antigo que foi alterado ou forçado a ficar vazio, o arquivo é excluído.
        if (!inserir.value && documentoPadrao.value && newFinanceiroAgenda.documentoImagem !== documentoPadrao.value) {
            $geralService.deleteImagem(documentoPadrao.value, undefined);
        }

        const retUC = await uploadComprovante(newFinanceiroAgenda);

        if (retUC) {
            // Em caso de alteração que exista um comprovante antigo que foi alterado ou forçado a ficar vazio, o arquivo é excluído.
            if (!inserir.value && comprovantePadrao.value && newFinanceiroAgenda.comprovanteImagem !== comprovantePadrao.value) {
                $geralService.deleteImagem(comprovantePadrao.value, undefined);
            }
            if (isPagar) {
                newFinanceiroAgenda.dataEncerramento = new Date().toISOString();
                if (await executarPagamento(newFinanceiroAgenda)) {
                    save(newFinanceiroAgenda, null);
                }
            } else {
                save(newFinanceiroAgenda, null);
            }
        }
    }

};
const getPlanoDeContaIdentificacao = () => {
    for (let index = 0; index < listaPlanos.value.length; index++) {
        const element = listaPlanos.value[index];
        if (element._id === state.financeiroAgenda.planoDeConta) {
            return element.identificador;
        }
    }
    return undefined;
};

const executarPagamento = async (newFinanceiroAgenda: any) => {
    // eslint-disable-next-line
    let financeiroMovimentacao = {
        _id: await $geralService.getId(),
        entidade: geral.entidade._id,
        pessoa: geral.pessoa._id,
        planoDeContaIdentificacao: getPlanoDeContaIdentificacao(),
        tipo: state.financeiroAgenda.tipo,
        sequencial: 0,
        planoDeConta: state.financeiroAgenda.planoDeConta,
        planoDeContaArvore: state.financeiroAgenda.planoDeContaArvore,
        conta: state.financeiroAgenda.conta,
        saldoAnterior: 0,
        saldoAtual: 0,
        valor: state.financeiroAgenda.valor,
        descricao: state.financeiroAgenda.descricao,
        documentoImagem: state.financeiroAgenda.documentoImagem,
        comprovanteImagem: state.financeiroAgenda.comprovanteImagem
    };
    const retUltimoMovimento = await $geralService.getUltimaMovimentacao(financeiroMovimentacao.conta);
    if (retUltimoMovimento.valido) {
        if (retUltimoMovimento.data.length > 0) {
            financeiroMovimentacao.saldoAnterior = retUltimoMovimento.data[0].saldoAtual;
        } else {
            financeiroMovimentacao.saldoAnterior = 0;
        }
        if (financeiroMovimentacao.tipo === 'D') {
            financeiroMovimentacao.saldoAtual = financeiroMovimentacao.saldoAnterior - financeiroMovimentacao.valor;
        } else {
            financeiroMovimentacao.saldoAtual = financeiroMovimentacao.saldoAnterior + parseFloat(financeiroMovimentacao.valor);
        }
        const ret = await useCustomFetch('financeiroMovimentacao', 'post', financeiroMovimentacao, undefined);
        if (ret.valido) {
            newFinanceiroAgenda.financeiroMovimentacao = financeiroMovimentacao._id;
            newFinanceiroAgenda.status = 'Concluído';
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

const uploadDocumento = async (newFinanceiroAgenda: any) => {
    if (novoDocumento.value) {
        const caminho = geral.entidade._id + '/FinanceiroAgenda/' + newFinanceiroAgenda._id + '/imagens/';
        const nome = await novoDocumento.value.name;
        const tipo = await nome.split('.')[1];
        const randonName = $geralService.getRandomName() + '.' + tipo;
        if (await $geralService.uploadFileAsync(
            novoDocumento.value,
            caminho,
            randonName,
            undefined
        )) {
            newFinanceiroAgenda.documentoImagem = caminho + randonName;
            filesTemp.value.push(randonName);
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
};

const cancelarFinanceiroAgenda = () => {
    if (geral.funcoesAcessos.financeiroAgendaDeletar) {
        $q.dialog({
            title: 'Confirmação',
            message: 'Deseja realmente excluir a agenda',
            focus: 'cancel',
            ok: {
                color: 'primary',
                label: 'sim'
            },
            cancel: {
                color: 'negative',
                label: 'Não'
            }
        }).onOk(async () => {
            $q.loading.show({
                spinner: QSpinnerOval
            });
            try {
                // Exclui as imagens somente de aberto pois se concluído o financeiroMovimentacao está vinculado e utiliza as imagens.
                if (state.financeiroAgenda.status === 'Aberto') {
                    // Apagar imagens
                    if (!inserir.value && documentoPadrao.value) {
                        $geralService.deleteImagem(documentoPadrao.value, undefined);
                    }

                    // Apagar imagens
                    if (!inserir.value && comprovantePadrao.value) {
                        $geralService.deleteImagem(comprovantePadrao.value, undefined);
                    }
                }

                const ret = await useCustomFetch('financeiroAgenda/delete', 'post', {
                    _id: state.financeiroAgenda._id
                }, undefined);
                if (ret.valido) {
                    $q.notify({
                        color: 'green',
                        position: 'top',
                        icon: 'mdi-check-all',
                        message: 'Registro excluído com sucesso!'
                    });
                    onDialogOK(null);
                }
            } catch (error) { }
            $q.loading.hide();
        });
    }
};

const uploadComprovante = async (newFinanceiroAgenda: any) => {
    if (novoComprovante.value) {
        const caminho = geral.entidade._id + '/FinanceiroAgenda/' + newFinanceiroAgenda._id + '/imagens/';
        const tipo = novoComprovante.value.name.split('.')[1];
        const randonName = $geralService.getRandomName() + '.' + tipo;
        if (await $geralService.uploadFileAsync(
            novoComprovante,
            caminho,
            randonName,
            undefined
        )) {
            newFinanceiroAgenda.comprovanteImagem = caminho + randonName;
            filesTemp.value.push(randonName);
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
};

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
// TO save
const save = async (newDestaque: any, nomeTempFile: any) => {
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Salvando registro...Aguarde!',
        messageColor: 'white'
    });
    let url = 'financeiroAgenda';
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

