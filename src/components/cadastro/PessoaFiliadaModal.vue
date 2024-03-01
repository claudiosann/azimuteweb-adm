<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <!-- <q-icon class="mx-2" name="fas fa-id-card" size="30px" /> -->
          <q-avatar v-if="state.filiacaoPessoa.pessoa" rounded size="40px"><q-img :src="getUrlImagem(state.filiacaoPessoa.pessoa.foto, 128)"></q-img></q-avatar>
          <div ml-3>
            <div text-xl>Filiação {{ state.filiacaoPessoa.pessoa.nome }}</div>
            <div>
              <q-badge :color="getCorStatus">{{ state.filiacaoPessoa.status }}</q-badge>
              <q-badge class="ml-2" v-if="state.filiacaoPessoa.temporaria" color="red">Temporária</q-badge>
            </div>
          </div>
          <q-space />
          <!-- GO btnSave -->
          <!-- <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave"
                        :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn> -->
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel" :label="$q.screen.gt.xs ? 'Sair' : undefined" color="red" icon="undo" />
        </q-toolbar>

        <div :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll px-3">
          <div class="col-12 flex flex-center">
            <div v-if="state.filiacaoPessoa" style="height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 52px); max-width: 1366px; width: 100%">
              <div class="full-width">
                <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
                  <q-tab default name="filiacao" icon="join_left" label="Filiação"> </q-tab>
                  <q-tab name="historico" icon="history" label="Histórico" />
                  <q-tab name="filiacoes" icon="badge" label="Todas as Filiações" />
                </q-tabs>
                <q-separator />
                <q-tab-panels v-model="tab" animated>
                  <q-tab-panel class="pl-0! pt-0!" name="filiacao">
                    <q-stepper class="q-pt-sm" flat v-model="etapa" vertical color="primary" header-nav animated>
                      <q-step v-if="state.filiacaoPessoa.filiacaoPessoaLancamento" :name="0" :title="'Entidades Envolvidas no Processo'" :done="etapa > 0" icon="fabric" active-icon="group_work">
                        <div class="flex items-center gap-1 mt-2 rounded-lg shadow p-2" v-for="(entidade, index) in state.filiacaoPessoa.filiacaoPessoaLancamento.entidades" :key="index">
                          <q-avatar size="35px" v-if="entidade.status" :color="getCorStatusFuncao(entidade.status)" text-color="white">{{ $geralService.getIniciais(entidade.status) }}</q-avatar>
                          <q-avatar rounded size="35px"><q-img :src="getUrlImagem(entidade.logo, 128)"></q-img></q-avatar>
                          <div class="text-lg">{{ entidade.sigla }} - {{ entidade.nomeRazao }}</div>
                        </div>
                        <q-stepper-navigation>
                          <q-btn class="btn-scale mt-0" @click="continuar" color="primary" label="Continuar" />
                        </q-stepper-navigation>
                      </q-step>
                      <q-step v-if="state.filiacaoPessoa.pessoa" :name="1" :title="'Dados Pessoais'" :done="etapa > 1" icon="person" active-icon="person">
                        <div class="!flex border dark:border-none rounded-lg shadow dark:shadow-gray-600">
                          <img v-if="state.filiacaoPessoa.pessoa.foto" class="rounded-s-lg hidden md:!block" :src="`${$geralService.configuracoes.BASE_S3 + state.filiacaoPessoa.pessoa.foto}`" style="max-height: 150px" />
                          <div class="p-2 grid grid-cols-6 gap-1 w-full">
                            <div class="col-span-6 sm:col-span-3 flex">
                              <img v-if="state.filiacaoPessoa.pessoa.foto" class="rounded-lg block md:!hidden mr-2" :src="`${$geralService.configuracoes.BASE_S3 + state.filiacaoPessoa.pessoa.foto}`" style="max-height: 80px" />
                              <div class="flex flex-col gap-1">
                                <span><span class="font-semibold">Nome:</span> {{ state.filiacaoPessoa.pessoa.nome }}</span>
                                <span class="block md:!hidden"><span class="font-semibold">Apelido:</span> {{ state.filiacaoPessoa.pessoa.apelido }}</span>
                              </div>
                            </div>
                            <div class="col-span-6 sm:col-span-3 hidden md:!block"><span class="font-semibold">Apelido:</span> {{ state.filiacaoPessoa.pessoa.apelido }}</div>
                            <div class="col-span-6 sm:col-span-3"><span class="font-semibold">Nascimento:</span> {{ $geralService.getDataFormatada(state.filiacaoPessoa.pessoa.nascimento) }}</div>
                            <div class="col-span-6 sm:col-span-3"><span class="font-semibold">CPF:</span> {{ $geralService.getCPFFormatado(state.filiacaoPessoa.pessoa.cpf) }}</div>
                            <div class="col-span-6 sm:col-span-3"><span class="font-semibold">Sexo:</span> {{ state.filiacaoPessoa.pessoa.sexo }}</div>
                            <div class="col-span-6 sm:col-span-3"><span class="font-semibold">País de Origem:</span> {{ state.filiacaoPessoa.pessoa.nacionalidade ? state.filiacaoPessoa.pessoa.nacionalidade : state.filiacaoPessoa.pessoa.endereco.pais }}</div>
                            <div v-if="state.filiacaoPessoa.pessoa.nomeDaMae" class="col-span-6 sm:col-span-3"><span class="font-semibold">Nome da Mãe:</span> {{ state.filiacaoPessoa.pessoa.nomeDaMae }}</div>

                             <div class="col-span-6 mt-2">
                             <div class="font-bold ">Endereço</div>
            <div>{{ state.filiacaoPessoa.pessoa.endereco.logradouro }}, {{ state.filiacaoPessoa.pessoa.endereco.numero }} - {{ state.filiacaoPessoa.pessoa.endereco.bairro }}</div>
            <div>{{ state.filiacaoPessoa.pessoa.endereco.cidade }} - {{ state.filiacaoPessoa.pessoa.endereco.uf }}</div>
            <div>CEP: {{ state.filiacaoPessoa.pessoa.endereco.cep }}</div>
</div>
                            <div class="col-span-6 sm:col-span-3">
                              <span class="font-bold mt-2">Validade Seguro: </span>
                              <span>{{ $geralService.getDataFormatada(state.filiacaoPessoa.pessoa.validadeSeguro) }}</span>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                              <span class="font-bold mt-2">Email: </span>
                              <span>{{ state.filiacaoPessoa.pessoa.email }}</span>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                              <div class="font-bold mt-2">Telefones</div>
                              <div v-for="(telefone, index) in state.filiacaoPessoa.pessoa.telefones" :key="index">{{ telefone.tipo }} - {{ telefone.numero }}</div>
                            </div>
                          </div>
                        </div>
                        <q-field v-if="state.filiacaoPessoa.filiacaoPessoaLancamento" class="mt-4" readonly outlined label="Observação" stack-label>
                          {{ state.filiacaoPessoa.filiacaoPessoaLancamento.observacao }}
                        </q-field>
                        <q-stepper-navigation>
                          <q-btn class="btn-scale" @click="continuar" color="primary" label="Continuar" />
                          <q-btn flat @click="etapa = 0" color="primary" label="Voltar" class="q-ml-sm btn-scale" />
                        </q-stepper-navigation>
                      </q-step>

                      <q-step v-if="state.filiacaoPessoa.filiacaoPessoaLancamento" :name="2" :title="'Documentos Obrigatórios'" :done="etapa > 2" icon="cloud_upload" active-icon="cloud_upload">
                        <!-- <div text-xl mb-2 v-if="state.filiacaoPessoa.filiacaoPessoaLancamento.documentosObrigatorios.length === 0"> {{ (state.filiacaoPessoa.entidade.tratamentoMasculino ? 'O ' : 'A ') + state.filiacaoPessoa.entidade.sigla }}  não exige nenhum documento para a filiação.</div> -->
                        <div v-if="state.filiacaoPessoa.filiacaoPessoaLancamento">
                          <div v-for="(item, index) in state.filiacaoPessoa.filiacaoPessoaLancamento.documentosObrigatorios" :key="index" class="row q-col-gutter-sm q-mb-sm">
                            <div class="col-12">
                              <q-field :error="!item.caminho" error-message="Documento Obrigatório" outlined :label="`${item.descricao} (${item.instrucao})`" stack-label>
                                <template v-slot:prepend>
                                  <q-avatar v-if="item.validado" size="35px" color="positive" text-color="white" icon="check" />
                                  <q-icon name="attach_file" />
                                </template>
                                <template v-slot:append>
                                  <!-- <q-btn v-if="item.caminho" icon="visibility"
                                                                    class="grid content-evenly btn-scale"
                                                                    @click="irPara(item.caminho)" round :href="item.caminho"
                                                                    target="_blank">
                                                                    <q-tooltip>Visualizar</q-tooltip></q-btn> -->
                                  <q-btn v-if="item.caminho" icon="visibility" round class="grid content-evenly btn-scale" @click="visualizarPdf($geralService.configuracoes.BASE_S3 + item.caminho, item)" />
                                  <q-btn color="primary" :icon="item.validado ? 'unpublished' : 'check'" round class="grid content-evenly btn-scale ml-2" @click="validarDocumento(item)">
                                    <q-tooltip>{{ item.validado ? "Desmarcar como válido!" : "Marcar como válido!" }}</q-tooltip>
                                  </q-btn>
                                </template>
                                <template v-slot:control>
                                  <span v-if="item.caminho">{{ getNomeKey(item.caminho) }}</span>
                                </template>
                              </q-field>
                            </div>
                          </div>
                        </div>
                        <q-stepper-navigation p-0>
                          <q-btn class="btn-scale" @click="continuar" color="primary" label="Continuar" />
                          <q-btn flat @click="etapa = 1" color="primary" label="Voltar" class="q-ml-sm btn-scale" />
                        </q-stepper-navigation>
                      </q-step>
                      <q-step v-if="state.filiacaoPessoa.filiacaoPessoaLancamento" :readonly="state.filiacaoPessoa.etapa < 3" :name="3" title="Taxas Obrigatórias" active-icon="attach_money" icon="attach_money" :done="etapa > 2">
                        <q-card class="mt-4 rounded-xl">
                          <div v-if="state.filiacaoPessoa.pagamento">
                            <q-item>
                              <q-item-section top avatar>
                                <q-avatar color="positive" text-color="white" icon="check" />
                                <span class="text-positive ml-1 text-bold">Pago</span>
                              </q-item-section>
                              <q-item-section>
                                <q-item-label class="text-lg text-positive text-weight-bold">Forma de Pagamento: {{ state.filiacaoPessoa.pagamento.tipo }}</q-item-label>
                                <q-item-label caption class="text-sm">Valor: R$ {{ $geralService.numeroParaMoeda(state.filiacaoPessoa.pagamento.valor) }}</q-item-label>
                                <q-item-label caption class="text-sm">Data: {{ $geralService.getDataFormatada(state.filiacaoPessoa.pagamento.created_at, "DD/MM/YYYY HH:mm:ss") }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </div>
                        </q-card>

                        <q-stepper-navigation>
                          <q-btn class="btn-scale" :disabled="!state.filiacaoPessoa.pagamento && state.filiacaoPessoa.filiacaoPessoaLancamento.taxas.length > 0" @click="continuar" color="primary" label="Continuar" />
                          <q-btn flat @click="etapa = 2" color="primary" label="Voltar" class="q-ml-sm btn-scale" />
                        </q-stepper-navigation>
                      </q-step>
                      <q-step :readonly="state.filiacaoPessoa.etapa < 4" :name="4" title="Validação da Entidade" active-icon="checklist" icon="checklist" :done="etapa > 3">
                        <q-item>
                          <q-item-section top avatar>
                            <q-avatar :color="getCorStatus" la text-color="white">{{ $geralService.getIniciais(state.filiacaoPessoa.status) }}</q-avatar>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ state.filiacaoPessoa.status }}</q-item-label>
                            <q-item-label caption>{{ getMensagemStatus }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-stepper-navigation>
                          <div v-if="geral.funcoesAcessos.filiacaoEditar">
                            <q-btn mr-3 v-if="state.filiacaoPessoa.status == 'Em Análise'" color="negative" label="Recusar Filiação" @click="recusarFiliacao" class="q-ml-sm" />
                            <q-btn v-if="state.filiacaoPessoa.status == 'Em Análise' && documentosValidados" class="btn-scale" color="primary" @click="aceitarFiliacao" label="Aceitar / Ativar Filiação" />
                            <q-btn v-if="state.filiacaoPessoa.status == 'Ativa'" class="btn-scale" color="red" @click="desativarFiliacao" label="Desativar Filiação" />
                            <q-btn v-if="state.filiacaoPessoa.status == 'Desativada'" class="btn-scale" color="primary" @click="ativarFiliacao" label="Reativar Filiação" />
                          </div>
                          <q-btn flat @click="etapa = 3" color="primary" label="Voltar" class="q-ml-sm btn-scale" />
                        </q-stepper-navigation>
                      </q-step>
                    </q-stepper>
                  </q-tab-panel>
                  <q-tab-panel name="historico">
                    <q-timeline layout="loose" color="secondary">
                      <q-timeline-entry v-for="(item, index) in state.filiacaoPessoa.historico" :key="index" :title="item.status" :subtitle="$geralService.getDataFormatada(item.created_at, 'DD/MM/YYYY HH:mm:ss') + ' - ' + (item.origemFiliadora ? state.filiacaoPessoa.entidade.sigla : state.filiacaoPessoa.pessoa.apelido)" :side="item.origemFiliadora ? 'left' : 'right'" :color="getCorStatusFuncao(item.status)">
                        <div>
                          {{ item.descricao }}
                        </div>
                      </q-timeline-entry>
                    </q-timeline>
                  </q-tab-panel>
                  <q-tab-panel name="filiacoes">
                     <div class="flex items-center gap-1 mt-2 rounded-lg shadow p-2" v-for="(filiacao, index) in state.filiacaoPessoa.pessoa.filiacoes" :key="index">
                          <q-avatar size="35px" v-if="filiacao.status" :color="getCorStatusFuncao(filiacao.status)" text-color="white">{{ $geralService.getIniciais(filiacao.status) }}</q-avatar>
                          <q-avatar rounded size="35px"><q-img v-if="filiacao.entidade.logo" :src="getUrlImagem(filiacao.entidade.logo, 128)"></q-img></q-avatar>
                          <div class="text-lg">{{ filiacao.entidade.sigla }} - {{ filiacao.entidade.nomeRazao }}</div>
                        </div>
                    
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
import QrcodeVue, { Level, RenderAs } from "qrcode.vue";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, requiredIf } from "@vuelidate/validators";
import SeletorEntidade from "../SeletorEntidade.vue";
import GerenciadorArquivoModal from "../GerenciadorArquivoModal.vue";
import VisualizarPdfModal from "../VisualizarPdfModal.vue";
import VisualizarImagemModal from "../VisualizarImagemModal.vue";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from "quasar";
import { reactive } from "vue";
import { time } from "console";


const { $geralService, $constantes } = useNuxtApp();

const geral = useGeral();

const props = defineProps({
  id: { type: String, default: null },
  copia: null,
  esporteId: null,
});

const listaFiliacoesObrigatorias = ref<any>([]);

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data

const state: any = reactive({
  filiacaoPessoa: {
    entidade: undefined,
    pessoa: geral.pessoa,
    etapa: 1,
    taxas: [],
    historico: [],
    documentosObrigatorios: [],
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

const getFiliacoesObrigatorias = async () => {
  // Verifica se a quantidade de filiações retornadas e ativas é igual a quantidade de filiações obrigatórias da entidade
  if (!state.filiacaoPessoa.entidade) {
    // console.log("Aguardando entidade");
    return false;
  }

  const ret2 = await useCustomFetch("filiacaoPessoa/getPopulate", "post", { filtro: { status: "Ativa", entidade: { $in: state.filiacaoPessoa.entidade.filiacaoPessoa.filiacoesObrigatorias } }, select: { entidade: 1 } }, undefined);
  if (ret2.valido) {
    // console.log(ret2.data);
    if (state.filiacaoPessoa.entidade.filiacaoPessoa.filiacoesObrigatorias.length > ret2.data.length) {
      // console.log("listaFiliacoesObrigatorias menor que filiações obrigatórias ");
      return false;
    }

    for (let index1 = 0; index1 < state.filiacaoPessoa.entidade.filiacaoPessoa.filiacoesObrigatorias.length; index1++) {
      const element = state.filiacaoPessoa.entidade.filiacaoPessoa.filiacoesObrigatorias[index1];
      // console.log('element', element);
      let achou = false;
      for (let index2 = 0; index2 < ret2.data.length; index2++) {
        const element2 = ret2.data[index2].entidade;
        // console.log('element2', element2);
        if (element2 == element) {
          achou = true;

          if (state.filiacaoPessoa.filiacaoPessoaLancamento) {
            for (let index3 = 0; index3 < state.filiacaoPessoa.filiacaoPessoaLancamento.entidades.length; index3++) {
              const entidade = state.filiacaoPessoa.filiacaoPessoaLancamento.entidades[index3];
              if (element == entidade._id) {
                entidade.status = "Ativa";
              }
            }
          }

          break;
        }
      }
      if (!achou) {
        // console.log("não achou filiação obrigatória");
        return false;
      }
    }
  } else {
    // console.log(ret2);
    return false;
  }

  return true;
};

const getCorStatus = computed(() => {
  return getCorStatusFuncao(state.filiacaoPessoa.status);
});

// const alterarNumeroFiliacao = async (novnumero) => {

//   gravaFiliacaoPessoaLancamento("");

//   if (ret.valido) {
//     state.filiacaoPessoa = ret.data[0];
//   }
// };

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
  // console.log(state.filiacaoPessoa.status);
  switch (state.filiacaoPessoa.status) {
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

const tabPagamento = ref("pix");

// GO valida
const validations = {
  filiacaoPessoa: {},
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
  // console.log(props.id);
  if (props.id) {
    const ret: any = await useCustomFetch(
      "filiacaoPessoa/getPopulate",
      "post",
      {
        filtro: {
          _id: props.id,
        },
        populateObj: [
          "pagamento",
          {
            path: "pessoa",
            select: { senha: 0 },
             populate: [{ path: "filiacoes", select: { nivelDificuldade: 1, entidade: 1, abrangencia: 1, status: 1 } ,populate: [{ path: "entidade", select: { nomeRazao: 1, logo: 1, sigla: 1, nomeFantasia: 1, tipo: 1, tratamentoMasculino: 1 } }]}],
          },
          {
            path: "filiacaoPessoaLancamento",
            populate: [{ path: "entidades", select: { nomeRazao: 1, logo: 1, sigla: 1, nomeFantasia: 1, tipo: 1, tratamentoMasculino: 1 } }],
          },
          {
            path: "entidade",
            select: { nomeRazao: 1, logo: 1, sigla: 1, nomeFantasia: 1, tipo: 1, tratamentoMasculino: 1, "filiacaoPessoa.filiacoesObrigatorias": 1 },
          },
        ],
      },
      undefined
    );
    // console.log(ret);
    if (ret.valido) {
      state.filiacaoPessoa = ret.data[0];
      // console.log(ret.data);
      state.filiacaoPessoa = JSON.parse(JSON.stringify(state.filiacaoPessoa));
      inserir.value = false;
      // console.log(state.filiacaoPessoa);
      // console.log(state.filiacaoPessoa.entidade.filiacaoPessoa.filiacoesObrigatorias);
      await getFiliacoesObrigatorias();
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
      state.filiacaoPessoa._id = id;
    } else {
      await cancel();
    }
  }
  etapa.value = 1;
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

const beforeSave = async () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Salvando registro...Aguarde!",
    messageColor: "white",
  });
  // $v.value.vinculos.$touch();
  $v.value.filiacaoPessoa.$touch();

  if ($v.value.filiacaoPessoa.$error) {
    $q.loading.hide();
    $q.notify({
      color: "warning",
      position: "top",
      icon: "check",
      message: "Preeencha todos os campos obrigatórios para salvar!",
    });
    return;
  }

  const newfiliacaoPessoa = JSON.parse(JSON.stringify(state.filiacaoPessoa));

  let url = "filiacaoPessoa";
  let tipo = "post";
  if (!inserir.value) {
    url += "/" + props.id;
    tipo = "put";
  }

  const ret: any = await useCustomFetch(url, tipo, newfiliacaoPessoa, undefined);

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

const documentosValidados = computed(() => {
  let retorno = true;
  if (!state.filiacaoPessoa.filiacaoPessoaLancamento) {
    return true;
  }
  for (let index = 0; index < state.filiacaoPessoa.filiacaoPessoaLancamento.documentosObrigatorios.length; index++) {
    const element = state.filiacaoPessoa.filiacaoPessoaLancamento.documentosObrigatorios[index];
    if (!element.validado) {
      retorno = false;
      break;
    }
  }
  return retorno;
});

const validarDocumento = async (item: any) => {
  if (item.validado) {
    $q.dialog({
      title: "Confirmação",
      message: `Desmarcar a validação do documento pela entidade ${state.filiacaoPessoa.entidade.sigla}?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      item.validado = false;
      // gravaFiliacaoPessoa(`Documento (${item.descricao}) desmarcado como válido pela entidade ${state.filiacaoPessoa.entidade.sigla}.`);
      gravaFiliacaoPessoaLancamento("");
    });
  } else {
    $q.dialog({
      title: "Confirmação",
      message: `Marcar como válido pela entidade ${state.filiacaoPessoa.entidade.sigla}?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      item.validado = true;
      // gravaFiliacaoPessoa(`Documento (${item.descricao}) marcado como válido pela entidade ${state.filiacaoPessoa.entidade.sigla}.`);
      gravaFiliacaoPessoaLancamento("");
    });
  }
};

const visualizarPdf = async (caminho: any, item?: any) => {
  $q.dialog({
    component: caminho.endsWith(".pdf") ? VisualizarPdfModal : VisualizarImagemModal,
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

const getUrlImagem = (caminho: any, tamanho: number) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: tamanho !== undefined ? tamanho : 128,
  });
};

const gravaFiliacaoPessoa = async (descricaoHistorico: string) => {
  let retorno = false;
  try {
    let url = "filiacaoPessoa";
    let tipo = "post";
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Salvando Filiação...Aguarde!",
      messageColor: "white",
    });
    state.filiacaoPessoa.historico.push({
      created_at: new Date().toISOString(),
      descricao: descricaoHistorico,
      status: state.filiacaoPessoa.status,
      origemFiliadora: true,
      pessoa: geral.pessoa._id,
    });
    const newfiliacao = JSON.parse(JSON.stringify(state.filiacaoPessoa));
    newfiliacao.entidade = newfiliacao.entidade._id;

    if (newfiliacao.filiacaoPessoaLancamento) {
      newfiliacao.filiacaoPessoaLancamento = newfiliacao.filiacaoPessoaLancamento._id;
    }

    url += "/" + newfiliacao._id;
    tipo = "put";

    const ret: any = await useCustomFetch(url, tipo, newfiliacao, undefined);
    if (ret.valido) {
      retorno = true;
      gravouFiliacao.value = true;
      console.log("gravou filiação");
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
const gravaFiliacaoPessoaLancamento = async (descricaoHistorico: string, objGravacao?: any) => {
  let retorno = false;
  try {
    let url = "filiacaoPessoaLancamento";
    let tipo = "post";
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Salvando Filiação...Aguarde!",
      messageColor: "white",
    });
    // state.filiacaoPessoa.filiacaoPessoaLancamento.historico.push({
    //   created_at: new Date().toISOString(),
    //   descricao: descricaoHistorico,
    //     status: state.filiacaoPessoa.status,
    //   entidadeSigla: state.filiacaoPessoa.entidade.sigla,
    //   origemFiliadora: true,
    //   pessoa: geral.pessoa._id,
    // });
    let newfiliacao = null;

    if (objGravacao) {
      newfiliacao = JSON.parse(JSON.stringify(objGravacao));
    } else {
      newfiliacao = JSON.parse(JSON.stringify(state.filiacaoPessoa.filiacaoPessoaLancamento));
      for (let index = 0; index < newfiliacao.entidades.length; index++) {
        newfiliacao.entidades[index] = newfiliacao.entidades[index]._id;
      }
    }

    url += "/" + state.filiacaoPessoa.filiacaoPessoaLancamento._id;
    tipo = "put";

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
  // console.log(state.filiacaoPessoa);
  let continua = true;
  if (inserir.value) {
    continua = await gravaFiliacaoPessoa("Iniciado o processo de filiação.");
    if (continua) {
      inserir.value = false;
    }
  }
  if (continua) {
    etapa.value++;
  }
};

const getNomeKey = (caminho: string) => {
  const array = caminho.split("/");
  return array[array.length - 1];
};

const continuar = async () => {
  // eslint-disable-next-line prefer-const
  let newfiliacao = JSON.parse(JSON.stringify(state.filiacaoPessoa));

  if (etapa.value < 4) {
    etapa.value++;
    newfiliacao.etapa = etapa.value;
  }
};

const recusarFiliacao = () => {
  $q.dialog({
    dark: true,
    title: "Recusar Filiação",
    message: "Justificativa",
    prompt: {
      model: "",
      type: "text", // optional
    },
    cancel: true,
    persistent: true,
  }).onOk((data) => {
    if (data) {
      state.filiacaoPessoa.status = "Recusada";
      gravaFiliacaoPessoa("Recusado com a justificativa: " + data);
    } else {
      $q.notify({
        color: "warning",
        position: "top",
        icon: "check",
        message: "Atenção, nada foi feito!",
        timeout: 7000,
        caption: "Informe uma justificativa para recusar a filiação!",
      });
    }
  });
};

const aceitarFiliacao = async () => {
  if (await getFiliacoesObrigatorias()) {
    $q.dialog({
      dark: true,
      title: "Aceitar Filiação",
      message: "Mensagem de Boas Vindas",
      prompt: {
        model: "Gratidão por fazer parte da nossa família!",
        type: "text", // optional
      },
      cancel: true,
      persistent: true,
    }).onOk((data) => {
      state.filiacaoPessoa.status = "Ativa";
      gravaFiliacaoPessoa("Filiação aceita e ativada com sucesso! " + data);
    });
  } else {
    $q.notify({
      color: "warning",
      position: "top",
      icon: "check",
      message: "Atenção, nada foi feito!",
      timeout: 7000,
      caption: "Aguarde as outras entidades aceitarem a filiação!",
    });
  }
};
const ativarFiliacao = () => {
  $q.dialog({
    dark: true,
    title: "Ativar Filiação",
    message: "Justificativa",
    prompt: {
      model: "",
      type: "text", // optional
    },
    cancel: true,
    persistent: true,
  }).onOk((data) => {
    if (data) {
      state.filiacaoPessoa.status = "Ativa";
      gravaFiliacaoPessoa("Filiação reativada com a justificativa: " + data);
    } else {
      $q.notify({
        color: "warning",
        position: "top",
        icon: "check",
        message: "Atenção, nada foi feito!",
        timeout: 7000,
        caption: "Informe uma justificativa para reativar a filiação!",
      });
    }
  });
};
const desativarFiliacao = () => {
  $q.dialog({
    dark: true,
    title: "Desativar Filiação",
    message: "Justificativa",
    prompt: {
      model: "",
      type: "text", // optional
    },
    cancel: true,
    persistent: true,
  }).onOk((data) => {
    if (data) {
      state.filiacaoPessoa.status = "Desativada";
      gravaFiliacaoPessoa("Filiação desativada com a justificativa: " + data);
    } else {
      $q.notify({
        color: "warning",
        position: "top",
        icon: "check",
        message: "Atenção, nada foi feito!",
        timeout: 7000,
        caption: "Informe uma justificativa para desativar a filiação!",
      });
    }
  });
};
</script>
