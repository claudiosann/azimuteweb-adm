<template>
  <div>
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-l from-pink-400 to-rose-700" name="list_alt" size="30px" />
          <q-toolbar-title>Repasse {{}}</q-toolbar-title>
          <!-- GO btnSave -->
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="onDialogCancel" :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <div v-if="repasse">
            <div>
              <span class="text-bold">Número:</span> <span>{{ repasse.sequencial }}</span>
            </div>
            <div>
              <q-img v-if="repasse.entidade.logo" class="rounded-lg" style="width: 35px" :ratio="200 / 200" :src="getUrlImagemThumb(repasse.entidade.logo)"></q-img> <span class="text-bold">Entidade:</span>
              <span>{{ `${repasse.entidade.sigla}` }}</span>
            </div>
            <div>
              <span class="text-bold">Data Solicitação:</span> <span>{{ $geralService.getDataHoraFormatada(repasse.dataSolicitacao) }}</span>
            </div>
            <div>
              <span class="text-bold">Data Pagamento:</span> <span>{{ $geralService.getDataHoraFormatada(repasse.dataRealizada) }}</span>
            </div>
            <div>
              <span class="text-bold text-blue-500">Valor:</span> <span> R$ {{ $geralService.numeroParaMoeda(repasse.valor) }}</span>
            </div>
            <div>
              <span class="text-bold">Status:</span> <q-badge :color="getCorStatus(repasse.status)">{{ repasse.status }}</q-badge>
            </div>

            <q-file ref="fileb" accept=".png, .jpg, .jpeg, .pdf" @update:model-value="onFileComp" label="Documento" outlined v-model="novoComprovante" error-message="Clique ou arreste o arquivo no campo">
              <template v-slot:prepend>
                <q-icon class="cursor-pointer" name="attach_file" @click.stop />
              </template>
            </q-file>

            <q-btn v-if="novoComprovante" glossy push class="btn-scale" @click="confirmarPagamento" :label="'Confirmar Pagamento'" color="positive" icon="close" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from "quasar";

const props = defineProps({
  id: { type: String, default: null },
});
const geral = useGeral();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const repasse = ref<any>(null);
const $q = useQuasar();
const { $geralService } = useNuxtApp();

const novoComp = ref<any>(null);
const fileb = ref<any>(null);

const novoComprovante = ref<any>(null);

const comprovanteIsPdf = computed(() => {
  if (novoComprovante.value) {
    return novoComprovante.value.name.split(".")[1] === "pdf";
  } else {
    return repasse.value.comprovante ? repasse.value.comprovante.split(".")[1] === "pdf" : false;
  }
});

const onFileComp = (value: any) => {
  novoComp.value = URL.createObjectURL(value);
};

const uploadComprovante = async () => {
  if (novoComprovante.value) {
    const caminho = repasse.value.entidade._id + "/repasses/";
    const tipo = novoComprovante.value.name.split(".")[1];
    const randonName = "conprovante_" + repasse.value.sequencial + "_" + $geralService.getRandomName() + "." + tipo;
    if (await $geralService.uploadFileAsync(novoComprovante.value, caminho, randonName, undefined)) {
      repasse.value.comprovante = caminho + randonName;
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

const getUrlImagemThumb = (caminho: string) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: 128,
  });
};

const confirmarPagamento = async () => {
  if (await uploadComprovante()) {
    const ret = await useCustomFetch(
      "pagamentoMovimentacao/" + repasse.value._id,
      "put",
      {
        status: "Realizada",
        // dataRealizada: new Date().toISOString(),
        dataRealizada: repasse.value.dataSolicitacao,
        comprovante: repasse.value.comprovante,
      },
      undefined
    );
    if (ret.valido) {
      $q.notify({
        color: "positive",
        message: "Pagamento confirmado com sucesso!",
      });
      onDialogOK();
    } else {
      $q.notify({
        color: "negative",
        message: ret.data && ret.data.message ? ret.data.message : "Falha ao confirmar o pagamento!",
      });
    }
  } else {
    $q.notify({
      color: "negative",
      message: "Falha ao fazer o upload do comprovante!",
    });
  }
};

const getCorStatus = (status: string) => {
  switch (status) {
    case "Solicitada":
      return "warning";
    case "Realizada":
      return "positive";
    default:
      return "negative";
  }
};

onBeforeMount(async () => {
  if (props.id) {
    console.log("props.id", props.id);
    const ret = await useCustomFetch(
      "pagamentoMovimentacao/getPopulate",
      "post",
      {
        filtro: { _id: props.id },
        populateObj: [{ path: "entidade", select: { sigla: 1, logo: 1 } }],
      },
      undefined
    );
    if (ret.valido) {
      // // // console.log("inscricao", ret.data);
      repasse.value = ret.data[0];
    } else {
      $q.notify({
        color: "negative",
        message: ret.data && ret.data.message ? ret.data.message : "Falha ao obter a lista de acessos!",
      });
    }
  } else {
    onDialogCancel();
  }
});
</script>
