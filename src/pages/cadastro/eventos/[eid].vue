<template>
  <div>
    <div class="m-2 rounded-lg shadow-1 " :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-7'" v-if="evento">
    <q-item class="pb-0 rounded-tl-lg  rounded-tr-lg " :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-7'" v-if="evento">
    <q-item-section v-if="$q.screen.gt.xs" avatar>
      <q-img v-if="evento.imagem" class="rounded-borders" style="width: 90px;" :ratio="1200 / 630"
        :src="getUrlImagem(evento.imagem)"></q-img>
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-h6" lines="2">{{ $q.screen.gt.xs ? `${evento.nome} (${evento.sigla})`: evento.sigla  }}</q-item-label>
      <q-item-label class="text-subtitle2!" lines="1">
          <span><q-icon style="font-size: 15px; top: -1px;" name="event" /> {{ $geralService.getDataFormatada(evento.inicio) }}</span>
        <span class="ml-4"><q-icon style="font-size: 15px; top: -1px;" name="room" />
          {{ evento.local ? (evento.local + ', ') : '' }}{{ evento.endereco.cidade }} - {{ evento.endereco.uf }}</span>
                <span class="ml-4"> {{ evento.etapa==='Única'?'':`${evento.etapa} Etapa` }}</span>
        
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <span class="row">
        <q-btn class="text-right q-mr-sm" color="negative" @click="navigateTo('/cadastro/eventos')" :label="$q.screen.gt.xs?'Voltar':undefined" outline
          icon="undo"><q-tooltip>Voltar</q-tooltip></q-btn>
        <q-btn class="text-right" color="warning" @click="openCadastro" :label="$q.screen.gt.xs?'Editar Cadastro':''" outline icon="edit">
          <q-tooltip>Editar Cadastro</q-tooltip>
        </q-btn>
      </span>
    </q-item-section>
    </q-item>
    
    <q-tabs class="rounded-tl-lg rounded-tr-lg mt-1"  v-model="tab" dense narrow-indicator keep-alive
      :active-color="$q.dark.isActive ? 'info' : 'primary'" :breakpoint="0" indicator-color="primary" active-class="bg-blue-500 bg-opacity-10! rounded-tl-lg rounded-tr-lg" align="justify">
      <q-tab name="percursos" icon="trending_up" label="Percursos" />
      <q-tab default name="consumiveis" icon="list_alt" label="Consumíveis" />
      <q-tab name="lotes" icon="event_note" label="Lotes de Inscrições" />
      <q-tab name="inscricao" icon="how_to_reg" label="Inscrições" />
    </q-tabs>
    <div class="row q-col-gutter-sm">
      <div class="col-12">
        <q-tab-panels v-model="tab" animated class="rounded-bl-lg  rounded-br-lg">
          <q-tab-panel class="p-0 sm:p-2" name="percursos">
            <CadastroPercursos :eventoId="eventoId"></CadastroPercursos>
          </q-tab-panel>
          <q-tab-panel class="p-0 sm:p-2" name="consumiveis">
              <CadastroConsumiveis :eventoId="eventoId" :evento="evento"></CadastroConsumiveis>
            </q-tab-panel>
          <q-tab-panel class="p-0 sm:p-2" name="lotes">
            <CadastroLotesInscricoes :eventoId="eventoId"></CadastroLotesInscricoes>
          </q-tab-panel>
          <q-tab-panel class="p-0 sm:p-2" name="inscricao">
            <CadastroInscricoes :eventoId="eventoId"></CadastroInscricoes>
          </q-tab-panel>
        </q-tab-panels>

      </div>
    </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import {
  QSpinnerGears, useQuasar
} from 'quasar';
// import ConsumivelListaPage from '../consumivel/ConsumivelListaPage';
// import LoteInscricaoListaPage from '../loteInscricao/LoteInscricaoListaPage';
// import PercursoListaPage from '../percurso/PercursoListaPage';
// import EventoComponent from './EventoComponent.vue';
import EventoModal from '../../../components/cadastro/EventoModal.vue';
const route = useRoute();

const tab = ref('percursos');
const evento = ref<any>(undefined);
const eventoId:String | String[] = route.params.eid;

const $q = useQuasar();
const { $geralService } = useNuxtApp();

onBeforeMount(() => {
  getEvento();
});


const getEvento = async () => {

  $q.loading.show({
    spinner: QSpinnerGears,
    spinnerSize: 100,
    message: 'Carregando Evento...'
  });

  const ret = await useCustomFetch(
    'getEventoById/' + eventoId,
    'get',
    null,
    undefined
  );
  // console.log('ret', ret);
  if (ret.valido) {
    evento.value = ret.data[0];
  }
  $q.loading.hide();

};

const confirmSave = () => {
  getEvento();
};

const openCadastro = () => {
  $q.dialog({
    component: EventoModal,
    persistent: true,
    componentProps: {
      id: eventoId,
    },
  })
    .onOk(async () => {
      confirmSave();
    })
    .onCancel(() => { });
};

const getUrlImagemThumb = (caminho: String) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: 128
  });
};
const getUrlImagem = (caminho: String) => {
  return $geralService.getUrlS3(caminho);
};


</script>

<style lang="scss" scoped>
.az-title {
  padding: 0px 10px 0px 20px;
  border-radius: 13px;
  background: rgba(128, 128, 128, 0.3);
  margin: 0px 10px 0px -16px;
}

.options {
  padding: 20px;
  margin-top: 20px;
  background-color: rgba(191, 191, 191, 0.15);
}

.caption {
  font-size: 18px;
  font-weight: 500;
}

.option {
  margin-top: 10px;
}

.option>span {
  margin-right: 10px;
}

.option>.dx-selectbox {
  display: inline-block;
  vertical-align: middle;
}
</style>
