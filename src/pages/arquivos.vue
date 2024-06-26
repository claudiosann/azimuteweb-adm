<template>
  <div class="container">
    <!-- GO toolbar -->
    <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
      <q-icon class="ml-0 p-1 rounded text-white bg-gradient-to-l from-yellow-300 to-yellow-700" name="folder" size="30px" />
      <q-toolbar-title>
        <q-item>
          <q-item-section>
            <q-item-label>Gerenciador de Arquivos</q-item-label>
          </q-item-section>
        </q-item>
      </q-toolbar-title>
    </q-toolbar>

    <div class="m-2">
      <!-- <pre>{{ raiz }}</pre> -->
      <div :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll">
        <div class="flex justify-between">
          <q-breadcrumbs gutter="sm" style="font-size: 15px">
            <q-breadcrumbs-el class="cursor-pointer" v-for="(item, index) in pastas" @click="navegar(index, false)" :key="index">
              <q-btn :icon="index === 0 ? 'home' : undefined" flat :label="item" />
            </q-breadcrumbs-el>
          </q-breadcrumbs>
          <q-btn round push class="border-none btn-scale" color="amber-7" icon="create_new_folder" @click="criarFolder">
            <q-tooltip>Nova Pasta</q-tooltip>
          </q-btn>
        </div>

        <div class="mt-2 col-12 flex flex-center">
          <q-list class="w-full container" style="background: transparent !important">
            <q-uploader v-if="geral.funcoesAcessos.arquivosInserir" class="q-pa-sm w-full" ref="uploader" auto-upload @uploaded="finalizar" :form-fields="[{ name: 'caminho', value: lista.Prefix }]" :url="$geralService.configuracoes.BASE_REST + 'api/uploadS3'" label="Fazer Novo Upload" :multiple="multiple">
              <template v-slot:list="scope">
                <q-list separator>
                  <q-item v-for="(file, index) in scope.files" :key="index">
                    <q-item-section>
                      <q-item-label class="ellipsis">
                        {{ file.name }}
                      </q-item-label>

                      <q-item-label :class="{ 'text-red': file.__status === 'failed', 'text-green': file.__status === 'uploaded' }" caption> Status: {{ file.__status }} </q-item-label>

                      <q-item-label caption> {{ file.__sizeLabel }} / {{ file.__progressLabel }} </q-item-label>
                    </q-item-section>

                    <q-item-section v-if="file.__img" thumbnail>
                      <img :src="file.__img.src" />
                    </q-item-section>

                    <q-item-section top side>
                      <q-btn size="12px" flat dense round icon="delete" @click="scope.removeFile(file)" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </template>
            </q-uploader>
            <q-separator />

            <div pt-2>Arquivos da Nuvem</div>

            <div v-if="!travarCaminhoUpload">
              <div v-for="(item, index1) in lista.CommonPrefixes" :key="index1">
                <q-item @click="buscar(item.Prefix, false)" clickable v-ripple>
                  <q-item-section avatar top>
                    <q-avatar icon="folder" color="amber" text-color="white" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ removeCaminho(item.Prefix) }}</q-item-label>
                  </q-item-section>
                  <q-item-section v-if="!travarDeletar" side>
                    <div class="flex items-center flex-nowrap">
                      <q-btn class="mr-2" size="14px" flat dense round color="warning" icon="fas fa-pencil-alt" @click.stop="renomear(item.Prefix, false)">
                        <q-tooltip> Renomear </q-tooltip>
                      </q-btn>
                      <q-btn class="mr-2" size="14px" flat dense round color="primary" icon="fas fa-copy" @click.stop="copyLinkFolder(item.Prefix)">
                        <q-tooltip> Copiar para área de transferência </q-tooltip>
                      </q-btn>
                      <q-btn size="14px" flat dense round color="red" icon="delete" @click.stop="deleteFolder(item)">
                        <q-tooltip> Deletar </q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </div>
            </div>
            <q-item class="px-0" clickable v-for="file in lista.Contents" :key="file.Etag" v-ripple>
              <q-item-section clickable avatar top>
                <q-avatar :color="file.extensao === 'jpg' || file.extensao === 'jpg' ? 'primary' : 'secondary'" :icon="file.extensao === 'jpg' || file.extensao === 'jpg' ? 'image' : 'assignment'" text-color="white" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ removeCaminho(file.Key) }}</q-item-label>
                <q-item-label caption>Tamanho: {{ file.Size / 1000 }}kb</q-item-label>
              </q-item-section>
              <q-item-section class="" v-if="!travarDeletar" side>
                <div class="flex items-center flex-nowrap">
                                        <q-btn class="mr-2" size="14px" flat dense round color="warning" icon="fas fa-pencil-alt" @click.stop="renomear(file.Key, true)">
                        <q-tooltip> Renomear </q-tooltip>
                      </q-btn>

                  <q-btn class="mr-2" size="14px" flat dense round color="positive" icon="fas fa-external-link-alt" target="_blank" :href="$geralService.configuracoes.BASE_S3 + file.Key">
                    <q-tooltip> Abrir arquivo </q-tooltip>
                  </q-btn>
                  <q-btn class="mr-2" size="14px" flat dense round color="primary" icon="fas fa-copy" @click="clipboard(file.Key)">
                    <q-tooltip> Copiar para área de transferência </q-tooltip>
                  </q-btn>
                  <q-btn v-if="geral.funcoesAcessos.arquivosDeletar" color="red" size="14px" flat dense round icon="delete" @click="deleteFile(file)">
                    <q-tooltip> Deletar </q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from "quasar";
import { useClipboard } from "@vueuse/core";

const source = ref("Hello");
const { text, copy, copied, isSupported } = useClipboard({ source });

const { $geralService, $constantes } = useNuxtApp();
const geral = useGeral();

const raiz = geral.entidade.sigla;

const travarCaminhoUpload = ref(false);
const multiple = ref(true);
const travarDeletar = ref(false);

const $q = useQuasar();

const tab = ref("arquivos");
const pastas = ref<any>([raiz]);
const lista = ref<any>([]);

onMounted(async () => {
  navegar(0, true);
});

const clipboard = (text: string) => {
  copy($geralService.configuracoes.BASE_S3 + text);
  $q.notify({
    color: "info",
    position: "top",
    icon: "check",
    message: "Link copiado para área de transferência",
    caption: "Copiado",
  });
};


const removeUltimoItemArray = (array: any) => {
  return array.slice(0, -1);
};

const renomear = (nome: any, file:boolean) => {
  let source: string = nome.slice(0, -1).replace(geral.entidade.sigla + "/", "");
  if(file) {
    source = nome.replace(geral.entidade.sigla + "/", "");
  }
  let arrayTemp = nome.slice(0, -1).split("/");
  // remover o último item de teste
  arrayTemp = arrayTemp.slice(0, 1);
    $q.dialog({
        dark: true,
        title: 'Renomear',
        message: 'Digite o novo nome',
        prompt: {
            model: source,
            type: 'text' // optional
        },
        cancel: true,
        persistent: true
    }).onOk(async data => {
       if (data && data !== source) {
         $q.notify({
            color: 'positive',
            position: 'top',
            icon: 'check',
            message: 'Informação!',
            caption: 'Sucesso na alterarção do nome! '+ arrayTemp.join("/") + '/'+ data + '/'
         });

         if (data && data !== source) {
           let destino = arrayTemp.join("/") + '/' + data + '/';
           if(file) {
             destino = arrayTemp.join("/") + '/' + data;
           }
           const ret = await useCustomFetch("api/moveS3", "post", {
             origem: nome,
             destino: destino,
             file: file
           }, undefined);

           if (ret.valido) { 
            navegar(pastas.value.length - 1, true);
           }
           console.log(ret);
         }

        } else {
          $q.notify({
            color: 'warning',
            position: 'top',
            icon: 'check',
            message: 'Atenção!',
            caption: 'Nome inválido ou igual ao anterior.',
          });
        }
       // gravaFiliacao('Filiação aceita e ativada com sucesso! ' + data);
    });
}

const copyLinkFolder = (text: string) => {
  // remover o ultimo caracter que é a barra

  copy(text.slice(0, -1).replace(geral.entidade.sigla + "/", ""));
  $q.notify({
    color: "info",
    position: "top",
    icon: "check",
    message: "Caminho copiado para área de transferência",
    caption: "Copiado",
  });
};

const finalizar = (val: any) => {
  // console.log(val.files[0].name);
  // save(props.raiz + '/' + val.files[0].name);
  // console.log(pastas.value);
  navegar(pastas.value.length - 1, true);
  // this.tab = 'arquivos';
};

const deleteFile = async (file: any) => {
  // console.log("jhsdkjshdkljhs");
  // console.log(file);
  if (!travarDeletar.value) {
    $q.loading.show({ spinner: QSpinnerOval });
    let ret = await $geralService.deleteFile(file.Key, $constantes.THUMBNAILS);
    if (ret) {
      navegar(pastas.value.length - 1, true);
    }
    $q.loading.hide();
  }
};
const deleteFolder = async (file: any) => {
  if (!travarDeletar.value) {
    $q.loading.show({ spinner: QSpinnerOval });
    let ret = await $geralService.deleteFile(file.Prefix);
    if (ret) {
      // console.log(ret);
      buscar(ultimoCaminho.value, true);
    } else {
      // console.log("erro");
    }
    $q.loading.hide();
  }
};

const confirmUpload = () => {
  // console.log("tete");
};

const removeCaminho = (caminho: any) => {
  if (lista.value.Prefix) {
    caminho = caminho.replace(lista.value.Prefix, "");
    return caminho.replace("/", "");
  } else {
    return caminho;
  }
};

const navegar = async (idx: number, force: boolean) => {
  if (force || idx < pastas.value.length - 1) {
    let caminho = "";
    for (let index = 0; index < pastas.value.length; index++) {
      if (index <= idx) {
        caminho += pastas.value[index] + "/";
      }
    }
    caminho = caminho.replace("(Home)", raiz);
    // console.log(caminho);
    buscar(caminho, idx === 0);
  }
  // console.log(idx);
};

const criarFolder = async () => {
  if (!geral.funcoesAcessos.arquivosDeletar) {
    $q.notify({
      color: "warning",
      position: "top",
      icon: "check",
      message: "Atenção!",
      caption: "Você não tem permissão para criar pastas.",
    });
    return;
  }

  $q.dialog({
    dark: true,
    title: "Criar Pasta",
    message: "Nome da Pasta",
    prompt: {
      model: "",
      type: "text",
      maxlength: 200,
      // optional
    },
    cancel: true,
    persistent: true,
  }).onOk(async (data) => {
    if (data) {
      const ret: any = await useCustomFetch(
        "api/createFolderS3",
        "post",
        {
          caminho: ultimoCaminho.value + data,
        },
        undefined
      );
      if (ret.valido) {
        // console.log(ret);
        buscar(ultimoCaminho.value, true);
      } else {
        $q.notify({
          color: "warning",
          position: "top",
          icon: "check",
          message: "Atenção!",
          caption: "Falha ao criar pasta.",
        });
      }
    }
  });
};

const ultimoCaminho = ref("");

const buscar = async (caminho: any, forcar: boolean) => {
  if (!travarCaminhoUpload.value || forcar) {
    $q.loading.show({ spinner: QSpinnerOval });
    try {
      const ret: any = await useCustomFetch(
        "api/listObjectsS3",
        "post",
        {
          caminho: caminho,
        },
        undefined
      );

      if (ret.valido) {
        ultimoCaminho.value = caminho;
        lista.value = ret.data;
        lista.value.Contents = lista.value.Contents.filter((file: any, index: number) => {
          if (file.Size === 0) {
            return false;
          }

          if (((file.Key.endsWith("jpg") || file.Key.endsWith("png")) && file.Key.includes("thumbnail-")) || file.Key.endsWith("/")) {
            return false;
          }
          return true;
        });

        pastas.value = ret.data.Prefix.replace(raiz, "(Home)").split("/");

        if (pastas.value.length == 2) {
          // console.log(pastas.value);
          // console.log(lista.value.CommonPrefixes);
          lista.value.CommonPrefixes = lista.value.CommonPrefixes.filter((file: any, index: number) => {
            if (isPastaSistema(file.Prefix)) {
              return false;
            }
            return true;
          });
        }

        pastas.value.splice(pastas.value.length - 1, 1);
      }
    } catch (error) {
      // console.log(error);
    }
    $q.loading.hide();
  }
};

const isPastaSistema = (caminho: any) => {
  // console.log(caminho);
  switch (caminho) {
    case geral.entidade.sigla + "/conteudos/":
    case geral.entidade.sigla + "/parceiros/":
    case geral.entidade.sigla + "/votacao/":
    case geral.entidade.sigla + "/noticias/":
    case geral.entidade.sigla + "/destaques/":
    case geral.entidade.sigla + "/destaques/":
    case geral.entidade.sigla + "/filiacao/": //Deixar a imagem na paste de cada entidade de acordo com que solicita o documento.
      return true;
    default:
      return false;
  }
};
</script>
