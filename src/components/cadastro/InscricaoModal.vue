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
            <div>
              <span class="text-bold">Inscrição id:</span> <span>{{ inscricao._id }}</span>
            </div>
            <div>
              <span class="text-bold">Evento:</span> <span>{{ `${inscricao.evento.numero} - ${inscricao.evento.nome}` }}</span>
            </div>
            <div>
              <q-img v-if="inscricao.pessoa.foto" class="rounded-lg hover:scale-150" style="width: 50px" :ratio="200 / 200" :src="getUrlImagemThumb(inscricao.pessoa.foto)"></q-img> <span class="text-bold">Pessoa Responsável:</span>
              <span>{{ `${inscricao.pessoa.nome} - ${inscricao.pessoa.email} - ${inscricao.pessoa.telefones.map((t: any) => $geralService.formatoTelefone(t.numero)).join(", ")}` }}</span>
            </div>
            <div>
              <span class="text-bold">Data Inscrição:</span> <span>{{ $geralService.getDataHoraFormatada(inscricao.created_at) }}</span>
            </div>
            <div>
              <span class="text-bold">Valor da Inscrição:</span> <span> R${{ $geralService.numeroParaMoeda(inscricao.totalLiquido) }}</span>
            </div>
            <div>
              <span class="text-bold">Taxa Comodidade:</span> <span class="text-red-500"> R${{ $geralService.numeroParaMoeda(inscricao.taxaComodidade) }}</span>
            </div>
            <div>
              <span class="text-bold">Valor Líquido:</span> <span class="text-blue-500"> R${{ $geralService.numeroParaMoeda(inscricao.totalBruto) }}</span>
            </div>
            <div>
              <span class="text-bold">Tipo Pagamento:</span> <span> {{ inscricao.pagamento.tipo }}</span>
            </div>
            <div>
              <span class="text-bold">Status:</span> <q-badge :color="$geralService.getCorStatusInscricao(inscricao.status)">{{ inscricao.status }}</q-badge>
            </div>
            <div>
              <span class="text-bold">Inscritos:</span> <span>{{ inscricao.inscritos.length }}</span>
            </div>

            <q-expansion-item v-for="(inscricaoAtleta, index) in inscricao.inscritos" :key="index" group="somegroup" class="w-full" expand-separator>
              <template v-slot:header>
                <q-item-section v-if="inscricaoAtleta.pessoa.foto" avatar>
                  <q-img class="rounded-lg hover:scale-150" style="width: 50px" :ratio="200 / 200" :src="getUrlImagemThumb(inscricaoAtleta.pessoa.foto)"></q-img>
                  <!-- <img :src="`${$geralService.configuracoes.BASE_S3 + inscricaoAtleta.pessoa.foto}`"/> -->
                </q-item-section>

                <q-item-section class="font-bold"> {{ inscricaoAtleta.pessoa.nome }} </q-item-section>

                <q-item-section class="font-bold" side> Total {{ $geralService.numeroParaMoeda(inscricaoAtleta.totalAtletaLiquido) }} </q-item-section>
              </template>

              <div class="gap-3 grid grid-cols-1">
                <div v-for="(item, index2) in inscricaoAtleta.consumiveis.filter((obj: any) => obj.quantidade > 0)" :key="`consu${index2}`">
                  <div class="p-2 flex justify-between col-span-1 rounded-md shadow dark:shadow-gray-700">
                    <div class="flex">
                      <img v-if="item.consumivel.imagem" class="mr-2 rounded-md self-start" :src="`${$geralService.configuracoes.BASE_S3 + item.consumivel.imagem}`" width="45" height="45" alt="item.consumivel.descricao" />
                      <div>
                        <div class="font-bold">
                          {{ item.consumivel.descricao }}
                        </div>
                        <div class="text-sm">
                          {{ item.categoria ? `Categoria: ${item.categoria}` : undefined }}
                          <span v-for="(op, index3) in item.opcoesEscolha" :key="index3"> - {{ op.descricao + ":" + " " + op.opcao }} </span>
                        </div>
                        <div v-if="item.descontos && item.descontos.length > 0" class="flex">
                          <span>Descontos:</span>
                          <span class="text-sm text-red-500 ml-2" v-for="(desc, index3) in item.descontos" :key="index3"> - {{ desc.descricao + ": " + " " + $geralService.numeroParaMoeda(desc.valor) }} </span>
                        </div>
                        <div v-if="item.acrescimos && item.acrescimos.length > 0" class="text-sm text-blue-500">
                          <span>Acréscimos:</span>
                          <span v-for="(acre, index3) in item.acrescimos" :key="index3"> - {{ acre.descricao + ": " + " " + $geralService.numeroParaMoeda(acre.valor) }} </span>
                        </div>
                        <div v-if="item.arranjoPagamento && item.arranjoPagamento.length > 0" class=" ">
                          <span>Rateio:</span>
                          <span class="text-sm text-green-500" v-for="(arranjo, index3) in item.arranjoPagamento" :key="index3"> - {{ arranjo.entidade.sigla + ": " + " " + $geralService.numeroParaMoeda(arranjo.valor) }} </span>
                        </div>
                      </div>
                    </div>

                    <div class="">
                      <div v-if="item.quantidade > 1" class="text-end">
                        {{ `${item.quantidade ? `${item.quantidade} x ` : ""}${$geralService.numeroParaMoeda(item.totalLiquido)}` }}
                      </div>
                      <div class="font-bold text-md text-end">
                        {{ `${$geralService.numeroParaMoeda(item.totalLiquido * item.quantidade)}` }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-expansion-item>
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

const getUrlImagemThumb = (caminho: string) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: 128,
  });
};

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const inscricao = ref<any>(null);
const $q = useQuasar();
const { $geralService } = useNuxtApp();

onBeforeMount(async () => {
  if (props.id) {
    const ret = await useCustomFetch(
      "inscricao/getPopulate",
      "post",
      {
        filtro: { _id: props.id },
        populateObj: [
          { path: "pagamento", select: { tipo: 1, status: 1 } },
          { path: "pessoa", select: { nome: 1, email: 1, apelido: 1, foto: 1, telefones: 1 } },
          { path: "inscritos.pessoa", select: { nome: 1, apelido: 1, foto: 1 } },
          { path: "inscritos.consumiveis.consumivel" },
          {
            path: "inscritos.consumiveis.arranjoPagamento.entidade",
            select: { sigla: 1, logo: 1 },
          },
          { path: "evento", select: { imagem: 1, numero: 1, nome: 1, inicio: 1, rota: 1, ano: 1, etapa: 1, abrangencia: 1, "endereco.cidade": 1, "endereco.uf": 1, sigla: 1, esporte: 1 }, populate: { path: "esportes" } },
        ],
      },
      undefined
    );
    if (ret.valido) {
      // // // console.log("inscricao", ret.data);
      inscricao.value = ret.data[0];
    }
  } else {
    onDialogCancel();
  }
});
</script>
