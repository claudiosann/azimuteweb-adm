<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-avatar v-if="state.filiacaoEntidade.entidadeFilha" rounded size="40px"><q-img :src="getUrlImagem(state.filiacaoEntidade.entidadeFilha.logo, 128)"></q-img></q-avatar>
          <q-icon class="mx-2" name="join_left" size="30px" />
          <q-avatar v-if="state.filiacaoEntidade.entidade" rounded size="40px"><q-img :src="getUrlImagem(state.filiacaoEntidade.entidade.logo, 128)"></q-img></q-avatar>
          <div v-if="state.filiacaoEntidade.entidade" ml-3>
            <div text-xl>Filiação {{ state.filiacaoEntidade.entidade.sigla }}</div>
            <div>
              <q-badge :color="getCorStatus">{{ state.filiacaoEntidade.status }}</q-badge>
            </div>
          </div>
          <q-space />
          <!-- GO btnSave -->
          <!-- <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave"
                        :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn> -->
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel" :label="$q.screen.gt.xs ? 'Sair' : undefined" color="red" icon="undo" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll">
          <div class="col-12 flex flex-center">
            <div v-if="state.filiacaoEntidade" style="height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 52px); max-width: 1366px; width: 100%">
              <div class="full-width">
                <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
                  <q-tab default name="filiacao" icon="join_left" label="Filiação"> </q-tab>
                  <q-tab name="historico" icon="history" label="Histórico" />
                </q-tabs>
                <q-separator />
                <q-tab-panels v-model="tab" animated>
                  <q-tab-panel class="pl-0!" name="filiacao">
                    <q-stepper class="q-pt-sm" flat v-model="etapa" vertical color="primary" header-nav animated>
                      <q-step :name="1" title="Seleção de Entidade" :error="!state.filiacaoEntidade.entidade" :caption="state.filiacaoEntidade.entidade ? state.filiacaoEntidade.entidade.sigla : 'Pendente'" active-icon="join_left" :done="etapa > 1">
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <q-field :disabled="state.filiacaoEntidade.etapa > 1" outlined label="Entidade" :ref="'entidade'" stack-label>
                              <template v-if="state.filiacaoEntidade.entidade && state.filiacaoEntidade.entidade.logo" v-slot:prepend>
                                <q-avatar rounded size="46px">
                                  <q-img :src="getUrlImagem(state.filiacaoEntidade.entidade.logo, 128)"></q-img>
                                </q-avatar>
                              </template>
                              <template v-slot:control>
                                <div class="self-center full-width no-outline" tabindex="0">
                                  <q-item-label v-if="state.filiacaoEntidade.entidade">{{ state.filiacaoEntidade.entidade.nomeRazao }}{{ " (" + state.filiacaoEntidade.entidade.sigla + ")" }}</q-item-label>
                                </div>
                              </template>
                              <template v-if="inserir" v-slot:append>
                                <q-btn color="primary" icon="search" @click="selecionarEntidade()" round>
                                  <q-tooltip>Localizar Entidade</q-tooltip>
                                </q-btn>
                              </template>
                            </q-field>
                          </div>
                        </div>
                        <q-stepper-navigation>
                          <q-btn :disabled="!state.filiacaoEntidade.entidade" @click="continuaSelecaoEntidade()" color="primary" :label="inserir ? 'Iniciar Processo de Filiação' : 'Continuar'" />
                        </q-stepper-navigation>
                      </q-step>
                      <q-step :readonly="state.filiacaoEntidade.etapa < 2" :name="2" :title="'Documentos Obrigatórios'" :done="etapa > 2" :error="documentoPendente" :caption="documentoPendente ? 'Pendente' : 'OK'" icon="cloud_upload" active-icon="cloud_upload">
                        <div text-xl mb-2 v-if="state.filiacaoEntidade.validacoesDocumentos.length === 0">{{ (state.filiacaoEntidade.entidade.tratamentoMasculino ? "O " : "A ") + state.filiacaoEntidade.entidade.sigla }} não exige nenhum documento para a filiação.</div>
                        <div v-for="(item, index) in state.filiacaoEntidade.validacoesDocumentos" :key="index" class="row q-col-gutter-sm q-mb-sm">
                          <div class="col-12">
                            <q-file
                              v-show="!item.caminho || item.arquivo"
                              outlined
                              @update:model-value="selecionarArquivo"
                              @rejected="
                                (rejectedEntries) => {
                                  // console.log(rejectedEntries);
                                }
                              "
                              v-model="item.arquivo"
                              :label="`${item.descricao} (${item.instrucao})`"
                              :error="!item.arquivo"
                              :ref="'docsref' + index"
                              accept=".pdf"
                              error-message="Documento Obrigatório!"
                            >
                              <template v-slot:prepend>
                                <q-icon name="attach_file" />
                              </template>
                              <template v-slot:append>
                                <q-btn
                                  v-if="item.arquivo"
                                  round
                                  mr-1
                                  icon="swap_horiz"
                                  @click="
                                    (evt) => {
                                      arraydocs[index].value[0].pickFiles(evt);
                                    }
                                  "
                                >
                                  <q-tooltip> Trocar </q-tooltip>
                                </q-btn>
                                <q-btn round v-if="item.arquivo" icon="visibility" @click="visualizarPdf2(item.arquivo)">
                                  <q-tooltip> Visualizar </q-tooltip>
                                </q-btn>
                              </template>
                            </q-file>
                            <q-field v-if="item.caminho && !item.arquivo" :error="!item.caminho" error-message="Documento Obrigatório" outlined :label="`${item.descricao} (${item.instrucao})`" stack-label>
                              <template v-slot:prepend>
                                <q-avatar v-if="item.validado" size="35px" color="positive" text-color="white" icon="check" />
                                <q-icon name="attach_file" />
                              </template>
                              <template v-slot:append>
                                <q-btn
                                  v-if="item.caminho && state.filiacaoEntidade.status !== 'Em Análise' && !item.validado"
                                  round
                                  mr-1
                                  icon="swap_horiz"
                                  @click="
                                    (evt) => {
                                      // console.log(arraydocs[index].value[0].pickFiles(evt));
                                    }
                                  "
                                >
                                  <q-tooltip> Trocar </q-tooltip>
                                </q-btn>
                                <q-btn v-if="item.caminho" icon="visibility" class="grid content-evenly" @click="irPara(item.caminho)" round :href="item.caminho" target="_blank"> <q-tooltip>Visualizar</q-tooltip></q-btn>
                                <!-- <q-btn v-if="item.caminho" :label="'Visu2'"
                                                                        :icon="item.caminho ? 'swap_horiz' : 'task'"
                                                                        @click="visualizarPdf(item.caminho)" color="teal" /> -->
                              </template>
                              <template v-slot:control>
                                <span v-if="item.caminho">{{ getNomeKey(item.caminho) }}</span>
                              </template>
                            </q-field>
                          </div>
                        </div>
                        <q-stepper-navigation p-0>
                          <!-- <q-btn @click="enviarArquivos" color="primary" label="Enviar Arquivos" /> -->
                          <q-btn :disabled="documentoPendente" @click="continuaDocumentosObrigatorios" color="primary" label="Continuar" />
                          <q-btn flat @click="etapa = 1" color="primary" label="Voltar" class="q-ml-sm" />
                        </q-stepper-navigation>
                      </q-step>
                      <q-step :readonly="state.filiacaoEntidade.etapa < 3" :name="3" title="Taxas Obrigatórias" :caption="state.filiacaoEntidade.pagamento || state.filiacaoEntidade.taxas.length === 0 ? 'OK' : 'Pendente'" :error="!state.filiacaoEntidade.pagamento && state.filiacaoEntidade.taxas.length > 0" active-icon="attach_money" icon="attach_money" :done="etapa > 2">
                        <div text-xl mb-2 v-if="state.filiacaoEntidade.taxas.length === 0">{{ (state.filiacaoEntidade.entidade.tratamentoMasculino ? "O " : "A ") + state.filiacaoEntidade.entidade.sigla }} não cobra nenhuma taxa para a filiação.</div>
                        <q-field hide-bottom-space v-for="(item, index) in state.filiacaoEntidade.taxas" :key="index" outlined :label="item.descricao" stack-label>
                          <template v-slot:control>
                            {{ "R$ " + $geralService.numeroParaMoeda(item.valorPadrao) }}
                          </template>
                        </q-field>

                        <q-card class="mt-4 rounded-xl">
                          <div v-if="state.filiacaoEntidade.pagamento">
                            <q-item>
                              <q-item-section top avatar>
                                <q-avatar color="positive" text-color="white" icon="check" />
                                <span class="text-positive ml-1 text-bold">Pago</span>
                              </q-item-section>
                              <q-item-section>
                                <q-item-label class="text-lg text-positive text-weight-bold">Forma de Pagamento: {{ state.filiacaoEntidade.pagamento.tipo }}</q-item-label>
                                <q-item-label caption class="text-sm">Valor: R$ {{ $geralService.numeroParaMoeda(getTotalTaxas()) }}</q-item-label>
                                <q-item-label caption class="text-sm">Data: {{ $geralService.getDataFormatada(state.filiacaoEntidade.pagamento.created_at, "DD/MM/YYYY HH:mm:ss") }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </div>
                          <div v-if="!state.filiacaoEntidade.pagamento && state.filiacaoEntidade.taxas.length > 0">
                            <q-item>
                              <q-item-section>
                                <q-item-label class="text-lg text-weight-bold">Forma de Pagamento</q-item-label>
                                <q-item-label caption class="text-sm">Total R$ {{ $geralService.numeroParaMoeda(getTotalTaxas()) }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-tabs :stretch="false" v-model="tabPagamento" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
                              <q-tab name="pix">
                                <svg class="mb-0.5" :fill="tabPagamento == 'pix' ? 'blue' : 'gray'" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                                  <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                                  <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L310.6 488.6C280.3 518.1 231.1 518.1 200.8 488.6L103.3 391.2H112.6C132.6 391.2 151.5 383.4 165.7 369.2L242.4 292.5zM262.5 218.9C256.1 224.4 247.9 224.5 242.4 218.9L165.7 142.2C151.5 127.1 132.6 120.2 112.6 120.2H103.3L200.7 22.76C231.1-7.586 280.3-7.586 310.6 22.76L407.8 119.9H392.6C372.6 119.9 353.7 127.7 339.5 141.9L262.5 218.9zM112.6 142.7C126.4 142.7 139.1 148.3 149.7 158.1L226.4 234.8C233.6 241.1 243 245.6 252.5 245.6C261.9 245.6 271.3 241.1 278.5 234.8L355.5 157.8C365.3 148.1 378.8 142.5 392.6 142.5H430.3L488.6 200.8C518.9 231.1 518.9 280.3 488.6 310.6L430.3 368.9H392.6C378.8 368.9 365.3 363.3 355.5 353.5L278.5 276.5C264.6 262.6 240.3 262.6 226.4 276.6L149.7 353.2C139.1 363 126.4 368.6 112.6 368.6H80.78L22.76 310.6C-7.586 280.3-7.586 231.1 22.76 200.8L80.78 142.7H112.6z" />
                                </svg>
                                <span class="q-tab__label">PIX</span>
                              </q-tab>
                              <q-tab name="cartao" icon="credit_card" label="Cartão de Crédito" />
                            </q-tabs>
                            <q-separator />
                            <q-tab-panels v-model="tabPagamento" animated>
                              <q-tab-panel name="pix">
                                <!-- <div class="row text-bold">Emissão e gerenciamento.</div> -->
                                <!-- <img :src="'asaas-white.svg'" style="width: 150px; background: #1da9da; padding: 5px; margin-right: 10px;"> -->
                                <!-- <img :src="'/nova_logo.svg'" style="max-width: 134px" /> -->
                                <div class="flex justify-center">
                                  <img :src="'/logo_pix.png'" style="max-width: 200px" />
                                </div>
                                <div class="flex justify-center mt-5">
                                  <div class="bg-white p-2 rounded-xl">
                                    <qrcode-vue :value="qrcode" :level="level" :render-as="renderAs" />
                                  </div>
                                </div>
                                <div class="flex justify-center mt-5">
                                  <q-btn color="primary" icon="fas fa-copy" label="Pix Copia e Cola" />
                                </div>
                                <div class="text-lg flex justify-center text-bold mt-4">Aguardando o pagamento...</div>
                              </q-tab-panel>
                              <q-tab-panel name="cartao">
                                <div class="row q-mb-sm">
                                  <img style="height: 40px" :src="'/logo_cartao/cielo.png'" />
                                  <img style="height: 40px" :src="'/logo_cartao/cartoes_cielo.png'" />
                                </div>
                                <div class="row q-col-gutter-sm">
                                  <!-- GO Descrição -->
                                  <div class="col-sm-6 col-12">
                                    <q-input @update:model-value="validaCartao" mask="#### - #### - #### - ####" fill-mask="_" unmasked-value ref="cartao.CardNumber" hide-bottom-space outlined v-model="state.pagamento.cartao.CardNumber" :error="!state.pagamento.cartao.cartaoValido" error-message="Cartão Inválido!" :label="'Número'">
                                      <template v-if="state.pagamento.cartao.Brand" v-slot:append>
                                        <img style="height: 30px" :src="'/logo_cartao/logo_' + state.pagamento.cartao.Brand + '.png'" />
                                      </template>
                                    </q-input>
                                  </div>
                                  <div class="col-sm-6 col-12">
                                    <q-input ref="cartao.Holder" :rules="[(val) => (val && val.length > 0) || 'Campo obrigatório']" hint="Conforme impresso no cartão" hide-bottom-space outlined v-model="state.pagamento.cartao.Holder" :label="'Nome'" />
                                  </div>
                                  <div class="col-6">
                                    <q-input :rules="[(val) => (val && val.length > 2) || 'Código inválido']" ref="cartao.SecurityCode" hint="Impresso no verso do cartão" mask="####" hide-bottom-space outlined v-model="state.pagamento.cartao.SecurityCode" :label="'Código de Segunça (Mandatory field)'" />
                                  </div>
                                  <div class="col-6">
                                    <q-input @input="validaDataValidade" ref="cartao.ExpirationDate" hint="MM/AAAA" fill-mask="_" mask="##/####" hide-bottom-space outlined v-model="state.pagamento.cartao.ExpirationDate" :rules="[(val) => (val && state.pagamento.cartao.dataValida) || 'Data inválida!']" :label="'Validade do Cartão (MM/AAAA)'" />
                                  </div>
                                </div>
                                <q-card-actions vertical align="right">
                                  <q-btn @click="confirmarPagamento()" color="primary">Efetuar Pagamento</q-btn>
                                </q-card-actions>
                              </q-tab-panel>
                            </q-tab-panels>
                          </div>
                        </q-card>

                        <q-stepper-navigation>
                          <!-- <q-btn @click="enviarArquivos" color="primary" label="Enviar Arquivos" /> -->
                          <q-btn :disabled="!state.filiacaoEntidade.pagamento && state.filiacaoEntidade.taxas.length > 0" @click="continuaTaxas" color="primary" label="Continuar" />
                          <q-btn flat @click="etapa = 2" color="primary" label="Voltar" class="q-ml-sm" />
                        </q-stepper-navigation>
                      </q-step>
                      <q-step :readonly="state.filiacaoEntidade.etapa < 4" :name="4" title="Conclusão" :caption="state.filiacaoEntidade.etapa < 3 ? 'Pendente' : state.filiacaoEntidade.status" active-icon="checklist" icon="checklist" :done="etapa > 3">
                        <q-item>
                          <q-item-section top avatar>
                            <q-avatar :color="getCorStatus" la text-color="white">{{ $geralService.getIniciais(state.filiacaoEntidade.status) }}</q-avatar>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ state.filiacaoEntidade.status }}</q-item-label>
                            <q-item-label caption>{{ getMensagemStatus }}</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-stepper-navigation class="p-0">
                          <q-btn v-if="state.filiacaoEntidade.status == 'Recusada'" @click="reenviarParaAnalise" color="warning" label="Reenviar para Análise" class="q-ml-sm" />

                          <q-btn flat @click="etapa = 2" color="primary" label="Voltar" class="q-ml-sm" />
                        </q-stepper-navigation>
                      </q-step>
                    </q-stepper>
                  </q-tab-panel>
                  <q-tab-panel name="historico">
                    <q-timeline layout="loose" color="secondary">
                      <q-timeline-entry v-for="(item, index) in state.filiacaoEntidade.historico" :key="index" :title="item.status" :subtitle="$geralService.getDataFormatada(item.created_at, 'DD/MM/YYYY HH:mm:ss') + ' - ' + (item.origemFiliadora ? state.filiacaoEntidade.entidade.sigla : state.filiacaoEntidade.entidadeFilha.sigla)" :side="item.origemFiliadora ? 'left' : 'right'" :color="getCorStatusFuncao(item.status)">
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
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import QrcodeVue, { Level, RenderAs } from "qrcode.vue";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, requiredIf } from "@vuelidate/validators";
import SeletorEntidade from "../SeletorEntidade.vue";
import GerenciadorArquivoModal from "../GerenciadorArquivoModal.vue";
import VisualizarPdfModal from "../VisualizarPdfModal.vue";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from "quasar";
import { reactive } from "vue";

const { $geralService, $constantes } = useNuxtApp();

const geral = useGeral();
const getCorStatus = computed(() => {
  return getCorStatusFuncao(state.filiacaoEntidade.status);
});

const getCorStatusFuncao = (status: string) => {
  switch (status) {
    case "Ativa":
      return "positive";
    case "Em Análise":
      return "warning";
    case "Aguardando Pagamento":
      return "teal";
    case "Iniciada":
      return "primary";
    case "Recusada":
      return "negative";
    case "Cancelada":
      return "grey";
    case "Desativada":
      return "accent";
    default:
      return "red";
  }
};
const getMensagemStatus = computed(() => {
  // console.log(state.filiacaoEntidade.status);
  switch (state.filiacaoEntidade.status) {
    case "Ativa":
      return "Filiação ativa, todas as etapas foram realizadas com sucesso!";
    case "Em Análise":
      return "Aguarde o retorno da entidade.";
    case "Aguardando Pagamento":
      return "Aguarde o pagamento para continuar o processo de filiação.";
    case "Iniciada":
      return "Processo de filiação iniciado.";
    case "Recusada":
      return "Processo de filiação recusado, verifique o histórico para verificar os motivos.";
    case "Cancelada":
      return "Processo de filiação cancelado, verifique o histórico para verificar os motivos.";
    case "Desativada":
      return "Filiação desativada, verifique o histórico para verificar os motivos.";
    default:
      return "";
  }
});

const props = defineProps({
  id: { type: String, default: null },
  copia: null,
  esporteId: null,
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const entidadeFilha = {
  nomeRazao: geral.entidade.nomeRazao,
  sigla: geral.entidade.sigla,
  logo: geral.entidade.logo,
  _id: geral.entidade._id,
  tipo: geral.entidade.tipo,
};
const arquivo = ref<any>(null);

const qrcode = ref("qrcode");
const level = ref<Level>("M");
const renderAs = ref<RenderAs>("svg");

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
    ataContratoObrigatorio: false,
  },
  pagamento: {
    tipoPessoa: "Física",
    sacado: "",
    cpfCnpj: "",
    email: "",
    cartao: $geralService.getTesteCartao(),
  },
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
const populateObj = JSON.stringify(["filiacoesEntidades.taxas"]);
const select = JSON.stringify({
  nomeFantasia: 1,
  nomeRazao: 1,
  logo: 1,
  tratamentoMasculino: 1,
  filiacoesEntidades: 1,
  sigla: 1,
});
const listaValidacoes = ref<any>([]);
const listaEntidades = ref<any>([]);
const tab = ref("filiacao");

const tabPagamento = ref("pix");

// GO valida
const validations = {
  filiacaoEntidade: {},
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
  },
};

const $v = useVuelidate(validations, state);
const inserir = ref(true);

onBeforeMount(async () => {
  if (props.id) {
    const ret: any = await useCustomFetch(
      "filiacaoEntidade/getPopulate",
      "post",
      {
        filtro: {
          _id: props.id,
        },
        populateObj: [
          "pagamento",
          {
            path: "entidadeFilha",
            select: { nomeRazao: 1, logo: 1, sigla: 1, nomeFantasia: 1, tipo: 1, tratamentoMasculino: 1 },
          },
          {
            path: "entidade",
            select: { nomeRazao: 1, logo: 1, sigla: 1, nomeFantasia: 1, tipo: 1, tratamentoMasculino: 1 },
          },
        ],
      },
      undefined
    );
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
  await iniciaListaEntidades();
  etapa.value = state.filiacaoEntidade.etapa;
});

const validaDataValidade = (value: any) => {
  // console.log(value);
  state.pagamento.cartao.dataValida = $geralService.validaDataValidade(state.pagamento.cartao.ExpirationDate);
};

const validaCartao = (value: any) => {
  // console.log(value);
  setTimeout(() => {
    $geralService.validaCartao(state.pagamento, modoSandBox);
  }, 100);
};

const irPara = (caminho: string) => {
  navigateTo($geralService.configuracoes.BASE_S3 + caminho, {
    open: {
      target: "_blank",
    },
  });
};

const validaExisteFiliacaoEntidade = async () => {
  const ret: any = await useCustomFetch(
    "filiacaoEntidade/getPopulate",
    "post",
    {
      filtro: {
        entidadeFilha: state.filiacaoEntidade.entidadeFilha._id,
        entidade: state.filiacaoEntidade.entidade._id,
        lixo: false,
      },
      select: { _id: 1 },
    },
    undefined
  );
  if (ret.valido && ret.data.length) {
    // Existe outra filiação
    return false;
  }
  // Não existe outra filiação
  return true;
};

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
    height: tamanho !== undefined ? tamanho : 128,
  });
};

const confirmSelecaoEntidade = (entidade: any) => {
  state.filiacaoEntidade.entidade = entidade;
};

const confirmarPagamento = async () => {
  let data: any = { pagamento: state.pagamento };

  data.pagamento.tipo = tabPagamento.value === "pix" ? "PIX" : "Cartão";
  data.pagamento.entidadeResponsavel = state.filiacaoEntidade.entidade._id;
  data.pagamento.entidade = state.filiacaoEntidade.entidadeFilha._id;
  data.pagamento.pessoa = null;
  data.pagamento.tipoPessoa = "Jurídica";
  data.pagamento.tipoIdentificador = "Filiação";
  data.pagamento.identificador = state.filiacaoEntidade._id;
  data.pagamento.valor = getTotalTaxas();
  data.pagamento.status = "Recebido";
  data.totalLiquido = getTotalTaxas();
  data.production = false;
  data.SoftDescriptor = "Filiacao " + state.filiacaoEntidade.entidade.sigla;
  data.entidadeResponsavel = state.filiacaoEntidade.entidade._id;
  data._id = state.filiacaoEntidade._id;

  const url = tabPagamento.value === "pix" ? "pagamentoPix" : "pagamentoCartao";

  const ret: any = await useCustomFetch(url, "POST", data, undefined);

  if (ret.valido) {
    state.filiacaoEntidade.pagamento = ret.data._id;
    state.filiacaoEntidade.status = "Em Análise";
    state.filiacaoEntidade.etapa = 4;
    await gravaFiliacao("Confimado o pagamento das taxas em " + ret.data.tipo + " no valor de R$ " + $geralService.numeroParaMoeda(getTotalTaxas()) + " e alterado o Status para (Em Análise).");
    state.filiacaoEntidade.pagamento = ret.data;
    $q.notify({
      color: "green",
      position: "top",
      icon: "check",
      message: "Pagamento realizado com sucesso!",
    });
  } else {
    // console.log(ret);
    $q.notify({
      color: "red",
      position: "top",
      icon: "check",
      message: "Falha ao realizar pagamento!",
    });
  }
};

const beforeSave = async () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Salvando registro...Aguarde!",
    messageColor: "white",
  });
  // $v.value.vinculos.$touch();
  $v.value.filiacaoEntidade.$touch();

  if ($v.value.filiacaoEntidade.$error) {
    $q.loading.hide();
    $q.notify({
      color: "warning",
      position: "top",
      icon: "check",
      message: "Preeencha todos os campos obrigatórios para salvar!",
    });
    return;
  }

  const newFiliacaoEntidade = JSON.parse(JSON.stringify(state.filiacaoEntidade));

  let url = "filiacaoEntidade";
  let tipo = "post";
  if (!inserir.value) {
    url += "/" + props.id;
    tipo = "put";
  }

  const ret: any = await useCustomFetch(url, tipo, newFiliacaoEntidade, undefined);

  if (ret.valido) {
    $q.loading.hide();
    $q.notify({
      color: "green",
      position: "top",
      icon: "check",
      message: "Registro salvo com sucesso!",
    });
    onDialogOK(ret.data);
  } else {
    // console.log(ret);
    $q.notify({
      color: "error",
      position: "top",
      icon: "check",
      message: "Falha ao salvar registro!",
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
  // console.log("validando");
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
  setTimeout(async () => {
    await verificaDocumentoPendente();
  }, 400);
};

const reenviarParaAnalise = () => {
  $q.dialog({
    dark: true,
    title: "Reenviar para Análise",
    message: "Justificativa",
    prompt: {
      model: "",
      type: "text",
      maxlength: 200,
      // optional
    },
    cancel: true,
    persistent: true,
  }).onOk((data) => {
    if (data) {
      state.filiacaoEntidade.status = "Em Análise";
      gravaFiliacao("Reenviado para análise com a justificativa: " + data);
    } else {
      $q.notify({
        color: "warning",
        position: "top",
        icon: "check",
        message: "Atenção!",
        caption: "Nada foi feito, informe uma justificativa para reenviar para análise!",
      });
    }
  });
};

const visualizarPdf = (caminho: any) => {
  $q.dialog({
    component: VisualizarPdfModal,
    persistent: true,
    componentProps: {
      caminho: caminho,
    },
  })
    .onOk(async (data) => {})
    .onCancel(() => {});
};
const visualizarPdf2 = (arquivo: any) => {
  const blobData = new Blob([arquivo], { type: arquivo.type });
  const blobUrl = URL.createObjectURL(blobData);
  // window.open(blobUrl, '_blank');
  visualizarPdf(blobUrl);
};
const onRejected = (rejectedEntries: any) => {
  $q.notify({
    position: "top",
    type: "negative",
    message: "Para este documento, somente o formato (.PDF) é aceito!",
  });
};
const checkFileTypeAtaContrato = (files: any) => {
  // console.log(files);
  return files.filter((file: any) => file.type === "application/pdf");
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
          // console.log("Fez parte do filtro");
          // Adiciona as taxas caso exista;
          state.filiacaoEntidade.taxas = element.taxas;
          state.filiacaoEntidade.validacoesDocumentos = element.documentosObrigatorios;
          atualizaTotalTaxas();
          break;
        }
      }
    } else {
      // console.log("Pegou generico");
      state.filiacaoEntidade.taxas = element.taxas;
      state.filiacaoEntidade.validacoesDocumentos = element.documentosObrigatorios;
      atualizaTotalTaxas();
      break;
    }
  }
};
const atualizaTotalTaxas = () => {
  state.filiacaoEntidade.valorTaxas = 0;
  state.filiacaoEntidade.taxas.forEach((element: any) => {
    state.filiacaoEntidade.valorTaxas += element.valorPadrao;
  });
};
const iniciaListaEntidades = async () => {
  const ret1: any = await useCustomFetch(
    "entidade/getPopulate",
    "post",
    {
      filtro: {
        lixo: false,
        esportes: { $in: geral.entidade.esportes },
        "filiacoesEntidades.tipoEntidadesAceitas": geral.entidade.tipo,
      },
      select: {
        nomeRazao: 1,
        nomeFantasia: 1,
        sigla: 1,
        logo: 1,
        tratamentoMasculino: 1,
        filiacoesEntidades: 1,
      },
      populateObj: ["filiacoesEntidades.taxas"],
    },
    undefined
  );

  if (ret1.valido) {
    listaEntidades.value = ret1.data;
  }
  // console.log(ret1);
  // const ret1 = await $geralService.comunicaAsync(
  //   'entidade/getPopulate',
  //   'post',
  //   {
  //     filtro: { lixo: false, _id: this.$configuracoes.entidadeNacional },
  //     select: ['nomeRazao', 'sigla', 'logo', 'filiacaoEntidade.taxaFiliacao', 'filiacaoEntidade.taxaAnuidade']
  //   },
  //   'buscar entidade '
  // );
};
const iniciaListaValidacoes = async () => {
  listaValidacoes.value = [];

  const ret1: any = await useCustomFetch(
    "entidade/getPopulate",
    "post",
    {
      filtro: {
        lixo: false,
        entidade: geral.entidade._id,
      },
      select: ["nomeRazao", "sigla", "logo", "filiacaoEntidade.taxaFiliacao", "filiacaoEntidade.taxaAnuidade"],
    },
    undefined
  );

  if (ret1.valido) {
    listaValidacoes.value = ret1.data;
  }
};
const selecionarEntidade = () => {
  $q.dialog({
    component: SeletorEntidade,
    persistent: true,
    componentProps: {
      listaEntidade: listaEntidades.value,
    },
  })
    .onOk(async (data) => {
      confirmSelecao(data);
    })
    .onCancel(() => {});
  // TODO this.showSeletorEntidade = true;
};
const confirmSelecao = (entidade: any) => {
  if (state.filiacaoEntidade.entidadeFilha._id === entidade._id) {
    $q.notify({
      position: "top",
      icon: "warning",
      color: "warning",
      message: "Selecione outra entidade!",
      timeout: 2000,
    });
  } else {
    state.filiacaoEntidade.entidade = entidade;
    // console.log("teste");
    // console.log(entidade);
    atualizaConfiguracoes(entidade);
  }
};
const getUrlImagem = (caminho: any, tamanho: number) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: tamanho !== undefined ? tamanho : 128,
  });
};

const gravaFiliacao = async (descricaoHistorico?: string) => {
  let retorno = false;
  try {
    let url = "filiacaoEntidade";
    let tipo = "post";
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Salvando Filiação...Aguarde!",
      messageColor: "white",
    });

    if (descricaoHistorico) {
      state.filiacaoEntidade.historico.push({
        created_at: new Date().toISOString(),
        status: state.filiacaoEntidade.status,
        origemFiliadora: false,
        descricao: descricaoHistorico,
        pessoa: geral.pessoa._id,
      });
    }

    const newfiliacao = JSON.parse(JSON.stringify(state.filiacaoEntidade));
    newfiliacao.entidade = newfiliacao.entidade._id;
    newfiliacao.entidadeFilha = newfiliacao.entidadeFilha._id;
    if (inserir.value) {
      if (!(await validaExisteFiliacaoEntidade())) {
        $q.loading.hide();
        $q.notify({
          position: "top",
          message: "Não é possível continuar!",
          type: "negative",
          caption: "Já existe um processo de filiação para esta entidade!",
          timeout: 7000,
        });
        return false;
      }
    } else {
      url += "/" + newfiliacao._id;
      tipo = "put";
    }
    const ret: any = await useCustomFetch(url, tipo, newfiliacao, undefined);
    if (ret.valido) {
      retorno = true;
      gravouFiliacao.value = true;
      // console.log("gravou filiação");
    } else {
      $q.notify({
        position: "top",
        type: "negative",
        message: "Não é possível continuar, Falha ao salvar filiação!",
      });
    }
  } catch (error) {
    // console.log(error);
  }
  $q.loading.hide();
  return retorno;
};

const continuaSelecaoEntidade = async () => {
  // console.log(state.filiacaoEntidade);
  let continua = true;
  if (inserir.value) {
    state.filiacaoEntidade.etapa = 2;
    state.filiacaoEntidade.status = "Iniciada";
    continua = await gravaFiliacao("Iniciado o processo de filiação.");
    if (continua) {
      inserir.value = false;
    }
    verificaDocumentoPendente();
  }
  if (continua) {
    etapa.value++;
  }
};

const getNomeKey = (caminho: string) => {
  const array = caminho.split("/");
  return array[array.length - 1];
};

const continuaDocumentosObrigatorios = async () => {
  let continua = true;
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
        if (caminhoAntigo && getNomeKey(caminhoAntigo) != element.arquivo.name) {
          await $geralService.deleteFile(caminhoAntigo);
          // deletando arquivo antigo;
          // console.log("deletando arquivo antigo");
          state.filiacaoEntidade.historico.push({
            created_at: new Date().toISOString(),
            origemFiliadora: false,
            status: state.filiacaoEntidade.status,
            descricao: `Alterado em (${element.descricao}) de ${getNomeKey(caminhoAntigo)} para ${element.arquivo.name}.`,
            pessoa: geral.pessoa._id,
          });
        } else {
          state.filiacaoEntidade.historico.push({
            created_at: new Date().toISOString(),
            origemFiliadora: false,
            status: state.filiacaoEntidade.status,
            descricao: `Adicionado em (${element.descricao}) o documento (${element.arquivo.name}).`,
            pessoa: geral.pessoa._id,
          });
        }
        state.filiacaoEntidade.validacoesDocumentos[index].caminho = caminhoFolder + element.arquivo.name;
        element.arquivo = undefined;
        element.validado = false;
        gravar = true;
      } else {
        continua = false;
        gravar = false;
        $q.notify({
          position: "top",
          type: "negative",
          message: "Não é possível continuar, falha ao fazer upload do arquivo " + element.arquivo.name + ".",
        });
        break;
      }
      // console.log(ret);
    }
  }

  if (gravar) {
    if (state.filiacaoEntidade.etapa == 2) {
      state.filiacaoEntidade.etapa = 3;
      state.filiacaoEntidade.status = "Aguardando Pagamento";
      continua = await gravaFiliacao("Alterado o status para (Aguardando Pagamento).");
    } else {
      continua = await gravaFiliacao();
    }
  }

  if (continua) {
    documentoPendente.value = false;
    etapa.value++;
  }
};

const continuaTaxas = async () => {
  let continua = true;
  // console.log(state.filiacaoEntidade.status);
  if (state.filiacaoEntidade.status == "Iniciada" && state.filiacaoEntidade.taxas.length === 0) {
    state.filiacaoEntidade.etapa = 4;
    state.filiacaoEntidade.status = "Em Análise";
    continua = await gravaFiliacao("Alterado o status para (Em Análise).");
  }
  if (continua) {
    etapa.value++;
  }
};

const continuar = async () => {
  // eslint-disable-next-line prefer-const
  let newfiliacao = JSON.parse(JSON.stringify(state.filiacaoEntidade));

  if (etapa.value == 1) {
    await verificaDocumentoPendente();
  }

  if (etapa.value == 2) {
    // console.log("yudfs");
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
</script>
