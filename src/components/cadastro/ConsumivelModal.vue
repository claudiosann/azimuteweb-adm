<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-l from-pink-400 to-rose-700" name="list_alt" size="30px" />
          <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Consumível</q-toolbar-title>
          <!-- GO btnSave -->
          <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive" aria-label="Salvarmargin-extra - " @click="beforeSave" :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel" :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
            <q-tab default name="dados" icon="line_style" label="Informações" />
            <q-tab name="arranjo" icon="device_hub" label="Divisão dos Valores" />
            <q-tab name="imagem" icon="image" label="Imagem" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="dados">
              <div class="row q-ma-sm q-col-gutter-sm">
                <div v-if="listaPercurso" class="col-md-6 col-sm-6 col-12">
                  <q-select hide-bottom-space clearable outlined v-model="state.consumivel.percurso" @update:model-value="changePercurso" @clear="changePercurso" label="Percurso" :dense="dense" option-label="descricao" :emit-value="true" map-options :option-value="(obj) => (obj ? obj._id : '')" :options="listaPercurso"> </q-select>
                </div>
                <div class="col-md-6 col-sm-6 col-12">
                  <q-input counter maxlength="100" ref="busca" hide-bottom-space outlined v-model="state.consumivel.descricao" :label="$v.consumivel.descricao.$error ? 'Descrição (Campo Obrigatório)' : 'Descrição'" @blur="$v.consumivel.descricao.$touch" :error="$v.consumivel.descricao.$error" />
                </div>
                <div class="col-md-6 col-sm-6 col-12">
                  <q-input hide-bottom-space outlined v-model="state.consumivel.detalhes" label="Detalhes do item" :dense="dense" />
                </div>
                <div class="col-md-3 col-sm-6 col-12">
                  <q-select hide-bottom-space outlined v-model="state.consumivel.tipo" :options="['Participação', 'Produto', 'Aluguel']" label="Tipo" :dense="dense" />
                </div>
                <div v-if="state.consumivel.tipo == 'Aluguel'" class="col-md-3 col-sm-6 col-12">
                  <q-field outlined>
                    <q-checkbox v-model="state.consumivel.identificacarEquipamentoProprio" label="Identificar equipamento próprio" />
                  </q-field>
                </div>

                <div class="col-md-3 col-sm-6 col-12">
                  <q-input type="number" :step="1" hint="Zero para ilimitado" min="0" outlined v-model="state.consumivel.quantidadeDisponivel" label="Quantidade Disponivel" :dense="dense" />
                </div>
                <div class="col-md-3 col-sm-6 col-12">
                  <q-input type="number" :step="1" hint="Zero para ilimitado" min="0" outlined v-model="state.consumivel.quantidadeMaximaPorAtleta" label="Máximo por Pessoa" :dense="dense" />
                </div>
                <div class="col-md-3 col-sm-6 col-12">
                  <q-field outlined>
                    <q-checkbox v-model="state.consumivel.publicar" label="Publicar lista de inscritos" />
                  </q-field>
                </div>

                <div class="col-md-2 col-sm-6 col-12">
                  <q-input type="number" :step="1" min="0" hint="Zero para nenhum" outlined v-model="state.consumivel.grupo" label="Grupo" :dense="dense">
                    <template v-slot:append>
                      <q-btn icon="help" round flat>
                        <q-popup-proxy>
                          <q-banner> OBS: O campo (Grupo) só deve ser utilizado para restringir situações onde a pessoa deve escolher entre um consumível ou outro. Ex. (Corrida 5km) ou (Corrida 10km) ambas acontecem no mesmo dia e horário, neste caso o campo (Grupo) delas devem ser iguais e maior que 0. </q-banner>
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
              </div>

              <div>
                <div class="row q-ma-sm q-col-gutter-sm">
                  <div class="col-12">
                    <q-list bordered class="rounded-lg">
                      <q-item-label :dense="true" header class="text-xl" style="padding: 5px"
                        >Opções de Escolha
                        <q-btn color="indigo" @click="inserirOpcao" icon="add" round push glossy>
                          <q-tooltip>Inserir Nova Opção de Escolha</q-tooltip>
                        </q-btn>
                      </q-item-label>
                      <div v-for="(opcao, index) in state.consumivel.opcoesEscolha" :key="index">
                        <q-separator />
                        <q-expansion-item group="contatosGroup" v-model="opcao.open">
                          <template v-slot:header>
                            <q-item-section>
                              <q-item dense>
                                <q-item-section>
                                  {{ opcao.descricao ? opcao.descricao : "Indefinido" }}
                                </q-item-section>
                              </q-item>
                            </q-item-section>
                          </template>
                          <q-card class="col-sm-6 col-md-12 q-pa-sm">
                            <div class="row q-col-gutter-sm">
                              <div class="col-sm-6 col-md-5 col-12">
                                <q-input hide-bottom-space outlined :ref="'opcoesEscolha' + index + '.descricao'" v-model="opcao.descricao" label="Descricao" :dense="dense" @blur="$v.consumivel.opcoesEscolha.$touch" :error="$v.consumivel.opcoesEscolha.$each.$response.$data[index].descricao.$error" error-message="Campo obrigatório" />
                              </div>
                              <!-- <div class="col-sm-6 col-md-5 col-12">
                                                                <q-input type="number" hide-bottom-space outlined :ref="'opcoesEscolha'+index+'.maximoEscolha'" v-model="opcao.maximoEscolha" label="Máximo Escolha" :dense="dense" />
                                                            </div> -->
                              <div class="col-sm-6 col-md-5 col-12">
                                <q-field outlined label="Opção" stack-label counter :dense="dense">
                                  <template v-slot:control>
                                    <div class="self-center full-width no-outline" tabindex="0">
                                      <q-chip v-for="(tag, indexo) in opcao.opcoes" :key="indexo" dense removable @remove="opcao.opcoes.splice(indexo, 1)" color="primary" text-color="white">
                                        {{ tag }}
                                      </q-chip>
                                    </div>
                                  </template>
                                  <template v-slot:append>
                                    <q-btn color="primary" @click="addOpcao(opcao)" icon="add" round>
                                      <q-tooltip>Adicionar Tag</q-tooltip>
                                    </q-btn>
                                  </template>
                                </q-field>
                              </div>
                            </div>
                            <div class="col-12 q-mt-sm">
                              <q-btn color="red" outline @click="excluirOpcao(index, $event)" label="Excluir Opção" icon="delete">
                                <q-tooltip>Excluir Opção</q-tooltip>
                              </q-btn>
                            </div>
                          </q-card>
                        </q-expansion-item>
                      </div>
                    </q-list>
                  </div>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel name="arranjo" class="q-pa-none">
              <div class="row q-ma-sm q-col-gutter-sm">
                <div class="col-12">
                  <q-input style="max-width: 150px" type="number" hide-bottom-space outlined :ref="'valorPadrao'" v-model="state.consumivel.valorPadrao" label="Preço Médio" :dense="dense" @blur="$v.consumivel.valorPadrao.$touch" :error="$v.consumivel.valorPadrao.$error">
                    <template v-slot:append>
                      <q-btn icon="help" round flat>
                        <q-popup-proxy>
                          <q-banner> OBS: O (Preço médio) serve apenas para demonstrar a divisão dos valores, o valor do consumível é definido no lote de inscrição. </q-banner>
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div class="col-12">
                  <q-list bordered class="rounded-lg">
                    <q-item>
                      <q-item-section>
                        <q-item-label class="text-subtitle1 text-bold" :dense="true">Divisão</q-item-label>
                        <q-item-label class="text-subtitle2" :dense="true">
                          <span v-if="validaDivisao" class="text-subtitle1 text-positive"> <q-icon class="mr-2 p-1 rounded text-white bg-gradient-to-l from-green-400 to-green-700" name="check" />Válida</span>
                          <span v-if="!validaDivisao" class="text-subtitle1 text-negative"> <q-icon class="mr-2 p-1 rounded text-white bg-gradient-to-l from-red-400 to-red-700" name="close" />Inválida (Os valores do tipo Percentual devem totalizar 100)</span>
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn color="indigo" @click="inserirArranjo()" icon="add" label="Inserir Entidade" push glossy>
                          <q-tooltip>Inserir Entidade</q-tooltip>
                        </q-btn>
                      </q-item-section>
                    </q-item>
                    <div v-for="(arranjo, index) in state.consumivel.arranjoPagamento" :key="index">
                      <div class="col-12 q-pa-sm">
                        <div class="row q-col-gutter-sm">
                          <div class="col-sm-6 col-12">
                            <q-field :readonly="arranjo.travado" hide-bottom-space outlined label="Entidade" :ref="'entidade'" stack-label>
                              <template v-if="arranjo.entidade && arranjo.entidade.logo" v-slot:prepend>
                                <q-avatar rounded size="50px">
                                  <q-img :src="getUrlImagemThumb(arranjo.entidade.logo, 128)" :key="index"></q-img>
                                </q-avatar>
                              </template>
                              <template v-slot:control>
                                <div class="self-center full-width no-outline" tabindex="0">
                                  <q-item-label v-if="arranjo.entidade">{{
                                    `${arranjo.entidade.nomeRazao}
                                                                                                                                                (${arranjo.entidade.sigla})`
                                  }}</q-item-label>
                                </div>
                              </template>
                              <template v-slot:append>
                                <q-btn v-if="!arranjo.travado" color="indigo" icon="search" @click="selecionarEntidade(index)" round>
                                  <q-tooltip>Localizar Entidade</q-tooltip>
                                </q-btn>
                              </template>
                            </q-field>
                          </div>
                          <div class="col-xs-6 col-sm-2" :key="forceRender">
                            <q-select
                              :readonly="arranjo.travado"
                              hide-bottom-space
                              @update:model-value="
                                (value) => {
                                  forceRender++;
                                }
                              "
                              outlined
                              v-model="arranjo.financeiroConta"
                              :options="arranjo.listaConta"
                              map-options
                              :emit-value="true"
                              label="Conta Integração"
                              option-value="_id"
                              :error="$v.consumivel.arranjoPagamento.$each.$response.$data[index].financeiroConta.$error"
                              option-label="descricao"
                              :dense="dense"
                            />
                          </div>
                          <div class="col-xs-6 col-sm-2">
                            <q-select :readonly="arranjo.travado" hide-bottom-space outlined v-model="arranjo.tipo" :options="['Percentual', 'Valor']" label="Tipo" :dense="dense" />
                          </div>

                          <div class="col-xs-6 col-sm-2">
                            <q-item style="padding: 0px">
                              <q-item-section class="text-subtitle1 text-bold">
                                <q-input :readonly="arranjo.travado" type="number" hide-bottom-space outlined :ref="'arranjoPagamento' + index + '.valor'" v-model="arranjo.valor" label="Valor" :dense="dense" :error="$v.consumivel.arranjoPagamento.$each.$response.$data[index].financeiroConta.$error" />
                              </q-item-section>
                              <q-item-section side>
                                <q-btn color="red" v-if="!arranjo.travado" outline @click="excluirArranjo(index, $event)" icon="delete"></q-btn>
                              </q-item-section>
                            </q-item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-list>
                  <q-list bordered class="rounded-lg q-mt-md">
                    <span v-if="validaDivisao">
                      <q-item dense>
                        <q-item-section class="text-lg text-bold">Simulação da Divisão</q-item-section>
                      </q-item>
                      <q-separator />
                      <span v-if="state.consumivel && state.consumivel.arranjoPagamento && state.consumivel.arranjoPagamento.length > 0">
                        <span v-for="(arranjo, index) in state.consumivel.arranjoPagamento" :key="index">
                          <q-item dense>
                            <q-item-section avatar v-if="arranjo.entidade && arranjo.valor" class=""> <q-img :src="getUrlImagemThumb(arranjo.entidade.logo, 128)" :key="index"></q-img></q-item-section>
                            <q-item-section v-if="arranjo.entidade && arranjo.valor" class="">{{ arranjo.entidade.sigla }}</q-item-section>
                            <q-item-section v-if="arranjo.entidade && arranjo.valor" class="" side>{{ $geralService.numeroParaMoeda(getValor(arranjo)) }}</q-item-section>
                          </q-item>
                          <q-separator />
                        </span>
                      </span>
                      <span v-else>
                        <q-item dense>
                          <q-item-section v-if="entidadeResponsavel" class="">{{ evento.entidadeResponsavel.sigla }}</q-item-section>
                          <q-item-section v-if="entidadeResponsavel" class="" side>{{ $geralService.numeroParaMoeda(getValor(undefined)) }}</q-item-section>
                        </q-item>
                        <q-separator />
                      </span>
                      <q-item dense>
                        <q-item-section class="text-subtitle2">TAXA ADM</q-item-section>
                        <q-item-section class="text-subtitle2" side>{{ $geralService.numeroParaMoeda(valorTaxa) }}</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item class="text-xl font-bold">
                        <q-item-section class="">TOTAL</q-item-section>
                        <q-item-section class="" side>{{ $geralService.numeroParaMoeda(valorDemonstrativo) }}</q-item-section>
                      </q-item>
                    </span>
                  </q-list>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel name="imagem">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-5 col-md-4">
                  <q-card inline class="q-ma-sm">
                    <q-card-section>
                      <q-img style="width: 100%" :src="getUrlImagem" spinner-color="primary" spinner-size="82px"></q-img>
                    </q-card-section>
                    <q-separator />
                    <q-card-section>
                      <q-btn class="q-mr-sm" @click="buscarImagem" outline color="primary" label="Buscar Imagem" />
                      <q-btn class="q-mr-sm" v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && state.consumivel.imagem !== undefined && state.consumivel.imagem !== '')" @click="imageData = null" outline color="secondary" label="Ficar Sem" />
                      <q-btn class="q-mr-sm q-mt-sm" v-if="imageData !== '' && state.consumivel.imagem !== undefined && state.consumivel.imagem !== ''" @click="imageData = ''" outline color="deep-purple" label="Restaurar" />
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
import { required, helpers } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from "quasar";
import { reactive } from "vue";
import ImageUpload2 from "../ImageUpload2.vue";
import BuscarEntidade from "../BuscarEntidade.vue";
import { stat } from "fs";

const props = defineProps({
  id: { type: String, default: null },
  eventoId: { type: String, default: null },
  evento: { type: Object, default: null },
  copia: null,
});
const geral = useGeral();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const state: any = reactive({
  consumivel: {
    evento: props.eventoId,
    tipo: "Participação",
    opcoesEscolha: [],
    identificacarEquipamentoProprio: false,
    arranjoPagamento: [
      {
        entidade: props.evento.entidadeResponsavel,
        financeiroConta: "",
        open: true,
        tipo: "Percentual",
        valor: 100,
      },
    ],
    valorPadrao: 0,
    grupo: 0,
    imagem: "",
    quantidadeDisponivel: 10000,
    quantidadeMaximaPorAtleta: 1,
  },
});
const dense = ref(false);
const $q = useQuasar();
const { $geralService } = useNuxtApp();
const entidadeIndice = ref(-1);
const listaEntidades = ref<any>([]);
const forceRender = ref(0);
const totalPercentual = ref(0.0);
const totalValor = ref(0.0);
const entidadeResponsavel = ref(null);
const selectEntidades = {
  nomeRazao: 1,
  nomeFantasia: 1,
  sigla: 1,
  logo: 1,
  financeiroContaPrincipal: 1,
  taxasEventosRendimento: 1,
  tratamentoMasculino: 1,
  filiacoesEntidades: 1,
};

// GO valida
const validations = {
  consumivel: {
    descricao: {
      required,
    },
    valorPadrao: {
      required,
    },
    opcoesEscolha: {
      $each: helpers.forEach({
        descricao: {
          required,
        },
      }),
    },
    arranjoPagamento: {
      $each: helpers.forEach({
        entidade: {
          required,
        },
        valor: {
          required,
        },
        financeiroConta: {
          required,
        },
      }),
    },
  },
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

// watch(
//   () => state.consumivel.percurso,
//   async (value) => {
//     // console.log("percurso", value);
//     validaTaxasEventoRendimento();

//   }
// );

const changePercurso = async (value: any) => {
  // console.log('dfdsfsdfsdfsdfsdfsdf');
  // console.log('valor', value);
  validaTaxasEventoRendimento();
};

const validaTaxasEventoRendimento = async () => {
  if (state.consumivel.percurso) {
    const percurso = listaPercurso.value.find((x: any) => x._id == state.consumivel.percurso);
    // console.log(percurso);
    state.consumivel.descricao = percurso.descricao;
    state.consumivel.detalhes = percurso.detalhes;

    // console.log("evento tipoEvento", props.evento.tipoEvento);
    // console.log("evento tipoEvento", props.evento.abrangencia);
    if (props.evento.tipoEvento === "Rendimento") {
      if (props.evento.abrangencia == "Municipal" || props.evento.abrangencia == "Estadual" || props.evento.abrangencia == "Nacional" || props.evento.abrangencia == "Regional") {
        if (percurso) {
          // console.log("entidadeReguladora", percurso.esporte.entidadeReguladora);
          state.consumivel.arranjoPagamento = [];

          let totalPercentual = 100;
          percurso.esporte.entidadeReguladora.taxasEventosRendimento.forEach((taxa: any) => {
            if (taxa.abrangencia == props.evento.abrangencia) {
              state.consumivel.arranjoPagamento.push({
                entidade: percurso.esporte.entidadeReguladora,
                financeiroConta: percurso.esporte.entidadeReguladora.financeiroContaPrincipal,
                open: true,
                tipo: taxa.tipo,
                valor: taxa.valor,
                travado: true,
              });
              if (taxa.tipo == "Percentual") {
                totalPercentual -= taxa.valor;
              }
            }
          });

          for (let index = 0; index < percurso.esporte.entidadesReguladorasEstados.length; index++) {
            const ere = percurso.esporte.entidadesReguladorasEstados[index];
            if (ere.uf == props.evento.endereco.uf && ere.entidade.financeiroContaPrincipal) {
              ere.entidade.taxasEventosRendimento.forEach((taxa: any) => {
                if (taxa.abrangencia == props.evento.abrangencia) {
                  state.consumivel.arranjoPagamento.push({
                    entidade: ere.entidade,
                    financeiroConta: ere.entidade.financeiroContaPrincipal,
                    open: true,
                    tipo: taxa.tipo,
                    valor: taxa.valor,
                    travado: true,
                  });
                  if (taxa.tipo == "Percentual") {
                    totalPercentual -= taxa.valor;
                  }
                }
              });
            }
          }

          state.consumivel.arranjoPagamento.push({
            entidade: props.evento.entidadeResponsavel,
            financeiroConta: "",
            open: true,
            tipo: "Percentual",
            valor: totalPercentual,
          });

          // console.log("entidadeReguladoraEstados", percurso.esporte.entidadesReguladorasEstados);
        }
      }
    } else {
      removeTaxasRendimento();
    }
  } else {
    removeTaxasRendimento();
  }
  ajustaListaConta();
  $q.notify({
    color: "warning",
    position: "top",
    icon: "check",
    caption: "Por favor, verifique na aba (Divisão dos Valores).",

    multiLine: true,
    message: "Divisão dos valores alterada!",
    actions: [
      {
        color: "white",
        label: "Verificar",
        handler: () => {
          tab.value = "arranjo";
        },
      },
    ],
  });
};

const removeTaxasRendimento = async () => {
  state.consumivel.arranjoPagamento = [
    {
      entidade: props.evento.entidadeResponsavel,
      financeiroConta: props.evento.entidadeResponsavel.financeiroContaPrincipal,
      open: true,
      tipo: "Percentual",
      valor: 100,
    },
  ];
};

onBeforeMount(async () => {
  if (!props.evento.entidadeResponsavel) {
    setTimeout(async () => {
      await cancel();
      // navigateTo('/login');
    }, 1);
  }

  if (!props.evento.entidadeResponsavel.financeiroContaPrincipal) {
    $q.notify({
      color: "warning",
      position: "top",
      icon: "check",
      message: "A entidade resposável pelo evento não possui uma conta financeira para integração!",
    });
    setTimeout(async () => {
      await cancel();
      // navigateTo('/login');
    }, 1);
  }

  await getListaPercurso();

  if (props.id) {
    const ret: any = await useCustomFetch(
      "consumivel/getPopulate",
      "post",
      {
        filtro: {
          _id: props.id,
        },
        populateObj: [
          {
            path: "arranjoPagamento",
            populate: {
              path: "entidade",
              select: {
                nomeFantasia: 1,
                financeiroConta: 1,
                finanveiroContaPrincipal: 1,
                nomeRazao: 1,
                logo: 1,
                filiacoesEntidades: 1,
                sigla: 1,
              },
            },
          },
        ],
      },
      undefined
    );
    if (ret.valido) {
      state.consumivel = ret.data[0];
      if (props.copia) {
        state.consumivel.titulo = state.consumivel.titulo + " (Cópia)";
        state.consumivel._id = undefined;
        state.consumivel.__v = undefined;
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
  ajustaListaConta();
});

const tab = ref("dados");
const imageData = ref<any>("");
const imageUrl = ref("");
const listaPercurso = ref<any>([]);

const getUrlImagem = computed(() => {
  return $geralService.getUrlImagem(imageData.value, state.consumivel, "imagem", imageUrl.value);
});

const getUrlImagemThumb = (caminho: String, tamanho: number) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: tamanho !== undefined ? tamanho : 128,
  });
};

const taxaAzimuteCerto = computed<number>(() => {
  if (props.evento.entidadeResponsavel) {
    if (props.evento.taxaAzimuteCerto) {
      return props.evento.taxaAzimuteCerto;
    } else {
      return props.evento.entidadeResponsavel.taxaAzimuteCerto;
    }
  } else {
    return 6;
  }
});

// @ts-ignore
const valorDemonstrativo = computed<number>(() => {
  const valor: number = parseFloat(parseFloat(state.consumivel.valorPadrao).toFixed(2));
  if (props.evento.entidadeResponsavel) {
    if (props.evento.taxaAzimuteCertoAbsorver) {
      return valor;
    } else {
      return parseFloat((valor + (valor * taxaAzimuteCerto.value) / 100).toFixed(2));
    }
  } else {
    return 0;
  }
});

const valorTaxa = computed<number>(() => {
  const valor: number = parseFloat(parseFloat(state.consumivel.valorPadrao).toFixed(2));
  if (valorDemonstrativo.value) {
    return parseFloat(((valor * taxaAzimuteCerto.value) / 100).toFixed(2));
  } else {
    return 0;
  }
});

const valorDescontadoTaxa = computed<number>(() => {
  if (valorDemonstrativo.value) {
    return parseFloat((valorDemonstrativo.value - valorTaxa.value).toFixed(2));
  } else {
    return 0;
  }
});
const saldoPercentualMenosValor = computed<number>(() => {
  if (valorDescontadoTaxa.value) {
    return parseFloat((valorDescontadoTaxa.value - totalValor.value).toFixed(2));
  } else {
    return 0;
  }
});

const validaDivisao = computed<Boolean>(() => {
  totalPercentual.value = 0.0;
  totalValor.value = 0.0;

  if (state.consumivel.arranjoPagamento.length > 0) {
    for (let index = 0; index < state.consumivel.arranjoPagamento.length; index++) {
      // eslint-disable-next-line prefer-const
      let arranjo = state.consumivel.arranjoPagamento[index];
      if (arranjo.tipo === "Percentual") {
        totalPercentual.value += parseFloat(arranjo.valor);
      } else {
        totalValor.value += parseFloat(arranjo.valor);
      }
    }
    if (totalPercentual.value !== 100.0) {
      return false;
    }

    if (totalValor.value >= state.consumivel.valorPadrao) {
      return false;
    }
  } else {
    return false;
  }
  return true;
});

const selecionarEntidade = async (index: number) => {
  // if (listaEntidades.value.length == 0) {
  //     const ret1: any = await useCustomFetch('entidade/getPopulate', 'post', {
  //         filtro: {
  //             lixo: false,
  //             'esportes': { '$in': geral.entidade.esportes }
  //         },
  //         select: {
  //             nomeRazao: 1,
  //             nomeFantasia: 1,
  //             sigla: 1,
  //             logo: 1,
  //             tratamentoMasculino: 1,
  //             filiacoesEntidades: 1,
  //         },
  //         populateObj: []
  //     }, undefined);

  //     if (ret1.valido) {
  //         listaEntidades.value = ret1.data
  //     }
  // }

  entidadeIndice.value = index;

  $q.dialog({
    component: BuscarEntidade,
    persistent: true,
    componentProps: {
      select: selectEntidades,
    },
  })
    .onOk(async (data) => {
      confirmSelecaoEntidade(data);
    })
    .onCancel(() => {});
};

const confirmSelecaoEntidade = (entidade: any) => {
  if (entidade.financeiroContaPrincipal || entidade._id == props.evento.entidadeResponsavel._id) {
    Object.assign(state.consumivel.arranjoPagamento[entidadeIndice.value].entidade, entidade);
    ajustaListaConta();
  } else {
    $q.notify({
      color: "warning",
      position: "top",
      icon: "check",
      message: "A entidade selecionada não possui uma conta financeira selecionada para integração!",
    });
  }
};

const ajustaListaConta = async () => {
  for (let index = 0; index < state.consumivel.arranjoPagamento.length; index++) {
    const element = state.consumivel.arranjoPagamento[index];
    if (element.entidade && !element.listaConta) {
      // traz uma lista das contas somente se entidade selecionada for a entidade logada, senão traz somente a conta principal da entidade selecionada na lista.
      const ret = await useCustomFetch(
        "financeiroConta/getPopulate",
        "post",
        {
          filtro: {
            lixo: false,
            entidade: element.entidade._id,
            _id: element.entidade._id == geral.entidade._id ? undefined : element.entidade.financeiroContaPrincipal,
            tipo: { $in: ["Conta Corrente", "Conta Poupança"] },
          },
          select: { descricao: 1 },
        },
        undefined
      );
      if (ret.valido) {
        element.listaConta = ret.data;
        if (!element.financeiroConta) {
          element.financeiroConta = element.entidade.financeiroContaPrincipal;
        }
      } else {
        element.listaConta = [];
      }
    } else {
      // console.log("Não achou");
    }
  }
};

const buscarImagem = () => {
  $q.dialog({
    component: ImageUpload2,
    persistent: true,
    componentProps: {
      winit: 300,
      hinit: 300,
    },
  })
    .onOk(async (data) => {
      confirmImageUpload(data.data, data.fileName);
    })
    .onCancel(() => {});
};

const confirmImageUpload = (blobImage: any, fileName: string) => {
  if (fileName !== undefined && fileName !== null) {
    imageData.value = blobImage;
    imageUrl.value = window.URL.createObjectURL(blobImage);
  }
};

const getListaPercurso = async () => {
  try {
    const ret = await useCustomFetch(
      "percurso/getPopulate",
      "post",
      {
        filtro: {
          lixo: false,
          evento: props.eventoId,
        },
        populateObj: [
          {
            path: "esporte",
            select: { entidadeReguladora: 1, entidadesReguladorasEstados: 1 },
            populate: [
              { path: "entidadeReguladora", select: selectEntidades },
              { path: "entidadesReguladorasEstados.entidade", select: selectEntidades },
            ],
          },
        ],
      },
      undefined
    );
    if (ret.valido) {
      listaPercurso.value = ret.data;
    } else {
      listaPercurso.value = [];
    }
  } catch (error) {}
};

const inserirOpcao = () => {
  for (let index = 0; index < state.consumivel.opcoesEscolha.length; index++) {
    state.consumivel.opcoesEscolha[index].open = false;
  }
  state.consumivel.opcoesEscolha.push({
    descricao: "",
    opcoes: [],
    // maximoEscolha: 1,
    open: true,
  });
};

const inserirArranjo = () => {
  for (let index = 0; index < state.consumivel.arranjoPagamento.length; index++) {
    state.consumivel.arranjoPagamento[index].open = false;
  }
  state.consumivel.arranjoPagamento.push({
    descricao: "",
    tipo: "Percentual",
    entidade: {},
    financeiroConta: null,
    valor: null,
    open: true,
  });
  $v.value.consumivel.arranjoPagamento.$touch();

  selecionarEntidade(state.consumivel.arranjoPagamento.length - 1);
};

const getValor = (arranjo: any) => {
  if (arranjo) {
    if (arranjo.tipo === "Percentual") {
      return parseFloat(((saldoPercentualMenosValor.value * parseFloat(arranjo.valor)) / 100).toFixed(2));
    } else {
      return parseFloat(parseFloat(arranjo.valor).toFixed(2));
    }
  } else {
    return valorDescontadoTaxa.value;
  }
};

const excluirOpcao = (index: number, event: any) => {
  event.preventDefault();
  state.consumivel.opcoesEscolha.splice(index, 1);
};

const excluirArranjo = (index: number, event: any) => {
  event.preventDefault();
  state.consumivel.arranjoPagamento.splice(index, 1);
};

const addOpcao = (opcao: any) => {
  $q.dialog({
    title: "Adicionar Opção",
    message: "Digite uma Opção por vez",
    prompt: {
      model: "",
      type: "text", // optional
    },
    cancel: true,
  }).onOk((data) => {
    if (data) {
      opcao.opcoes.push(data);
    }
  });
};

const beforeSave = async () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Validando dados... Aguarde!",
    messageColor: "white",
  });
  // $v.value.consumivel.vinculos.$touch();
  $v.value.consumivel.$touch();

  // if ($v.value.consumivel.$error || !(imageData.value || state.consumivel.imagem)) {
  if ($v.value.consumivel.$error) {
    $q.loading.hide();
    $q.notify({
      color: "warning",
      position: "top",
      icon: "check",
      message: "Preeencha todos os campos obrigatórios para salvar!",
    });
    return;
  }

  if (await verificaExisteConsumivel()) {
    $q.loading.hide();
    return;
  }

  // if ($v.value.consumivel.vinculos.$error) {
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

  delete state.consumivel.__v;

  const newconsumivel = JSON.parse(JSON.stringify(state.consumivel));

  if (imageData.value !== "") {
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Fazendo upload de imagem...Aguarde!",
      messageColor: "white",
    });
  }

  $geralService.executaUpload(newconsumivel, "imagem", imageData.value, inserir.value, "jpg", "consumivels/imagens/", save, undefined);
};

// verifica se já existe um consumivel com o mesmo percurso
const verificaExisteConsumivel = async () => {
  if (state.consumivel.percurso) {
    const ret: any = await useCustomFetch(
      "consumivel/getPopulate",
      "post",
      {
        filtro: {
          lixo: false,
          _id: props.id ? { $ne: props.id } : undefined,
          evento: props.eventoId,
          percurso: state.consumivel.percurso,
        },
        populateObj: [],
        limit: 1,
      },
      undefined
    );
    if (ret.valido) {
      if (ret.data.length > 0) {
        $q.notify({
          color: "warning",
          position: "top",
          icon: "check",
          message: "Já existe um consumível com o mesmo percurso!",
        });
        return true;
      }
    }
  }
  return false;
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
const save = async (newconsumivel: any, nomeTempFile: any) => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Salvando registro...Aguarde!",
    messageColor: "white",
  });
  let url = "consumivel";
  let tipo = "post";
  if (!inserir.value) {
    url += "/" + props.id;
    tipo = "put";
  }

  const ret: any = await useCustomFetch(url, tipo, newconsumivel, undefined);

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
    $q.loading.hide();
    if (nomeTempFile) {
      $geralService.deleteImagem(nomeTempFile);
      $q.loading.hide();
    }
  }
};
</script>
