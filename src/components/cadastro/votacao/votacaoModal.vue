<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-teal-400 to-teal-700" name="alt_route" size="30px" />

          <q-toolbar-title>{{ inserir ? "Inserir - " : votacao.votacaoIniciada ? "Visualizar" : "Editar" }} Eleição</q-toolbar-title>
          <!-- GO btnSave -->

          <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive" aria-label="Salvar" v-if="!votacao.votacaoIniciada || geral.pessoa.nivel_acesso === 99" @click="beforeSave()" :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel" :label="$q.screen.gt.xs ? (inserir ? 'Cancelar' : 'Fechar') : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <q-tabs v-model="tab" class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
            <q-tab default name="dados" icon="line_style" label="Informações"> </q-tab>
            <q-tab name="disputas" icon="list" label="Disputas">
              <q-badge v-if="$v.disputas.$error" color="red" text-color="white" label="Incompleto" />
            </q-tab>
            <q-tab name="candidatos" icon="category" label="Opções de Voto" />
            <q-tab name="aptos" icon="fas fa-people-group" label="Eleitores">
              <q-badge v-if="$v.votantes.$error" color="red" text-color="white" label="Incompleto" />
            </q-tab>
            <q-tab name="adms" icon="group" label="Administradores">
              <q-badge v-if="$v.administradores.$error" color="red" text-color="white" label="Incompleto" />
            </q-tab>
            <q-tab name="logo" icon="image" label="Imagem" />
          </q-tabs>

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="dados">
              <div class="row q-col-gutter-sm">
                <div class="col-md-6 col-12">
                  <q-input hide-bottom-space counter maxlength="150" outlined v-model="votacao.titulo" label="Título" :dense="dense" @blur="$v.titulo.$touch" :error="$v.titulo.$error" error-message="Campo obrigatório" />
                </div>
                <div class="col-md-6 col-12">
                  <q-input hide-bottom-space counter maxlength="150" outlined v-model="votacao.subTitulo" label="Sub Título" :dense="dense" @blur="$v.subTitulo.$touch" :error="$v.subTitulo.$error" error-message="Campo obrigatório" />
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-field outlined label="Status" stack-label>
                    <template v-slot:control>
                      {{ votacao.status }}
                    </template>
                  </q-field>
                  <!-- <q-select hide-bottom-space outlined v-model="votacao.status" :options="listaStatus"
                                        label="Status" :dense="dense" @blur="$v.status.$touch" :error="$v.status.$error"
                                        error-message="Campo obrigatório" /> -->
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                    <q-field outlined label="Entidade Responsável" stack-label>
                      <template v-if="votacao.entidadePai && votacao.entidadePai.logo" v-slot:prepend>
                        <q-avatar rounded size="45px">
                          <q-img :src="getUrlImagemLocal(votacao.entidadePai.logo)"></q-img>
                        </q-avatar>
                      </template>
                      <template v-slot:control>
                        <div class="self-center full-width no-outline" tabindex="0">
                          <span v-if="votacao.entidadePai">{{ votacao.entidadePai.nomeRazao }}{{ " (" + votacao.entidadePai.sigla + ")" }}</span>
                        </div>
                      </template>
                    </q-field>
                  <!-- <q-select hide-bottom-space outlined v-model="votacao.entidadePai" :options="listaEntidade" label="EntidadePai" option-label="sigla" emit-value :dense="dense" /> -->
                </div>

                <div class="col-sm-6 col-md-2 col-12">
                  <q-select hide-bottom-space outlined v-model="votacao.nivelVotacao" :options="listaNivelVotacao" label="Nível da Votação" :dense="dense" @blur="$v.nivelVotacao.$touch" :error="$v.nivelVotacao.$error" error-message="Campo obrigatório" />
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <CinputDate hide-bottom-space tipo="datetime" outlined v-model="votacao.inicio" label="Início" :dense="dense" @blur="$v.inicio.$touch" :error="$v.inicio.$error" error-message="Campo obrigatório" />
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <CinputDate hide-bottom-space tipo="datetime" outlined v-model="votacao.fim" label="Fim" :dense="dense" @blur="$v.fim.$touch" :error="$v.fim.$error" error-message="Campo obrigatório" />
                </div>

                <div class="col-sm-6 col-md-2 col-12">
                  <q-input hide-bottom-space :min="0" type="number" outlined v-model="votacao.idadeMinima" label="Idade Mínima" :dense="dense" @blur="$v.idadeMinima.$touch" :error="$v.idadeMinima.$error" error-message="Campo obrigatório" />
                </div>
                <div class="col-sm-6 col-12">
                  <q-field outlined>
                    <q-checkbox v-model="votacao.somenteElite" label="Somente Elite" />
                    <q-checkbox v-model="votacao.resultadoPublico" label="Resultado Publico" />
                    <q-checkbox v-model="votacao.votacaoAberta" label="Votação Aberta (Voto não secreto)" />
                  </q-field>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel name="disputas">
              <CadastroVotacaoDisputasComponent @onExcluir="excluirLista" v-model="votacao.disputas"> </CadastroVotacaoDisputasComponent>
            </q-tab-panel>
            <q-tab-panel name="candidatos">
              <CadastroVotacaoOpcoesVotosComponent @onExcluir="excluirLista" :listaDisputas="votacao.disputas" v-model="votacao.opcoesDeVoto"></CadastroVotacaoOpcoesVotosComponent>
            </q-tab-panel>
            <q-tab-panel name="aptos">
              <CadastroVotacaoVotantesComponent @onExcluir="excluirLista" v-model="votacao.votantes"> </CadastroVotacaoVotantesComponent>
            </q-tab-panel>
            <q-tab-panel name="adms">
              <CadastroVotacaoAdministradoresComponent @onExcluir="excluirLista" v-model="votacao.administradores"></CadastroVotacaoAdministradoresComponent>
            </q-tab-panel>
            <q-tab-panel name="logo">
              <div class="row q-col-gutter-sm">
                <div class="col-12">
                  <div class="layout-padding">
                    <div class="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-6 offset-lg-3 align-center justify-center row wrap">
                      <q-card inline class="bigger q-ma-sm">
                        <q-card-section class="flex justify-center">
                          <img style="max-height: 600px; max-width: 600px" :src="getUrlImagem" />
                        </q-card-section>
                        <q-separator />
                        <q-card-section class="flex justify-between gap-2">
                          <q-btn class="q-mt-sm" @click="buscarImagem" outline color="primary" label="Buscar Imagem" />
                          <q-btn class="q-mt-sm" v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && votacao.imagemUrl !== undefined && votacao.imagemUrl !== '')" @click="imageData = null" outline color="secondary" label="Ficar Sem" />
                          <q-btn class="q-mt-sm" v-if="imageData !== '' && votacao.imagemUrl !== undefined && votacao.imagemUrl !== ''" @click="imageData = ''" outline color="deep-purple" label="Restaurar" />
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

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from "quasar";
import ImageUpload2 from "@/components/ImageUpload2.vue";

const excluirLista = (nomelista: any, indexExclusao: any) => {
  if (nomelista === "disputas") {
    for (let index = 0; index < votacao.value.opcoesDeVoto.length; index++) {
      // console.log(votacao.value.opcoesDeVoto[index])
      const indexEncontrado = votacao.value.opcoesDeVoto[index].disputas.indexOf(votacao.value[nomelista][indexExclusao]._id);
      if (indexEncontrado > -1) {
        // notify
        $q.notify({
          color: "warning",
          position: "top",
          icon: "warning",
          message: "Não é possível excluir a opção de voto, pois ela está sendo utilizada em uma ou mais opções de voto!",
        });
        return;
      }
    }
  }
  votacao.value[nomelista].splice(indexExclusao, 1);
};

const props = defineProps({
  id: { type: String, default: null },
  copia: null,
  conta: null,
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const votacao: any = ref({
  titulo: "",
  subTitulo: "",
  inicio: "",
  fim: "",
  idadeMinima: 16,
});

const geral = useGeral();
const dense = ref(false);
const $q = useQuasar();
const { $geralService } = useNuxtApp();
const tab = ref("dados");

const listaStatus = ["Agendada", "Ativa", "Encerrada", "Cancelada"];
const listaCaminhosExcluidos = ref<any>([]);

// GO valida
const validations = {
  titulo: { required },
  subTitulo: { required },
  status: { required },
  nivelVotacao: { required },
  inicio: { required },
  fim: { required },
  idadeMinima: { required },
  disputas: {
    $each: helpers.forEach({
      descricao: {
        required,
      },
      quantidade: {
        required,
      },
      quantidadeElegivel: {
        required,
      },
    }),
  },
  administradores: {
    $each: helpers.forEach({
      pessoa: {
        required,
      },
    }),
  },
  votantes: {
    $each: helpers.forEach({
      pessoa: {
        required,
      },
    }),
  },
};

const $v = useVuelidate(validations, votacao);

const inserir = ref(true);

onBeforeMount(async () => {
  listaEntidade.value = [];

  if (props.id) {
    const ret: any = await useCustomFetch(
      "votacao/getPopulate",
      "post",
      {
        filtro: {
          _id: props.id,
        },
        select: { votos: 0 },
          populateObj: [{ path: 'entidadePai', select: { nomeRazao: 1, sigla: 1, logo: 1 } },
            { path: 'administradores.pessoa', select: { nome:1, apelido: 1, foto:1} },
            { path: 'votantes.pessoa', select: { nome:1, apelido: 1, foto:1} }
          ],
      },
      undefined
    );
    if (ret.valido) {
      votacao.value = ret.data[0];
      if (props.copia) {
        votacao.value.titulo = votacao.value.titulo + " (Cópia)";
        votacao.value._id = undefined;
        votacao.value.__v = undefined;
        votacao.votacaoIniciada = false;
        inserir.value = true;
      } else {
        inserir.value = false;
        if (votacao.value.votacaoIniciada) {
          $q.notify({
            color: "info",
            position: "top",
            icon: "info",
            caption: "Votação já iniciada.",
            message: "Não é possível editar!",
          });
        }
      }
    } else {
      setTimeout(async () => {
        await cancel();
        // navigateTo('/login');
      }, 1);
    }
  } else {
    console.log(geral.entidade);
    votacao.value = {
      _id: await $geralService.getId(),
      titulo: "",
      subTitulo: "",
        resultadoPublico: false,
      entidadePai: geral.entidade,
      somenteElite: false,
      inicio: new Date().toISOString(),
      fim: new Date().toISOString(),
    };
    votacao.value.status = "Agendada";
    votacao.value.nivelVotacao = listaNivelVotacao.value[0];
    votacao.value.idadeMinima = 16;
    votacao.value.quantidadeOpcao = 1;
    votacao.value.opcoesDeVoto = [];
    votacao.value.administradores = [
      {
        _id: await $geralService.getId(),
        pessoa: geral.pessoa,
        funcaoVotacao: [
          { id: 1, descricao: "Consultar" },
          { id: 2, descricao: "Editar" },
          { id: 3, descricao: "Auditar" },
        ],
        edit: false,
      },
    ];
    votacao.value.votantes = [];
    votacao.value.disputas = [];
    votacao.value.votos = undefined;

    inserir.value = true;
  }
});

const imageData = ref<any>("");
const imageUrl = ref("");

const listaEntidade = ref<any>([]);

const listaNivelVotacao = computed(() => {
  let listaEnt = [];
  // console.log(geral.pessoa);
  if (geral.pessoa != null) {
      listaEnt.push("Clube");
      listaEnt.push("Federação");
      listaEnt.push("Confederação");
      listaEnt.push("Aberto");
  }
  return listaEnt;
});

const getUrlImagem = computed(() => {
  return $geralService.getUrlImagem(imageData.value, votacao.value, "imagemUrl", imageUrl.value);
});

const buscarImagem = () => {
  $q.dialog({
    component: ImageUpload2,
    persistent: true,
    componentProps: {
      winit: 1200,
      hinit: 630,
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

const beforeSave = async () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Validando dados... Aguarde!",
    messageColor: "white",
  });
  // $v.value.votacao.vinculos.$touch();
  $v.value.$touch();
  // console.log($v.value);

  if ($v.value.$error) {
    $q.loading.hide();
    $q.notify({
      color: "warning",
      position: "top",
      icon: "check",
      message: "Preeencha todos os campos obrigatórios para salvar!",
    });
    return;
  }

  if (votacao.value.status !== "Aberto") {
    votacao.value.pessoaEncerramento = geral.pessoa._id;
    votacao.value.dataEncerramento = new Date();
  }

  delete votacao.value.__v;

  const newVotacao = JSON.parse(JSON.stringify(votacao.value));

  if (imageData.value !== "") {
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Fazendo upload de imagem...Aguarde!",
      messageColor: "white",
    });
  }

  $geralService.executaUpload(newVotacao, "imagemUrl", imageData.value, inserir.value, "jpg", `${votacao.value.entidadePai.sigla}/votacao/`, save, undefined, true);
};

const getUrlImagemLocal = (caminho: String) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: 128,
  });
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
const save = async (newVotacao: any, nomeTempFile: any) => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Salvando registro...Aguarde!",
    messageColor: "white",
  });

  let url = "votacao";
  let tipo = "post";
  if (!inserir.value) {
    url += "/" + props.id;
    tipo = "put";
  }

  delete newVotacao.votos;

  const ret: any = await useCustomFetch(url, tipo, newVotacao, undefined);

  if (ret.valido) {
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
      await $geralService.deleteImagem(nomeTempFile);
    }
    $q.notify({
      color: "red",
      position: "top",
      icon: "warning",
      message: ret.data.message ? ret.data.message : "Falha ao salvar registro!",
    });
  }
  $q.loading.hide();
};
</script>
