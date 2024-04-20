<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-img v-if="getUrlImagem" class="rounded-borders" style="width: 48px" :ratio="32 / 32" :src="getUrlImagem"></q-img>
          <q-icon v-else name="person" size="30px" />
          <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Cadastro</q-toolbar-title>
          <!-- GO btnSave -->
          <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive" aria-label="Salvar" @click="beforeSave" :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel" :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <q-tabs v-model="tab" class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
            <q-tab default name="dados" icon="line_style" label="Informações" />
            <q-tab name="acesso" icon="lock" label="Acesso" />
            <q-tab name="foto" icon="image" label="Foto" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="dados">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-12">
                  <div class="col-sm-12 col-12">
                    <p class="caption mb-2">Geral</p>
                  </div>

                  <div class="row q-col-gutter-sm">
                    <div class="col-sm-6 col-12">
                      <!-- GO Nome -->
                      <q-input hide-bottom-space outlined label="Nome" maxlength="200" ref="pessoa.nome" v-model="state.pessoa.nome" @blur="$v.pessoa.nome.$touch" :error="$v.pessoa.nome.$error" :error-message="mensagemRequired" />
                    </div>
                    <!-- GO Apelido -->
                    <div class="col-sm-6 col-12">
                      <q-input hide-bottom-space outlined label="Apelido (Como você gosta de ser chamado)" maxlength="50" ref="pessoa.apelido" v-model="state.pessoa.apelido" @blur="$v.pessoa.apelido.$touch" :error="$v.pessoa.apelido.$error" :error-message="mensagemRequired" />
                    </div>
                    <!-- GO RG -->
                    <div class="col-sm-6 col-md-3 col-12">
                      <q-input hide-bottom-space outlined label="RG (Somente Números)" mask="###########" maxlength="12" ref="pessoa.rg" v-model="state.pessoa.rg" />
                    </div>
                    <!-- GO CPF -->
                    <div class="col-sm-6 col-md-3 col-12">
                      <q-input hide-bottom-space outlined label="CPF" unmasked-value mask="###.###.###-##" ref="pessoa.cpf" v-model="state.pessoa.cpf" @blur="$v.pessoa.cpf.$touch" :error="$v.pessoa.cpf.$error" :error-message="$v.pessoa.cpf.$validator === 'minLength' ? 'O mínimo é 11 números!' : mensagemRequired" />
                    </div>
                    <!-- GO Nascimento -->
                    <div class="col-sm-6 col-md-3 col-12">
                      <CinputDate hide-bottom-space outlined :error="$v.pessoa.nascimento.$error" :error-message="'Data inválida'" :dense="false" v-model="state.pessoa.nascimento" label="Nascimento" />
                    </div>
                    <!-- GO Seguro -->
                    <div class="col-sm-6 col-md-3 col-12">
                      <CinputDate hide-bottom-space outlined :error-message="'Data inválida'" :dense="false" v-model="state.pessoa.validadeSeguro" label="Validade Seguro" />
                    </div>
                   
                     <!-- GO NomeDaMae -->
                    <div class="col-sm-6 col-md-3 col-12">
                      <q-input hide-bottom-space outlined label="Nome da Mãe" maxlength="100" ref="pessoa.nomeDaMae" v-model="state.pessoa.nomeDaMae" />
                    </div>
                     <!-- GO CadÚnico -->
                    <div class="col-sm-6 col-md-3 col-12">
                                <q-checkbox
                                  v-model="state.pessoa.cadUnico"
                                  label="Inscrição Social (CadÚnico)"
                                />
                    </div>

                    <!-- <div class="col-sm-6 col-md-3 col-12">
                      <q-select hide-bottom-space outlined v-model="state.pessoa.lateralidade" label="Lateralidade" :options="listaLateralidade" emit-value />
                    </div> -->
                  </div>
                  <!-- GO Telefones -->
                  <div class="row q-col-gutter-sm q-pt-md">
                    <div class="col-sm-12 col-12">
                      <q-item-label :dense="true"
                        ><span class="caption"
                          >Telefones
                          <q-btn color="primary" class="btn-scale" @click="inserirTelefone" round size="sm" icon="add">
                            <q-tooltip class="text-body2">Inserir Telefone</q-tooltip>
                          </q-btn>
                        </span>
                      </q-item-label>
                    </div>
                    <div class="col-12 col-md-12">
                      <q-list bordered class="rounded-xl">
                        <div v-for="(telefone, index) in state.pessoa.telefones" :key="index">
                          <q-expansion-item group="telefonesGroup" dense dense-toggle expand-separator v-model="telefone.open">
                            <template v-slot:header>
                              <q-item-section>
                                <q-item dense class="pl-0">
                                  <q-item-section>
                                    <q-item-label>{{ telefone.tipo ? telefone.tipo + ": " : "" }} {{  (telefone.numero ? "" + telefone.numero : "") }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </q-item-section>
                              <q-item-section avatar v-if="state.pessoa.telefones.length > 1" right>
                                <q-btn
                                  color="red"
                                  @click="
                                    (evt: any) => {
                                      excluirTelefone(index);
                                      evt.preventDefault();
                                    }
                                  "
                                  size="xs"
                                  icon="delete"
                                  round
                                >
                                  <q-tooltip class="text-body2">Excluir o telefone</q-tooltip>
                                </q-btn>
                              </q-item-section>
                            </template>

                            <div class="row q-col-gutter-sm q-pa-md">
                              <div class="col-sm-3 col-md-2 col-12">
                                <!-- GO Tipo Telefone -->
                                <q-select hide-bottom-space outlined :dark="$q.dark.isActive" transition-show="flip-up" transition-hide="flip-down" option-value="descricao" option-label="descricao" :emit-value="true" :ref="'pessoa.telefones' + index + '.tipo'" v-model="telefone.tipo" label="Tipo de Telefone" :options="listaTipoTelefone" />
                              </div>
                              <!-- GO Telefone -->
                              <div class="col-sm-7 col-md-4 col-9">
                                <!-- <q-input hide-bottom-space outlined :dark="$q.dark.isActive" label="Telefone" unmasked-value unmasked-value :mask="((pessoa.telefone.numero || '') && pessoa.telefone.numero.length<9)?'####-#####':'#####-####'" :ref="'pessoa.telefones'+index+'.numero'" v-model="telefone.numero" :error="$v.pessoa.telefones.$each.$response.$data[index].numero.$error" bottom-slots :error-message="$v.pessoa.telefones.$each.$response.$data[index].numero.minLength===false?'O mínimo é 8 números!':mensagemRequired" /> -->
                                <q-input hide-bottom-space outlined :dark="$q.dark.isActive" label="Telefone" unmasked-value :mask="(telefone.numero || '') && telefone.numero.toString().length === 10 ? '(##) ####-#####' : '(##) #####-####'" :ref="'pessoa.telefones' + index + '.numero'" v-model="telefone.numero" :error="$v.pessoa.telefones.$each.$response.$data[index].numero.$error" bottom-slots :error-message="$v.pessoa.telefones.$each.$response.$data[index].numero.minLength === false ? 'O mínimo é 10 números!' : mensagemRequired" />
                              </div>
                              <!-- GO Complemento -->
                              <div class="col-sm-12 col-md-5 col-12">
                                <q-input hide-bottom-space outlined :dark="$q.dark.isActive" label="Complemento" maxlength="100" :ref="'pessoa.telefones' + index + '.complemento'" v-model="telefone.complemento" />
                              </div>
                              <!-- GO WhatApp -->
                              <div class="col-sm-12 col-md-5 col-12">
                                <q-checkbox
                                  v-model="telefone.whatsApp"
                                  label="WhatsApp"
                                />
                              </div>
                            </div>
                          </q-expansion-item>
                        </div>
                      </q-list>
                    </div>
                  </div>
                  <!-- GO Endereço -->
                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col-sm-12 col-12">
                      <q-item-label :dense="true"><span class="caption">Endereço</span></q-item-label>
                    </div>
                    <div class="col-12 col-md-12">
                      <q-list :dark="$q.dark.isActive" dense bordered class="rounded-xl">
                        <q-expansion-item dense expand-separator group="enderecosGroup" v-model="state.pessoa.endereco.open">
                          <template v-slot:header>
                            <q-item-section>
                              <q-item class="pl-0" dense>
                                <q-item-section>
                                  {{ (state.pessoa.endereco.logradouro ? state.pessoa.endereco.logradouro : "") + "" + (state.pessoa.endereco.numero ? ", " + state.pessoa.endereco.numero : "") + " " + (state.pessoa.endereco.complemento ? state.pessoa.endereco.complemento : "") }}
                                  <q-item-label caption>{{ (state.pessoa.endereco.cidade ? state.pessoa.endereco.cidade + " - " : "") + (state.pessoa.endereco.uf ? state.pessoa.endereco.uf : "") }}</q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-item-section>
                          </template>

                          <div class="row q-col-gutter-sm q-pa-md">
                            <div class="col-sm-6 col-md-2 col-12">
                              <!-- GO Tipo Endereço -->
                              <q-select hide-bottom-space outlined :dark="$q.dark.isActive" :ref="'state.pessoa.endereco.tipo'" v-model="state.pessoa.endereco.tipo" option-value="descricao" option-label="descricao" label="Tipo" filter :options="listaTipoEndereco" />
                            </div>
                            <!-- GO CEP -->
                            <div class="col-sm-6 col-md-2 col-12">
                              <q-input hide-bottom-space outlined :dark="$q.dark.isActive" label="CEP" :ref="'state.pessoa.endereco.cep'" :error="$v.pessoa.endereco.cep.$error" :error-message="$v.pessoa.endereco.cep.minLength ? 'O mínimo é 8 números!' : mensagemRequired" unmasked-value mask="##.###-###" v-model="state.pessoa.endereco.cep" bottom-slots @blur="verificaCEP()" />
                            </div>
                            <!-- GO Logradouro -->
                            <div class="col-sm-10 col-md-6 col-12">
                              <q-input hide-bottom-space outlined :dark="$q.dark.isActive" label="Logradouro" maxlength="120" :ref="'state.pessoa.endereco.logradouro'" v-model="state.pessoa.endereco.logradouro" :error="state.pessoa.endereco.desbloquearEndereco && $v.pessoa.endereco.logradouro.$error" :error-message="mensagemRequired" bottom-slots :readonly="!state.pessoa.endereco.desbloquearEndereco" />
                            </div>
                            <!-- GO Número -->
                            <div class="col-sm-2 col-md-2 col-12">
                              <q-input hide-bottom-space outlined :dark="$q.dark.isActive" label="Número" type="number" :ref="'state.pessoa.endereco.numero'" v-model="state.pessoa.endereco.numero" :error="$v.pessoa.endereco.numero.$error" bottom-slots :error-message="mensagemRequired" />
                            </div>
                            <!-- GO Complemento -->
                            <div class="col-sm-4 col-md-3 col-12">
                              <q-input hide-bottom-space outlined :dark="$q.dark.isActive" label="Complemento" :ref="'state.pessoa.endereco.complemento'" v-model="state.pessoa.endereco.complemento" />
                            </div>
                            <!-- GO Bairro -->
                            <div class="col-sm-3 col-12">
                              <q-input hide-bottom-space outlined :dark="$q.dark.isActive" label="Bairro" :ref="'state.pessoa.endereco.bairro'" v-model="state.pessoa.endereco.bairro" :error="state.pessoa.endereco.desbloquearEndereco && $v.pessoa.endereco.bairro.$error" bottom-slots :error-message="mensagemRequired" :readonly="!state.pessoa.endereco.desbloquearEndereco" />
                            </div>
                            <!-- GO Cidade -->
                            <div class="col-sm-2 col-12">
                              <q-input hide-bottom-space outlined :dark="$q.dark.isActive" label="Cidade" :ref="'state.pessoa.endereco.cidade'" v-model="state.pessoa.endereco.cidade" :error="state.pessoa.endereco.desbloquearEndereco && $v.pessoa.endereco.cidade.$error" bottom-slots :error-message="mensagemRequired" :readonly="!state.pessoa.endereco.desbloquearEndereco" />
                            </div>
                            <div class="col-md-1 col-12">
                              <!-- GO Tipo Uf -->
                              <q-select hide-bottom-space outlined :dark="$q.dark.isActive" :ref="'state.pessoa.endereco.uf'" v-model="state.pessoa.endereco.uf" label="UF" :emit-value="true" option-value="sigla" option-label="sigla" filter :options="listaUf" :readonly="!state.pessoa.endereco.desbloquearEndereco" />
                            </div>
                            <div class="col-md-3 col-12"></div>
                          </div>
                        </q-expansion-item>
                      </q-list>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel keep-alive name="acesso">
              <div class="row q-col-gutter-sm">
                <!-- GO email -->
                <div class="col-12 col-md-8 offset-md-2">
                  <q-input hide-bottom-space outlined label="E-mail para acesso" ref="pessoa.acesso.email" v-model="state.pessoa.email" @blur="$v.pessoa.email.$touch" :error="$v.pessoa.email.$error" :error-message="$v.pessoa.email.$validator === 'required' ? mensagemRequired : 'E-mail inválido!'" />
                </div>
                <!-- GO senha -->
                <!-- <div class="col-12 col-md-8 offset-md-2">
                                    <q-input hide-bottom-space outlined type="password" label="Senha" ref="pessoa.senha"
                                        v-model="state.pessoa.senha" @blur="$v.pessoa.senha.$touch"
                                        :error="$v.pessoa.senha.$error"
                                        :error-message="$v.pessoa.senha.required === false ? mensagemRequired : 'Senha inválida!'" />
                                </div> -->
                <!-- GO confirmaSenha -->
                <!-- <div class="col-12 col-md-8 offset-md-2">
                                    <q-input hide-bottom-space outlined type="password" label="Confirma Senha"
                                        ref="pessoa.confirmaSenha" v-model="state.pessoa.confirmaSenha"
                                        @blur="$v.pessoa.confirmaSenha.$touch" :error="$v.pessoa.confirmaSenha.$error"
                                        :error-message="$v.pessoa.confirmaSenha.required === false ? mensagemRequired : 'Senha inválida!'" />
                                </div> -->
              </div>
            </q-tab-panel>
            <q-tab-panel keep-alive name="foto">
              <div class="row q-col-gutter-sm">
                <div class="col-12">
                  <div class="layout-padding">
                    <div class="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-6 offset-lg-3 align-center justify-center row wrap">
                      <q-card inline class="bigger q-ma-sm">
                        <q-card-section class="flex justify-center">
                          <img style="max-height: 300px; max-width: 300px" :src="getUrlImagem" />
                        </q-card-section>
                        <q-separator />
                        <q-card-section class="flex justify-between gap-2">
                          <q-btn class="q-mt-sm" @click="buscarImagem" outline color="primary" label="Buscar Imagem" />
                          <q-btn class="q-mt-sm" v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && state.pessoa.foto !== undefined && state.pessoa.foto !== '')" @click="imageData = null" outline color="secondary" label="Ficar Sem" />
                          <q-btn class="q-mt-sm" v-if="imageData !== '' && state.pessoa.foto !== undefined && state.pessoa.foto !== ''" @click="imageData = ''" outline color="deep-purple" label="Restaurar" />
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
import { required, email, helpers, minLength } from "@vuelidate/validators";
import ImageUpload2 from "../ImageUpload2.vue";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from "quasar";
import { reactive } from "vue";
const { $geralService, $constantes } = useNuxtApp();

const props = defineProps({
  id: { type: String, default: null },
  copia: null,
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

// GO data
const state: any = reactive({ pessoa: { endereco: {}, telefones: [] } });
const $q = useQuasar();

const imageData = ref<any>("");
const imageUrl = ref("");
const tab = ref("dados");
const mensagemRequired = ref("Campo Obrigatório.");
const indexVinculo = ref(-1);

const listaFuncoes = $geralService.getLista($constantes.FUNCOES_SISTEMA, "id", "descricao");
const listaLateralidade = ref<any>([
  {
    label: "Destro",
    value: "Destro",
  },
  {
    label: "Canhoto",
    value: "Canhoto",
  },
  {
    label: "Ambidestro",
    value: "Ambidestro",
  },
]);
const listaUf = $constantes.ESTADOS;
const listaTipoEndereco = $constantes.TIPO_ENDERECO;
const listaTipoTelefone = $constantes.TIPO_TELEFONE;
const tipoOld = ["Confederação", "Federação", "Clube", "Associação", "Assessoria", "ONG", "Outro"];

// GO valida
const validations = {
  pessoa: {
    nome: {
      required,
    },
    apelido: {
      required,
    },
    cpf: {
      required,
      minLength: minLength(11),
    },
    nascimento: {
      required,
    },
    email: {
      required,
      email,
    },
    telefones: {
      $each: helpers.forEach({
        numero: {
          required,
          minLength: minLength(8),
        },
      }),
    },
    endereco: {
      cep: {
        required,
        minLength: minLength(8),
      },
      logradouro: {
        required,
      },
      numero: {
        required,
      },
      bairro: {
        required,
      },
      cidade: {
        required,
      },
      uf: {
        required,
      },
      pais: {
        required,
      },
    },
  },
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

onBeforeMount(async () => {
  if (props.id) {
    const ret: any = await useCustomFetch(
      "pessoa/getPopulate",
      "post",
      {
        filtro: {
          _id: props.id,
        },
        populateObj: [],
      },
      undefined
    );
    if (ret.valido) {
      state.pessoa = ret.data[0];
      // console.log(ret.data);
      state.pessoa = JSON.parse(JSON.stringify(state.pessoa));
      inserir.value = false;
    } else {
      setTimeout(async () => {
        await cancel();
      }, 1);
    }
  } else {
    setTimeout(async () => {
      $q.notify({
        position: "top",
        type: "info",
        textColor: "white",
        message: "Inserção não permitida por aqui!",
      });
      await cancel();
    }, 1);
  }
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

const getUrlImagem = computed(() => {
  return $geralService.getUrlImagem(imageData.value, state.pessoa, "foto", imageUrl.value);
});

// GO setPrincipal
const setPrincipal = (indice: number, lista: any) => {
  for (let index = 0; index < lista.length; index++) {
    if (indice !== index) {
      lista[index].principal = false;
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

// GO inserirTelefone
const inserirTelefone = () => {
  const principal = state.pessoa.telefones.length === 0;
  state.pessoa.telefones.push($geralService.getTelefonePadrao(listaTipoTelefone[2].descricao, principal));
};
const excluirTelefone = (indice: number) => {
  $q.dialog({
    title: "Confirmação",
    message: "Excluir o telefone?",
    cancel: "Não",
    ok: "Sim",
  }).onOk(() => {
    const excluirPrincipal = state.pessoa.telefones[indice].principal;
    state.pessoa.telefones.splice(indice, 1);
    if (excluirPrincipal && state.pessoa.telefones.length > 0) {
      // Garante que o campo 'state.pessoa.telefone' não fique desatualizado.
      state.pessoa.telefones[0].principal = true;
    }
  });
};
const verificaCEP = async () => {
  const end = await $geralService.buscarCep(state.pessoa.endereco.cep);
  // console.log(end);
  if (!end.erro) {
    // Object.assign(state.pessoa.endereco, end);
    state.pessoa.endereco.logradouro = end.logradouro;
    state.pessoa.endereco.bairro = end.bairro;
    state.pessoa.endereco.cidade = end.localidade;
    state.pessoa.endereco.uf = end.uf;
    state.pessoa.endereco.desbloquearEndereco = false;
  } else {
    state.pessoa.endereco.logradouro = "";
    state.pessoa.endereco.bairro = "";
    state.pessoa.endereco.cidade = "";
    state.pessoa.endereco.uf = "";
    state.pessoa.endereco.desbloquearEndereco = true;
  }
};

const beforeSave = () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Validando dados... Aguarde!",
    messageColor: "white",
  });
  // $v.value.vinculos.$touch();
  $v.value.pessoa.$touch();
  // console.log($v.value);

  if ($v.value.pessoa.$error) {
    $q.loading.hide();
    $q.notify({
      color: "warning",
      position: "top",
      icon: "check",
      message: "Preeencha todos os campos obrigatórios para salvar!",
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

  delete state.pessoa.__v;

  // Cria newPessoa para não bagunçar as máscaras em caso de alguma falha de comunicação
  const newPessoa = JSON.parse(JSON.stringify(state.pessoa));

  if (imageData.value !== "") {
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Fazendo upload de imagem...Aguarde!",
      messageColor: "white",
    });
  }

  $geralService.executaUpload(newPessoa, "foto", imageData.value, inserir.value, "jpg", "pessoas/imagens/fotoPerfil/", save, undefined);
};
// TO save
const save = async (newPessoa: any, nomeTempFile: any) => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Salvando registro...Aguarde!",
    messageColor: "white",
  });
  let url = "pessoa";
  let tipo = "post";
  if (!inserir.value) {
    url += "/" + props.id;
    tipo = "put";
  }

  const ret: any = await useCustomFetch(url, tipo, newPessoa, undefined);

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
    if (nomeTempFile) {
      $geralService.deleteImagem(nomeTempFile);
    }
    $q.loading.hide();
  }
};
</script>
