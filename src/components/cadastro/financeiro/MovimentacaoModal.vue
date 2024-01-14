<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-indigo-700 to-sky-400" name="swap_horiz"
            size="30px" />

          <q-toolbar-title>{{ inserir ? "Inserir - " : "Visualizar" }} Movimentação</q-toolbar-title>
          <!-- GO btnSave -->


          <q-btn v-if="inserir" push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
            aria-label="Salvarmargin-extra - " @click="beforeSave()" :label="$q.screen.gt.xs ? 'Salvar' : undefined"
            icon="save"></q-btn>
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
            :label="$q.screen.gt.xs ? (inserir?'Cancelar':'Fechar') : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <q-tabs class="" v-model="tab" :active-color="$q.dark.isActive ? 'info' : 'primary'" indicator-color="primary"
            align="justify" narrow-indicator>
            <q-tab default name="dados" icon="line_style" label="Informações" />
            <q-tab name="documento" icon="image" label="Documento" />
            <q-tab name="comprovante" icon="image" label="Comprovante" />
          </q-tabs>
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="dados">
              <div class="q-ma-sm">
                <div class="row q-col-gutter-sm">
                  <div class="col-md-3 col-sm-6 col-12">
                    <q-field :readonly="!inserir" hide-bottom-space outlined label="Tipo" :dense="inserir" stack-label>
                      <template v-slot:control>
                        <div  v-if="inserir" class="col-md-4 col-sm-6 col-12 self-center full-width no-outline row" tabindex="0">
                          <q-radio @update:model-value="changeRadio"
                            :readonly="state.financeiroMovimentacao.status === 'Concluído'" class="col-6"
                            v-model="state.financeiroMovimentacao.tipo" val="D" label="Débito" />
                          <q-radio @update:model-value="changeRadio"
                            :readonly="state.financeiroMovimentacao.status === 'Concluído'" class="col-6"
                            v-model="state.financeiroMovimentacao.tipo" val="C" label="Crédito" />
                        </div>
  <div v-if="!inserir" class="">
                          {{ state.financeiroMovimentacao.tipo == "D" ? "Débito" : "Crédito" }}
                        </div>
                      </template>
                      
                    </q-field>
                  </div>
                  <div class="col-md-6 col-sm-6 col-12">
                    <q-input :readonly="!inserir"
                      hide-bottom-space outlined v-model="state.financeiroMovimentacao.descricao" label="Descrição"
                      :dense="dense" @blur="$v.financeiroMovimentacao.descricao.$touch"
                      :error="$v.financeiroMovimentacao.descricao.$error" error-message="Campo obrigatório" />
                  

                  </div>
                  <div class="col-md-3 col-sm-6 col-12">
                    <q-input :readonly="!inserir" hide-bottom-space
                      type="number" outlined v-model="state.financeiroMovimentacao.valor" label="Valor Documento"
                      :dense="dense" prefix="R$" @blur="$v.financeiroMovimentacao.valor.$touch"
                      :error="$v.financeiroMovimentacao.valor.$error" error-message="Campo obrigatório" />
                      

                  </div>
                   
                  <!-- <div v-if="inserir === false" class="col-md-3 col-sm-6 col-12">
                                        <q-select :readonly="state.financeiroMovimentacao.status==='Concluído'" hide-bottom-space outlined v-model="state.financeiroMovimentacao.status" :options="status" label="Status" :dense="dense" />
                                    </div> -->
                </div>
                <div class="row q-col-gutter-sm q-mt-sm">
                  <div class="col-md-2 col-sm-6 col-12">
                    <q-input :readonly="!inserir" hide-bottom-space outlined
                      hint="ex. NF 0057" v-model="state.financeiroMovimentacao.documento" label="Documento"
                      :dense="dense" />
                  </div>
                  <div class="col-md-3 col-sm-6 col-12">
                    <q-select :readonly="!inserir" hide-bottom-space outlined
                      v-model="state.financeiroMovimentacao.conta" label="Conta" :dense="dense" option-label="descricao"
                      :emit-value="true" map-options option-value="_id" :options="listaConta"
                      @blur="$v.financeiroMovimentacao.conta.$touch" :error="$v.financeiroMovimentacao.conta.$error"
                      error-message="Campo obrigatório">
                      <template v-if="inserir" v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-select>
                  </div>
                  <div class="col-md-3 col-sm-6 col-12">
                    <q-select :readonly="!inserir" hide-bottom-space outlined
                      v-model="state.financeiroMovimentacao.planoDeConta"
                      :option-disable="opt => opt.especificacao === 'Sintética'" @update:model-value="inputPlanoConta"
                      label="Plano de Conta" :dense="dense" map-options :option-label="getDescricaoPlanoConta"
                      :emit-value="true" option-value="_id" :options="getListaPlanoFiltro"
                      @blur="$v.financeiroMovimentacao.planoDeConta.$touch"
                      :error="$v.financeiroMovimentacao.planoDeConta.$error" error-message="Campo obrigatório">
                      <template v-if="inserir" v-slot:append>
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
                    <q-field :readonly="!inserir" outlined label="Emissão" stack-label>
                      {{ $geralService.getDataHoraFormatada(state.financeiroMovimentacao.dataEmissao) }}
                    </q-field>
                  </div>
                  <div v-if="!inserir" class="col-md-2 col-sm-6 col-12">
                    <q-field :readonly="!inserir" outlined label="Saldo Anterior" stack-label>
                      R$ {{ $geralService.numeroParaMoeda(state.financeiroMovimentacao.saldoAnterior) }}
                    </q-field>
                  </div>
                  <div v-if="!inserir" class="col-md-2 col-sm-6 col-12">
                    <q-field :readonly="!inserir" outlined label="Saldo Após o Lançamento" stack-label>
                      R$ {{ $geralService.numeroParaMoeda(state.financeiroMovimentacao.saldoAtual) }}
                    </q-field>
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
                    <q-card-section v-if="state.financeiroMovimentacao.status !== 'Concluído'">
                      <q-btn icon="attach_file" class="q-mr-sm" @click="filea.$el.click()" outline color="primary"
                        label="Buscar" />
                      <q-btn class="q-mr-sm" v-if="(novoDoc) || (state.financeiroMovimentacao.documentoImagem)"
                        @click="novoDoc = null; novoDocumento = null; state.financeiroMovimentacao.documentoImagem = '';"
                        outline color="secondary" label="Ficar Sem" />
                      <q-btn class="q-mr-sm"
                        v-if="!inserir && (state.financeiroMovimentacao.documentoImagem != documentoPadrao || (novoDoc))"
                        @click="novoDoc = null; novoDocumento = null; state.financeiroMovimentacao.documentoImagem = documentoPadrao"
                        outline color="deep-purple" label="Restaurar" />
                    </q-card-section>
                    <q-card-section>
                      <q-img v-if="!documentoIsPdf && (novoDoc || state.financeiroMovimentacao.documentoImagem)"
                        :src="novoDoc ? novoDoc : ($geralService.configuracoes.BASE_S3 + state.financeiroMovimentacao.documentoImagem)"
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
                    <q-card-section v-if="state.financeiroMovimentacao.status !== 'Concluído'">
                      <q-btn icon="attach_file" class="q-mr-sm" @click="fileb.$el.click()" outline color="primary"
                        label="Buscar" />
                      <q-btn class="q-mr-sm" v-if="(novoComp) || (state.financeiroMovimentacao.comprovanteImagem)"
                        @click="novoComp = null; novoComprovante = null; state.financeiroMovimentacao.comprovanteImagem = '';"
                        outline color="secondary" label="Ficar Sem" />
                      <q-btn class="q-mr-sm"
                        v-if="!inserir && (state.financeiroMovimentacao.comprovanteImagem != comprovantePadrao || (novoComp))"
                        @click="novoComp = null; novoComprovante = null; state.financeiroMovimentacao.comprovanteImagem = comprovantePadrao"
                        outline color="deep-purple" label="Restaurar" />
                    </q-card-section>
                    <q-separator v-if="state.financeiroMovimentacao.status !== 'Concluído'" />
                    <q-card-section>
                      <q-img v-if="!comprovanteIsPdf && (novoComp || state.financeiroMovimentacao.comprovanteImagem)"
                        :src="novoComp ? novoComp : ($geralService.configuracoes.BASE_S3 + state.financeiroMovimentacao.comprovanteImagem)"
                        spinner-color="primary" spinner-size="82px"></q-img>
                      <!-- <q-pdfviewer v-if="comprovanteIsPdf" v-model="show" :src="novoComp ? novoComp : ($configuracoes.BASE_S3 + state.financeiroMovimentacao.comprovanteImagem)" type="pdfjs" content-class="fit container" inner-content-class="fit container" /> -->
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
  conta: null
});


defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const state: any = reactive({
  financeiroMovimentacao: {
    _id: null,
    descricao: null,
    entidade: null,
    pessoa: null,
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
const changeRadio = () => {
  state.financeiroMovimentacao.planoDeConta = null
}

// GO valida
const validations = {
  financeiroMovimentacao: {
    conta: {
      required
    },
    pessoa: {
      required
    },
    planoDeConta: {
      required
    },
    descricao: {
      required
    },
    documento: {
      required
    },
    sequencial: {
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
    return state.financeiroMovimentacao.documentoImagem ? state.financeiroMovimentacao.documentoImagem.split('.')[1] === 'pdf' : false;
  }
});
const comprovanteIsPdf = computed(() => {
  if (novoComprovante.value) {
    return novoComprovante.value.name.split('.')[1] === 'pdf';
  } else {
    return state.financeiroMovimentacao.comprovanteImagem ? state.financeiroMovimentacao.comprovanteImagem.split('.')[1] === 'pdf' : false;
  }
});

const getListaPlanoFiltro = computed(() => {
  const newArray = [];
  for (let index = 0; index < listaPlanos.value.length; index++) {
    const plano = listaPlanos.value[index];
    if (plano.tipo === state.financeiroMovimentacao.tipo) {
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
        state.financeiroMovimentacao.documentoImagem = documentoImagem.value;
        documentoImagem.value = 'img';
      } else if (extensao === extensaoPDF) {
        state.financeiroMovimentacao.documentoImagem = documentoImagem.value;
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
  state.financeiroMovimentacao.planoDeContaArvore = montaArvore(value);
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

const aguarde = ref(true);
onBeforeMount(async () => {

  await setListaConta();
  await setListaPlano();
  if (props.id) {
    const ret: any = await useCustomFetch('financeiroMovimentacao/getPopulate', 'post', {
      filtro: {
        _id: props.id
      },
      populateObj: []
    }, undefined);
    if (ret.valido) {
      state.financeiroMovimentacao = ret.data[0];
      if (props.copia) {
        state.financeiroMovimentacao.descricao = state.financeiroMovimentacao.descricao + " (Cópia)";
        state.financeiroMovimentacao._id = undefined;
        state.financeiroMovimentacao.__v = undefined;
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
    state.financeiroMovimentacao = {
      _id: await $geralService.getId(),
      entidade: geral.entidade._id,
      pessoa: geral.pessoa._id,
      tipo: 'D',
      sequencial: 0,
      conta: props.conta,
      planoDeConta: '',
      status: 'Aberto',
      documentoImagem: '',
      comprovanteImagem: '',
      dataEmissao: new Date().toISOString(),
    };
    inserir.value = true;
  }
  aguarde.value = false;
});

const imageData = ref<any>('');
const imageUrl = ref('');


const getUrlImagem = computed(() => {
  return $geralService.getUrlImagem(imageData.value, state.financeiroMovimentacao, 'logo', imageUrl.value);
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

const beforeSave = async () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: 'white',
    spinnerSize: 60,
    message: 'Validando dados... Aguarde!',
    messageColor: 'white'
  });
  // $v.value.financeiroMovimentacao.vinculos.$touch();
  $v.value.financeiroMovimentacao.$touch();

  if ($v.value.financeiroMovimentacao.$error) {

    $q.loading.hide();
    $q.notify({
      color: 'warning',
      position: 'top',
      icon: 'check',
      message: 'Preeencha todos os campos obrigatórios para salvar!'
    });
    return;

  }

  if (state.financeiroMovimentacao.status !== 'Aberto') {
    state.financeiroMovimentacao.pessoaEncerramento = geral.pessoa._id;
    state.financeiroMovimentacao.dataEncerramento = new Date();
  }

  delete state.financeiroMovimentacao.__v;


  const newFinanceiroMovimentacao = JSON.parse(JSON.stringify(state.financeiroMovimentacao));

  filesTemp.value = [];

  const retUD = await uploadDocumento(newFinanceiroMovimentacao);
  if (retUD) {
    // Em caso de alteração que exista um documento antigo que foi alterado ou forçado a ficar vazio, o arquivo é excluído.
    if (!inserir.value && documentoPadrao.value && newFinanceiroMovimentacao.documentoImagem !== documentoPadrao.value) {
      $geralService.deleteImagem(documentoPadrao.value, undefined);
    }

    const retUC = await uploadComprovante(newFinanceiroMovimentacao);

    if (retUC) {
      // Em caso de alteração que exista um comprovante antigo que foi alterado ou forçado a ficar vazio, o arquivo é excluído.
      if (!inserir.value && comprovantePadrao.value && newFinanceiroMovimentacao.comprovanteImagem !== comprovantePadrao.value) {
        $geralService.deleteImagem(comprovantePadrao.value, undefined);
      }
      save(newFinanceiroMovimentacao, null);
    }
  }

};
const getPlanoDeContaIdentificacao = () => {
  for (let index = 0; index < listaPlanos.value.length; index++) {
    const element = listaPlanos.value[index];
    if (element._id === state.financeiroMovimentacao.planoDeConta) {
      return element.identificador;
    }
  }
  return undefined;
};

const uploadDocumento = async (newFinanceiroMovimentacao: any) => {
  if (novoDocumento.value) {
    const caminho = geral.entidade._id + '/FinanceiroMovimentacao/' + newFinanceiroMovimentacao._id + '/imagens/';
    const nome = await novoDocumento.value.name;
    const tipo = await nome.split('.')[1];
    const randonName = $geralService.getRandomName() + '.' + tipo;
    if (await $geralService.uploadFileAsync(
      novoDocumento.value,
      caminho,
      randonName,
      undefined
    )) {
      newFinanceiroMovimentacao.documentoImagem = caminho + randonName;
      filesTemp.value.push(randonName);
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

const uploadComprovante = async (newFinanceiroMovimentacao: any) => {
  if (novoComprovante.value) {
    const caminho = geral.entidade._id + '/FinanceiroMovimentacao/' + newFinanceiroMovimentacao._id + '/imagens/';
    const tipo = novoComprovante.value.name.split('.')[1];
    const randonName = $geralService.getRandomName() + '.' + tipo;
    if (await $geralService.uploadFileAsync(
      novoComprovante,
      caminho,
      randonName,
      undefined
    )) {
      newFinanceiroMovimentacao.comprovanteImagem = caminho + randonName;
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
const save = async (newFinanceiroMovimentacao: any, nomeTempFile: any) => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: 'white',
    spinnerSize: 60,
    message: 'Salvando registro...Aguarde!',
    messageColor: 'white'
  });


  newFinanceiroMovimentacao.saldoAnterior = 0;

  const retUltimoMovimento = await $geralService.getUltimaMovimentacao(newFinanceiroMovimentacao.conta);
  if (retUltimoMovimento.valido) {
    if (retUltimoMovimento.data.length > 0) {
      newFinanceiroMovimentacao.saldoAnterior = retUltimoMovimento.data[0].saldoAtual;
    }
  } else {
    return; // interrompe o salvamento;
  }

  if (newFinanceiroMovimentacao.tipo === 'D') {
    newFinanceiroMovimentacao.saldoAtual = newFinanceiroMovimentacao.saldoAnterior - newFinanceiroMovimentacao.valor;
  } else {
    newFinanceiroMovimentacao.saldoAtual = newFinanceiroMovimentacao.saldoAnterior + parseFloat(newFinanceiroMovimentacao.valor);
  }



  let url = 'financeiroMovimentacao';
  let tipo = 'post';
  if (!inserir.value) {
    url += ('/' + props.id);
    tipo = 'put';
  }

  const ret: any = await useCustomFetch(url, tipo, newFinanceiroMovimentacao, undefined);

  if (ret.valido) {
    await useCustomFetch('financeiroConta/' + newFinanceiroMovimentacao.conta, 'put', {
      saldoAtual: newFinanceiroMovimentacao.saldoAtual
    }, 'Atualizando saldo na conta!');

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

