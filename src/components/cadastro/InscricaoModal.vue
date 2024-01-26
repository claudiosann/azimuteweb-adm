<template>
  <div>
  
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-l from-pink-400 to-rose-700" name="list_alt" size="30px" />
          <q-toolbar-title>Inscrição {{ id }}</q-toolbar-title>
          <!-- GO btnSave -->
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="onDialogCancel" :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <div v-if="inscricao">
         <div> <span class="text-bold">Inscrição id:</span> <span>{{ inscricao._id }}</span></div>
         <div><span class="text-bold">Evento:</span> <span>{{ `${inscricao.evento.numero} - ${inscricao.evento.nome}`  }}</span></div>
         <div><span class="text-bold">Pessoa Responsável:</span> <span>{{ `${inscricao.pessoa.nome} - ${inscricao.pessoa.email} - ${inscricao.pessoa.telefones.map((t:any) => $geralService.formatoTelefone(t.numero)).join(", ")}` }}</span></div>
         <div><span class="text-bold">Data Inscrição:</span> <span>{{ $geralService.getDataHoraFormatada(inscricao.created_at) }}</span></div>
         <div><span class="text-bold">Números de Inscritos:</span> <span>{{ inscricao.inscritos.length }}</span></div>
         <div><span class="text-bold">Valor da Inscrição:</span> <span> R${{ $geralService.numeroParaMoeda(inscricao.totalLiquido) }}</span></div>
         <div><span class="text-bold">Taxa Comodidade:</span> <span  class="text-red-500"> R${{ $geralService.numeroParaMoeda(inscricao.taxaComodidade) }}</span></div>
         <div><span class="text-bold">Valor Líquido:</span> <span  class="text-blue-500"> R${{ $geralService.numeroParaMoeda(inscricao.totalBruto) }}</span></div>
         <div><span class="text-bold">Tipo Pagamento:</span> <span> {{ inscricao.pagamento.tipo }}</span></div>
         <div><span class="text-bold">Status:</span> <q-badge :color="$geralService.getCorStatusInscricao(inscricao.status)">{{ inscricao.status }}</q-badge></div>
         
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
  evento: { type: Object, default: null },
  eventoId: { type: Number, default: null },
});
const geral = useGeral();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const inscricao = ref<any>(null);
const $q = useQuasar();
const { $geralService } = useNuxtApp();

onBeforeMount(async () => {
  if (props.id) {
    const ret = await useCustomFetch("inscricao/getPopulate", "post", { filtro: { _id: props.id }, populateObj: [{ path: "pagamento", select: { tipo: 1, status: 1 } }, { path: "pessoa", select: { nome: 1, email:1, apelido: 1, foto: 1, telefones:1 } }, { path: "inscritos.pessoa", select: { nome: 1, apelido: 1, foto: 1 } }, { path: "inscritos.consumiveis.consumivel" },{ path: "evento", select: { imagem: 1, numero: 1,  nome: 1, inicio: 1, rota: 1, ano: 1, etapa: 1, abrangencia: 1, "endereco.cidade": 1, "endereco.uf": 1, sigla: 1, esporte: 1 }, populate: { path: "esportes" } } ] }, undefined);
    if (ret.valido) {
      // // // console.log("inscricao", ret.data);
      inscricao.value = ret.data[0];
    }
  } else {
    onDialogCancel();
  }
});



</script>
