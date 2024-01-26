<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">

                    <q-avatar v-if="state.filiacaoEntidade.entidadeFilha" rounded size="40px"><q-img
                            :src="getUrlImagem(state.filiacaoEntidade.entidadeFilha.logo, 128)"></q-img></q-avatar>
                    <q-icon class="mx-2" name="join_left" size="30px" />
                    <q-avatar v-if="state.filiacaoEntidade.entidade" rounded size="40px"><q-img
                            :src="getUrlImagem(state.filiacaoEntidade.entidade.logo, 128)"></q-img></q-avatar>
                    <div ml-3>
                        <div text-xl>
                            Filiação {{ state.filiacaoEntidade.entidadeFilha.sigla }}
                        </div>
                        <div>
                            <q-badge :color="getCorStatus">{{ state.filiacaoEntidade.status }}</q-badge>
                        </div>
                    </div>
                    <q-space />
                    <!-- GO btnSave -->
                    <!-- <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave"
                        :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn> -->
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Sair' : undefined" color="red" icon="undo" />
                </q-toolbar>


                <div :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll px-3">
                    <div class="col-12 flex flex-center">
                        <div v-if="state.filiacaoEntidade"
                            style="height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 52px); max-width: 1366px; width: 100%">
                            <div class="full-width">
                                <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify"
                                    narrow-indicator>
                                    <q-tab default name="filiacao" icon="join_left" label="Filiação">

                                    </q-tab>
                                    <q-tab name="historico" icon="history" label="Histórico" />
                                </q-tabs>
                                <q-separator />
                                <q-tab-panels v-model="tab" animated>
                                    <q-tab-panel class="pl-0! pt-0!" name="filiacao">
                                        <q-stepper class="q-pt-sm" flat v-model="etapa" vertical color="primary" header-nav
                                            animated>

                                            <q-step :readonly="state.filiacaoEntidade.etapa < 2" :name="2"
                                                :title="'Documentos Obrigatórios'" :done="etapa > 2"
                                                :error="documentoPendente" :caption="documentoPendente ? 'Pendente' : 'OK'"
                                                icon="cloud_upload" active-icon="cloud_upload">
                                                <div text-xl mb-2 v-if="state.filiacaoEntidade.validacoesDocumentos.length === 0"> {{ (state.filiacaoEntidade.entidade.tratamentoMasculino ? 'O ' : 'A ') + state.filiacaoEntidade.entidade.sigla }}  não exige nenhum documento para a filiação.</div>
                                                <div v-for="(item, index) in state.filiacaoEntidade.validacoesDocumentos"
                                                    :key="index" class="row q-col-gutter-sm q-mb-sm">
                                                    <div class="col-12">

                                                        <q-field :error="!item.caminho"
                                                            error-message="Documento Obrigatório" outlined
                                                            :label="`${item.descricao} (${item.instrucao})`" stack-label>

                                                            <template v-slot:prepend>
                                                                <q-avatar v-if="item.validado" size="35px" color="positive"
                                                                    text-color="white" icon="check" />
                                                                <q-icon name="attach_file" />
                                                            </template>
                                                            <template v-slot:append>
                                                                <!-- <q-btn v-if="item.caminho" icon="visibility"
                                                                    class="grid content-evenly btn-scale"
                                                                    @click="irPara(item.caminho)" round :href="item.caminho"
                                                                    target="_blank">
                                                                    <q-tooltip>Visualizar</q-tooltip></q-btn> -->
                                                                <q-btn v-if="item.caminho" icon="visibility" round
                                                                    class="grid content-evenly btn-scale"
                                                                    @click="visualizarPdf($geralService.configuracoes.BASE_S3 + item.caminho, item)" />
                                                                <q-btn color="primary" v-if="item.visualizado"
                                                                    :icon="item.validado ? 'unpublished' : 'check'" round
                                                                    class="grid content-evenly btn-scale ml-2"
                                                                    @click="validarDocumento(item)">
                                                                    <q-tooltip>{{ item.validado ? 'Desmarcar como válido!' :
                                                                        'Marcar como válido!' }}</q-tooltip>
                                                                </q-btn>

                                                            </template>
                                                            <template v-slot:control>
                                                                <span v-if="item.caminho">{{
                                                                    getNomeKey(item.caminho) }}</span>
                                                            </template>
                                                        </q-field>
                                                    </div>


                                                </div>
                                                <q-stepper-navigation p-0>
                                                    <q-btn :disabled="documentoPendente" class="btn-scale"
                                                        @click="continuaDocumentosObrigatorios" color="primary"
                                                        label="Continuar" />
                                                </q-stepper-navigation>
                                            </q-step>
                                            <q-step :readonly="state.filiacaoEntidade.etapa < 3" :name="3"
                                                title="Taxas Obrigatórias"
                                                 :caption="(state.filiacaoEntidade.pagamento || state.filiacaoEntidade.taxas.length === 0) ? 'OK' : 'Pendente'"
                                                    :error="!state.filiacaoEntidade.pagamento && state.filiacaoEntidade.taxas.length > 0" active-icon="attach_money"
                                                icon="attach_money" :done="etapa > 2">
                                                <div text-xl mb-2 v-if="state.filiacaoEntidade.taxas.length === 0"> {{ (state.filiacaoEntidade.entidade.tratamentoMasculino ? 'O ' : 'A ') + state.filiacaoEntidade.entidade.sigla }} não cobra nenhuma taxa para a filiação.</div>
                                                <q-field hide-bottom-space
                                                    v-for="(item, index) in state.filiacaoEntidade.taxas" :key="index"
                                                    outlined :label="item.descricao" stack-label>
                                                    <template v-slot:control>
                                                        {{ 'R$ ' + $geralService.numeroParaMoeda(item.valorPadrao) }}
                                                    </template>

                                                </q-field>

                                                <q-card v-if="state.filiacaoEntidade.taxas.length>0" class="mt-4 rounded-xl">


                                                    <div v-if="state.filiacaoEntidade.pagamento">

                                                        <q-item>
                                                            <q-item-section top avatar>
                                                                <q-avatar color="positive" text-color="white"
                                                                    icon="check" />
                                                                <span class="text-positive ml-1 text-bold">Pago</span>
                                                            </q-item-section>
                                                            <q-item-section>
                                                                <q-item-label
                                                                    class="text-lg text-positive text-weight-bold">Forma de
                                                                    Pagamento: {{
                                                                        state.filiacaoEntidade.pagamento.tipo }}</q-item-label>
                                                                <q-item-label caption class="text-sm">Valor: R$ {{
                                                                    $geralService.numeroParaMoeda(getTotalTaxas())
                                                                }}</q-item-label>
                                                                <q-item-label caption class="text-sm">Data: {{
                                                                    $geralService.getDataFormatada(state.filiacaoEntidade.pagamento.created_at,
                                                                        'DD/MM/YYYY HH:mm:ss') }}</q-item-label>
                                                            </q-item-section>
                                                        </q-item>
                                                    </div>
                                                    <div v-if="!state.filiacaoEntidade.pagamento">
                                                        <q-item>
                                                            <q-item-section>
                                                                <q-item-label class="text-lg text-weight-bold">Aguardando o
                                                                    Pagamento</q-item-label>
                                                                <q-item-label caption class="text-sm">Total R$ {{
                                                                    $geralService.numeroParaMoeda(getTotalTaxas())
                                                                }}</q-item-label>
                                                            </q-item-section>
                                                        </q-item>
                                                    </div>
                                                </q-card>

                                                <q-stepper-navigation>
                                                    <q-btn class="btn-scale" :disabled="!state.filiacaoEntidade.pagamento && state.filiacaoEntidade.taxas.length > 0"
                                                        @click="continuar" color="primary" label="Continuar" />
                                                    <q-btn flat @click="etapa = 2" color="primary" label="Voltar"
                                                        class="q-ml-sm btn-scale" />
                                                </q-stepper-navigation>
                                            </q-step>
                                            <q-step :readonly="state.filiacaoEntidade.etapa < 4" :name="4"
                                                title="Validação da Entidade" :caption="validacaoDocumentos ? 'OK' : 'Pendente'"
                                                active-icon="checklist" icon="checklist" :done="etapa > 3">
                                                <q-item>
                                                    <q-item-section top avatar>
                                                        <q-avatar :color="getCorStatus" la text-color="white">{{
                                                            $geralService.getIniciais(state.filiacaoEntidade.status)
                                                        }}</q-avatar>
                                                    </q-item-section>
                                                    <q-item-section>
                                                        <q-item-label>{{ state.filiacaoEntidade.status }}</q-item-label>
                                                        <q-item-label caption>{{ getMensagemStatus }}</q-item-label>
                                                    </q-item-section>
                                                </q-item>

                                                <q-stepper-navigation>
                                                    <q-btn mr-3 v-if="state.filiacaoEntidade.status == 'Em Análise'"
                                                        color="negative" label="Recusar Filiação" @click="recusarFiliacao"
                                                        class="q-ml-sm" />
                                                    <q-btn
                                                        v-if="state.filiacaoEntidade.status == 'Em Análise' && validacaoDocumentos"
                                                        class="btn-scale" color="primary" @click="aceitarFiliacao"
                                                        label="Aceitar / Ativar Filiação" />
                                                    <q-btn v-if="state.filiacaoEntidade.status == 'Ativa'" class="btn-scale"
                                                        color="red" @click="desativarFiliacao" label="Desativar Filiação" />
                                                    <q-btn v-if="state.filiacaoEntidade.status == 'Desativada'"
                                                        class="btn-scale" color="primary" @click="ativarFiliacao"
                                                        label="Reativar Filiação" />
                                                    <q-btn flat @click="etapa = 3" color="primary" label="Voltar"
                                                        class="q-ml-sm btn-scale" />
                                                </q-stepper-navigation>
                                            </q-step>
                                        </q-stepper>
                                    </q-tab-panel>
                                    <q-tab-panel name="historico">

                                       <q-timeline layout="loose"  color="secondary">
                                                    <q-timeline-entry
                                                    v-for="(item, index) in state.filiacaoEntidade.historico"
                                                                    :key="index"
                        :title="item.status"
                        :subtitle="$geralService.getDataFormatada(item.created_at, 'DD/MM/YYYY HH:mm:ss') + ' - ' + (item.origemFiliadora ? state.filiacaoEntidade.entidade.sigla : state.filiacaoEntidade.entidadeFilha.sigla)"
                        :side="(item.origemFiliadora ? 'left' : 'right')"
                        :color="getCorStatusFuncao(item.status)"
                      >
                        <div>
                          {{ item.descricao }}
                        </div>
                      </q-timeline-entry>
                      </q-timeline>
                                    </q-tab-panel>

                                </q-tab-panels>

                            </div>
                        </div>
                    </div>
                </div>

            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts" setup>
import QrcodeVue, { Level, RenderAs } from 'qrcode.vue'
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, requiredIf } from "@vuelidate/validators";
import SeletorEntidade from "../SeletorEntidade.vue";
import GerenciadorArquivoModal from "../GerenciadorArquivoModal.vue";
import VisualizarPdfModal from "../VisualizarPdfModal.vue";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';
import { reactive } from 'vue';
import { time } from "console";

const { $geralService, $constantes } = useNuxtApp()

const geral = useGeral();


const props = defineProps({
    id: { type: String, default: null },
    copia: null,
    esporteId: null
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const entidadeFilha = {
    nomeRazao: geral.entidade.nomeRazao,
    sigla: geral.entidade.sigla,
    logo: geral.entidade.logo,
    _id: geral.entidade._id,
    tipo: geral.entidade.tipo
};
const arquivo = ref<any>(null)

const qrcode = ref('qrcode')
const level = ref<Level>('M')
const renderAs = ref<RenderAs>('svg')

const state: any = reactive({
    filiacaoEntidade: {
        entidade: undefined,
        entidadeFilha: entidadeFilha,
        pessoa: geral.pessoa,
        etapa: 1,
        taxas: [],
        historico: [],
        validacoesDocumentos: [],
        pagamento: undefined,
        enderecoObrigatorio: false,
        ataContratoObrigatorio: false
    },
    pagamento: {
        tipoPessoa: 'Física',
        sacado: '',
        cpfCnpj: '',
        email: '',
        cartao: $geralService.getTesteCartao(),
    }
});


const $q = useQuasar();

const modoSandBox = true;


const documentoPendente = ref(true);
const indexDocumento = ref(-1);
const docsref0 = ref(null);
const docsref1 = ref(null);
const docsref2 = ref(null);
const docsref3 = ref(null);
const docsref4 = ref(null);
const docsref5 = ref(null);
const docsref6 = ref(null);
const arraydocs = ref<any>([docsref0, docsref1, docsref2, docsref3, docsref4, docsref5, docsref6]);

const gravouFiliacao = ref(false);
const etapa = ref(1);
const populateObj = JSON.stringify(['filiacoesEntidades.taxas']);
const select = JSON.stringify({
    nomeFantasia: 1,
    nomeRazao: 1,
    logo: 1,
    tratamentoMasculino: 1,
    filiacoesEntidades: 1,
    sigla: 1
});
const listaValidacoes = ref<any>([]);
const listaEntidades = ref<any>([]);
const tab = ref('filiacao');


const getCorStatus = computed(() => {
    return getCorStatusFuncao(state.filiacaoEntidade.status);
});

const getCorStatusFuncao = (status: string) => {
    switch (status) {
        case 'Ativa':
            return 'positive';
        case 'Em Análise':
            return 'warning';
        case 'Aguardando Pagamento':
            return 'teal';
        case 'Iniciada':
            return 'primary';
        case 'Recusada':
            return 'negative';
        case 'Cancelada':
            return 'grey';
        case 'Desativada':
            return 'accent';
        default:
            return 'red';
    }
};

const getMensagemStatus = computed(() => {
    // console.log(state.filiacaoEntidade.status);
    switch (state.filiacaoEntidade.status) {
        case 'Ativa':
            return 'Filiação ativa, todas as etapas foram realizadas com sucesso!';
        case 'Em Análise':
            return 'Aguarde o retorno da entidade.';
        case 'Aguardando Pagamento':
            return 'Aguarde o pagamento para continuar o processo de filiação.';
        case 'Iniciada':
            return 'Processo de filiação iniciado.';
        case 'Recusada':
            return 'Processo de filiação recusado, verifique o histórico para verificar os motivos.';
        case 'Cancelada':
            return 'Processo de filiação cancelado, verifique o histórico para verificar os motivos.';
        case 'Desativada':
            return 'Filiação desativada, verifique o histórico para verificar os motivos.';
        default:
            return '';
    }
});


const validacaoDocumentos = computed(() => {
    let retorno: boolean = true;

    for (let index = 0; index < state.filiacaoEntidade.validacoesDocumentos.length; index++) {
        const element = state.filiacaoEntidade.validacoesDocumentos[index];
        if (!element.validado) {
            retorno = false;
            break;
        }
    }
    return retorno;

});



const tabPagamento = ref('pix');

// GO valida
const validations = {
    filiacaoEntidade: {
    },
    pagamento: {
        sacado: {
            requiredIfRef: requiredIf(tabPagamento.value === "pix"),
        },
        email: {
            requiredIfRef: requiredIf(tabPagamento.value === "pix"),
        },
        cpfCnpj: {
            requiredIfRef: requiredIf(tabPagamento.value === "pix"),
        },

    }
};

const $v = useVuelidate(validations, state);
const inserir = ref(true);

onBeforeMount(async () => {
    // console.log(props.id);
    if (props.id) {
        const ret: any = await useCustomFetch('filiacaoEntidade/getPopulate', 'post', {
            filtro: {
                _id: props.id
            },
            populateObj: ['pagamento', {
                path: 'entidadeFilha',
                select: { nomeRazao: 1, logo: 1, sigla: 1, nomeFantasia: 1, tipo: 1, tratamentoMasculino: 1 }
            },
                {
                    path: 'entidade',
                    select: { nomeRazao: 1, logo: 1, sigla: 1, nomeFantasia: 1, tipo: 1, tratamentoMasculino: 1 }
                }]
        }, undefined);
        // console.log(ret);
        if (ret.valido) {
            state.filiacaoEntidade = ret.data[0];
            // console.log(ret.data);
            state.filiacaoEntidade = JSON.parse(JSON.stringify(state.filiacaoEntidade));
            inserir.value = false;
            await verificaDocumentoPendente();
        } else {
            setTimeout(async () => {
                await cancel();
                // navigateTo('/login');
            }, 1);
        }
    } else {
        const id = await $geralService.getId();
        // console.log(id);
        if (id) {
            inserir.value = true;
            state.filiacaoEntidade._id = id;
        } else {
            await cancel();
        }
    }
    etapa.value = 2;
});

const validaDataValidade = (value: any) => {
    // console.log(value);
    state.pagamento.cartao.dataValida =
        $geralService.validaDataValidade(
            state.pagamento.cartao.ExpirationDate
        );
}

const validaCartao = (value: any) => {
    // console.log(value);
    setTimeout(() => {
        $geralService.validaCartao(state.pagamento, modoSandBox);
    }, 100);

}

const irPara = (caminho: string) => {
    navigateTo($geralService.configuracoes.BASE_S3 + caminho, {
        open: {
            target: '_blank',
        }
    })
};


const validaExisteFiliacaoEntidade = async () => {
    const ret: any = await useCustomFetch('filiacaoEntidade/getPopulate', 'post', {
        filtro: {
            entidadeFilha: state.filiacaoEntidade.entidadeFilha._id,
            entidade: state.filiacaoEntidade.entidade._id,
            lixo: false
        },
        select: { _id: 1 }
    }, undefined);
    if (ret.valido && ret.data.length) {
        // Existe outra filiação 
        return false;
    }
    // Não existe outra filiação
    return true;
}

const cancel = async () => {

    if (gravouFiliacao.value) {
        onDialogOK(true);

    } else {
        onDialogCancel();
    }
    return;
};

const getUrlImagemThumb = (caminho: any, tamanho: any) => {
    return $geralService.getUrlS3Thumb(caminho, {
        height: (tamanho !== undefined ? tamanho : 128)
    });
};

const confirmSelecaoEntidade = (entidade: any) => {
    state.filiacaoEntidade.entidade = entidade;
};

const confirmarPagamento = async () => {
    let data: any = { pagamento: state.pagamento };

    data.pagamento.tipo = tabPagamento.value === 'pix' ? 'PIX' : 'Cartão';
    data.pagamento.entidadeResponsavel = state.filiacaoEntidade.entidade._id;
    data.pagamento.entidade = state.filiacaoEntidade.entidadeFilha._id;
    data.pagamento.pessoa = null;
    data.pagamento.tipoPessoa = 'Jurídica';
    data.pagamento.tipoIdentificador = 'Filiação';
    data.pagamento.identificador = state.filiacaoEntidade._id;
    data.pagamento.valor = getTotalTaxas();
    data.pagamento.status = 'Recebido'
    data.totalLiquido = getTotalTaxas();
    data.production = false;
    data.SoftDescriptor = "Filiacao " + state.filiacaoEntidade.entidade.sigla;
    data.entidadeResponsavel = state.filiacaoEntidade.entidade._id;
    data._id = state.filiacaoEntidade._id;


    const url = tabPagamento.value === 'pix' ? 'pagamentoPix' : 'pagamentoCartao';

    const ret: any = await useCustomFetch(url, 'POST', data, undefined);

    if (ret.valido) {
        state.filiacaoEntidade.pagamento = ret.data._id;
        state.filiacaoEntidade.status = 'Em Análise';
        await gravaFiliacao('Confimado o pagamento das taxas em ' + ret.data.tipo + ' no valor de R$ ' + $geralService.numeroParaMoeda(getTotalTaxas()) + ' e alterado o Status para (Em Análise).');
        state.filiacaoEntidade.pagamento = ret.data;
        $q.notify({
            color: 'green',
            position: 'top',
            icon: 'check',
            message: 'Pagamento realizado com sucesso!'
        });
    } else {
        // console.log(ret);
        $q.notify({
            color: 'red',
            position: 'top',
            icon: 'check',
            message: 'Falha ao realizar pagamento!'
        });
    }
}

const beforeSave = async () => {
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Salvando registro...Aguarde!',
        messageColor: 'white'
    });
    // $v.value.vinculos.$touch();
    $v.value.filiacaoEntidade.$touch();

    if ($v.value.filiacaoEntidade.$error) {

        $q.loading.hide();
        $q.notify({
            color: 'warning',
            position: 'top',
            icon: 'check',
            message: 'Preeencha todos os campos obrigatórios para salvar!'
        });
        return;

    }

    const newFiliacaoEntidade = JSON.parse(JSON.stringify(state.filiacaoEntidade));


    let url = 'filiacaoEntidade';
    let tipo = 'post';
    if (!inserir.value) {
        url += ('/' + props.id);
        tipo = 'put';
    }

    const ret: any = await useCustomFetch(url, tipo, newFiliacaoEntidade, undefined);


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
        $q.notify({
            color: 'error',
            position: 'top',
            icon: 'check',
            message: 'Falha ao salvar registro!'
        });
    }
    $q.loading.hide();
};

const getTotalTaxas = () => {
    let total = 0;
    state.filiacaoEntidade.taxas.forEach((element: any) => {
        total += element.valorPadrao;
    });
    return total;
};

const verificaDocumentoPendente = async () => {
    // console.log('validando');
    documentoPendente.value = false;
    for (let index = 0; index < state.filiacaoEntidade.validacoesDocumentos.length; index++) {
        const element = state.filiacaoEntidade.validacoesDocumentos[index];
        if (!element.caminho && !element.arquivo) {
            documentoPendente.value = true;
            break;
        }
    }
};

const confirmGerenciadorArquivo = (arquivo: any) => {
    state.filiacaoEntidade.validacoesDocumentos[indexDocumento.value].caminho = arquivo;
    verificaDocumentoPendente();
};

const selecionarArquivo = (value: any) => {
    setTimeout(() => { verificaDocumentoPendente(); }, 400);
}

const selecionarArquivos = (index: number) => {
    indexDocumento.value = index;

    $q.dialog({
        component: GerenciadorArquivoModal,
        persistent: true,
        componentProps: {
            extensao: '.pdf',
            travarCaminhoUpload: true,
            travarDeletar: false,
            caminhoInicial: `entidades/${entidadeFilha._id}/filiacaoEntidade/${state.filiacaoEntidade._id}/documentosValidados`
        },
    })
        .onOk(async (data) => {
            // console.log(data);
            confirmGerenciadorArquivo(data);
        })
        .onCancel(() => { });

    // TODO showGerenciadorArquivo.value = true;
};

const validarDocumento = async (item: any) => {
    if (item.validado) {
        $q.dialog({

            title: 'Confirmação',
            message: `Desmarcar a validação do documento pela entidade ${state.filiacaoEntidade.entidade.sigla}?`,
            cancel: true,
            persistent: true
        }).onOk(() => {
            item.validado = false;
            gravaFiliacao(`Documento (${item.descricao}) desmarcado como válido pela entidade ${state.filiacaoEntidade.entidade.sigla}.`);
        });
    } else {
        $q.dialog({
            title: 'Confirmação',
            message: `Marcar como válido pela entidade ${state.filiacaoEntidade.entidade.sigla}?`,
            cancel: true,
            persistent: true
        }).onOk(() => {
            item.validado = true;
            gravaFiliacao(`Documento (${item.descricao}) marcado como válido pela entidade ${state.filiacaoEntidade.entidade.sigla}.`);
        });
    }
}

const visualizarPdf = async (caminho: any, item?: any) => {
    if (item && !item.visualizado) {
        item.visualizado = true;
        await gravaFiliacao(`Documento (${item.descricao}) visualizado pela primeira vez pela entidade ${state.filiacaoEntidade.entidade.sigla}.`);
    }

    $q.dialog({
        component: VisualizarPdfModal,
        persistent: true,
        componentProps: {
            caminho: caminho,
        },
    })
        .onOk(async (data) => {
        })
        .onCancel(() => { });

};
const visualizarPdf2 = (arquivo: any) => {

    const blobData = new Blob([arquivo], { type: arquivo.type });
    const blobUrl = URL.createObjectURL(blobData);
    // window.open(blobUrl, '_blank');
    visualizarPdf(blobUrl);
};
const onRejected = (rejectedEntries: any) => {
    $q.notify({
        position: 'top',
        type: 'negative',
        message: 'Para este documento, somente o formato (.PDF) é aceito!'
    });
};
const checkFileTypeAtaContrato = (files: any) => {
    // console.log(files);
    return files.filter((file: any) => file.type === 'application/pdf');
};
const atualizaConfiguracoes = (empresa: any) => {
    // Verifica todas as configurações de filiação // Se existir mais de uma configuracao encontrada o sistema reconhecerá somente o primeiro
    // console.log(empresa);
    for (let index = 0; index < empresa.filiacoesEntidades.length; index++) {
        const element = empresa.filiacoesEntidades[index];
        // console.log(element);
        // Se existe filtro de tipo de entidades
        if (element.tipoEntidadesAceitas && element.tipoEntidadesAceitas.length) {
            for (let index2 = 0; index2 < element.tipoEntidadesAceitas.length; index2++) {
                const element2 = element.tipoEntidadesAceitas[index2];
                // Se a entidadeFilha fizer parte do filtro;
                if (element2 === state.filiacaoEntidade.entidadeFilha.tipo) {
                    // console.log('Fez parte do filtro');
                    // Adiciona as taxas caso exista;
                    state.filiacaoEntidade.taxas = element.taxas;
                    state.filiacaoEntidade.validacoesDocumentos = element.documentosObrigatorios;
                    atualizaTotalTaxas();
                    break;
                }
            }
        } else {
            // console.log('Pegou generico');
            state.filiacaoEntidade.taxas = element.taxas;
            state.filiacaoEntidade.validacoesDocumentos = element.documentosObrigatorios;
            atualizaTotalTaxas();
            break;
        }
    }
}
const atualizaTotalTaxas = () => {
    state.filiacaoEntidade.valorTaxas = 0;
    state.filiacaoEntidade.taxas.forEach((element: any) => {
        state.filiacaoEntidade.valorTaxas += element.valorPadrao;
    });
};

const iniciaListaValidacoes = async () => {
    listaValidacoes.value = [];

    const ret1: any = await useCustomFetch('entidade/getPopulate', 'post', {
        filtro: {
            lixo: false,
            entidade: geral.entidade._id
        },
        select: ['nomeRazao', 'sigla', 'logo', 'filiacaoEntidade.taxaFiliacao', 'filiacaoEntidade.taxaAnuidade']
    }, undefined);


    if (ret1.valido) {
        listaValidacoes.value = ret1.data;
    }
};
const selecionarEntidade = () => {
    $q.dialog({
        component: SeletorEntidade,
        persistent: true,
        componentProps: {
            listaEntidade: listaEntidades.value
        },
    })
        .onOk(async (data) => {
            confirmSelecao(data);
        })
        .onCancel(() => { });
    // TODO this.showSeletorEntidade = true;
};
const confirmSelecao = (entidade: any) => {
    if (state.filiacaoEntidade.entidadeFilha._id === entidade._id) {
        $q.notify({
            position: 'top',
            icon: 'warning',
            color: 'warning',
            message: 'Selecione outra entidade!',
            timeout: 2000
        });
    } else {
        state.filiacaoEntidade.entidade = entidade;
        // console.log('teste');
        // console.log(entidade);
        atualizaConfiguracoes(entidade);
    }
};
const getUrlImagem = (caminho: any, tamanho: number) => {
    return $geralService.getUrlS3Thumb(caminho, {
        height: tamanho !== undefined ? tamanho : 128
    });
};

const gravaFiliacao = async (descricaoHistorico: string) => {
    let retorno = false;
    try {
        let url = 'filiacaoEntidade';
        let tipo = 'post';
        $q.loading.show({
            spinner: QSpinnerOval,
            spinnerColor: 'white',
            spinnerSize: 60,
            message: 'Salvando Filiação...Aguarde!',
            messageColor: 'white'
        });
        state.filiacaoEntidade.historico.push({
            created_at: new Date().toISOString(),
            descricao: descricaoHistorico,
            status: state.filiacaoEntidade.status,
            origemFiliadora: true,
            pessoa: geral.pessoa._id
        });
        const newfiliacao = JSON.parse(JSON.stringify(state.filiacaoEntidade));
        newfiliacao.entidade = newfiliacao.entidade._id;
        newfiliacao.entidadeFilha = newfiliacao.entidadeFilha._id;
        if (inserir.value) {
            if (!await validaExisteFiliacaoEntidade()) {
                $q.loading.hide();
                $q.notify({
                    position: "top",
                    message: "Não é possível continuar!",
                    type: "negative",
                    caption: "Já existe um processo de filiação para esta entidade!",
                    timeout: 7000
                });
                return false;
            }
        } else {
            url += ('/' + newfiliacao._id);
            tipo = 'put';
        }
        const ret: any = await useCustomFetch(url, tipo, newfiliacao, undefined);
        if (ret.valido) {
            retorno = true;
            gravouFiliacao.value = true;
            // console.log('gravou filiação');
        } else {
            $q.notify({
                position: "top",
                type: "negative",
                message: "Não é possível continuar, Falha ao salvar filiação!"
            });
        }
    } catch (error) {
        // console.log(error);
    }
    $q.loading.hide();
    return retorno;
}

const continuaSelecaoEntidade = async () => {
    // console.log(state.filiacaoEntidade);
    let continua = true
    if (inserir.value) {
        continua = await gravaFiliacao('Iniciado o processo de filiação.');
        if (continua) {
            inserir.value = false;
        }
    }
    if (continua) { etapa.value++; }
}



const getNomeKey = (caminho: string) => {
    const array = caminho.split('/');
    return array[array.length - 1];
}

const continuaDocumentosObrigatorios = async () => {
    let continua = true
    let gravar = false;
    documentoPendente.value = true;
    const caminhoFolder = `entidades/${entidadeFilha._id}/filiacaoEntidade/${state.filiacaoEntidade._id}/documentosValidados/`;

    for (let index = 0; index < state.filiacaoEntidade.validacoesDocumentos.length; index++) {
        const element = state.filiacaoEntidade.validacoesDocumentos[index];
        if (element.arquivo) {
            const blobData = new Blob([element.arquivo], { type: element.arquivo.type });
            // const blobUrl = URL.createObjectURL(blobData);
            const ret: any = await $geralService.uploadFile(blobData, element.arquivo.name, caminhoFolder);
            if (ret) {
                // deleta arquivo antigo
                const caminhoAntigo = state.filiacaoEntidade.validacoesDocumentos[index].caminho;
                // console.log(caminhoAntigo);
                // console.log(element.arquivo.name);
                if (caminhoAntigo && getNomeKey(caminhoAntigo) != element.arquivo.name) {
                    await $geralService.deleteFile(caminhoAntigo);
                    // deletando arquivo antigo;
                    // console.log('deletando arquivo antigo');
                    state.filiacaoEntidade.historico.push({
                        created_at: new Date().toISOString(),
                        origemFiliadora: true,
                        descricao: 'alterado o documento ' + element.descricao + ' de ' + getNomeKey(caminhoAntigo) + ' para ' + element.arquivo.name + '.',
                        pessoa: geral.pessoa._id
                    });
                }
                state.filiacaoEntidade.validacoesDocumentos[index].caminho = caminhoFolder + element.arquivo.name;
                element.arquivo = undefined
                gravar = true;
            } else {
                continua = false;
                gravar = false;
                $q.notify({
                    position: "top",
                    type: "negative",
                    message: "Não é possível continuar, falha ao fazer upload do arquivo " + element.arquivo.name + "."
                });
                break;
            }
            // console.log(ret);
        }
    }

    if (gravar) {
        continua = await gravaFiliacao('Salvando a etapa ' + etapa.value + ' do processo de filiação.');
    }

    if (continua) {
        documentoPendente.value = false;
        etapa.value++;
    }
}



const continuar = async () => {
    // eslint-disable-next-line prefer-const
    let newfiliacao = JSON.parse(JSON.stringify(state.filiacaoEntidade));



    if (etapa.value == 1) {
        await verificaDocumentoPendente();
    }

    if (etapa.value == 2) {
        // console.log('yudfs');
        await verificaDocumentoPendente();
        if (documentoPendente.value) {
            return;
        }
    }

    if (etapa.value < 4) {
        etapa.value++;
        newfiliacao.etapa = etapa.value;
    }

};

const recusarFiliacao = () => {
    $q.dialog({
        dark: true,
        title: 'Recusar Filiação',
        message: 'Justificativa',
        prompt: {
            model: '',
            type: 'text' // optional
        },
        cancel: true,
        persistent: true
    }).onOk(data => {
        if (data) {
            state.filiacaoEntidade.status = 'Recusada';
            gravaFiliacao('Recusado com a justificativa: ' + data);
        } else {
            $q.notify({
                color: 'warning',
                position: 'top',
                icon: 'check',
                message: 'Atenção, nada foi feito!',
                timeout: 7000,
                caption: 'Informe uma justificativa para recusar a filiação!'
            });
        }
    });
}

const aceitarFiliacao = () => {
    $q.dialog({
        dark: true,
        title: 'Aceitar Filiação',
        message: 'Mensagem de Boas Vindas',
        prompt: {
            model: 'Gratidão por fazer parte da nossa família!',
            type: 'text' // optional
        },
        cancel: true,
        persistent: true
    }).onOk(data => {
        state.filiacaoEntidade.status = 'Ativa';
        gravaFiliacao('Filiação aceita e ativada com sucesso! ' + data);
    });
}
const ativarFiliacao = () => {
    $q.dialog({
        dark: true,
        title: 'Ativar Filiação',
        message: 'Justificativa',
        prompt: {
            model: '',
            type: 'text' // optional
        },
        cancel: true,
        persistent: true
    }).onOk(data => {
        if (data) {
            state.filiacaoEntidade.status = 'Ativa';
            gravaFiliacao('Filiação reativada com a justificativa: ' + data);
        } else {
            $q.notify({
                color: 'warning',
                position: 'top',
                icon: 'check',
                message: 'Atenção, nada foi feito!',
                timeout: 7000,
                caption: 'Informe uma justificativa para reativar a filiação!'
            });
        }
    });
}
const desativarFiliacao = () => {
    $q.dialog({
        dark: true,
        title: 'Desativar Filiação',
        message: 'Justificativa',
        prompt: {
            model: '',
            type: 'text' // optional
        },
        cancel: true,
        persistent: true
    }).onOk(data => {
        if (data) {
            state.filiacaoEntidade.status = 'Desativada';
            gravaFiliacao('Filiação desativada com a justificativa: ' + data);
        } else {
            $q.notify({
                color: 'warning',
                position: 'top',
                icon: 'check',
                message: 'Atenção, nada foi feito!',
                timeout: 7000,
                caption: 'Informe uma justificativa para desativar a filiação!'
            });
        }
    });
}

</script>

