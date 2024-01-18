<template>
    <div>
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-lime-400 to-gray-600" name="event"
                            size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Evento - {{ state.evento.sigla + ' ' + state.evento.ano + " - " + etapaDescricao }}</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="beforeSave"
                        :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <q-tabs v-model="tab" class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
                  <q-tab default name="dados" icon="line_style" label="Informações">
                    <q-badge v-if="$v.$validationGroups.informacoesError.$error" color="red" label="Imcompleto" />
                  </q-tab>
                  <q-tab name="localizacao" icon="map" label="Localização">
                    <q-badge v-if="$v.evento.endereco.$error" color="red" label="Imcompleto" />
                  </q-tab>
                  <q-tab name="conteudo" icon="collections" label="Banner" />
                  <q-tab name="adms" icon="group" label="Administradores" :class="{ 'text-negative': $v.evento.administradores.$error }">
                    <q-badge v-if="$v.evento.administradores.$error" color="red" label="Incompleto" />
                  </q-tab>
                  <q-tab v-if="!inserir" name="geral" icon="present_to_all" label="Página do Evento" />
                </q-tabs>
                <q-separator />
                <q-tab-panels :keep-alive="true" style="background: transparent !important" v-model="tab" animated>
                  <q-tab-panel name="dados">
                    <div class="q-ma-sm">
                      <div class="row q-col-gutter-sm">
                        <!-- GO Nome -->
                        <div class="col-sm-5 col-12">
                          <q-input counter maxlength="70" :hint="nomeRota" hide-bottom-space outlined v-model="state.evento.nome" :label="$v.evento.nome.$error ? 'Nome (Campo Obrigatório)' : 'Nome'" @blur="$v.evento.nome.$touch" :error="$v.evento.nome.$error" />
                        </div>
                        <!-- GO Sigla -->
                        <div class="col-sm-2 col-12">
                          <q-input counter maxlength="10" hide-bottom-space outlined v-model="state.evento.sigla" :label="$v.evento.sigla.$error ? 'Sigla (Campo Obrigatório)' : 'Sigla'" @blur="$v.evento.sigla.$touch" :error="$v.evento.sigla.$error" />
                        </div>
                        <!-- GO Ano -->
                        <div class="col-sm-2 col-12">
                            <q-select hide-bottom-space outlined v-model="state.evento.ano" label="Ano"
                            :dense="dense" :options="listaAnos">
                        </q-select>
                    </div>
                    <!-- GO Etapa -->
                    <div class="col-sm-3 col-12">
                        <q-select outlined v-model="state.evento.etapa" label="Etapa" :options="listaEtapas"> </q-select>
                    </div>
                    <!-- GO Abrangencia -->
                    <div class="col-sm-3 col-md-2 col-12">
                        <q-select outlined v-model="state.evento.abrangencia" label="Abrangência" :options="$constantes.ABRANGENCIA" />
                    </div>
                    <!-- GO Tipo Evento -->
                    <div class="col-sm-3 col-12">
                      <q-select :hint="hintTipo" outlined v-model="state.evento.tipoEvento" label="Tipo de evento" :options="['Rendimento', 'Educacional', 'Participação']"> </q-select>
                    </div>
                        <!-- GO Descritivo -->
                        <div class="col-sm-6 col-md-7 col-12">
                          <q-input counter maxlength="100" :hint="'Descreva em poucas palavras como o evento vai ser evento'" outlined v-model="state.evento.descritivo" :label="$v.evento.descritivo.$error ? 'Descritivo (Campo Obrigatório)' : 'Descritivo'" @blur="$v.evento.descritivo.$touch" :error="$v.evento.descritivo.$error" />
                        </div>
                        <div class="col-sm-6 col-12">
                          <q-field outlined label="Entidade Responsável" stack-label>
                            <template v-if="state.evento.entidadeResponsavel && state.evento.entidadeResponsavel.logo" v-slot:prepend>
                              <q-avatar rounded size="45px">
                                <q-img :src="getUrlImagemLocal(state.evento.entidadeResponsavel.logo)"></q-img>
                              </q-avatar>
                            </template>
                            <template v-slot:control>
                              <div class="self-center full-width no-outline" tabindex="0">
                                <span v-if="state.evento.entidadeResponsavel">{{ state.evento.entidadeResponsavel.nomeRazao }}{{ " (" + state.evento.entidadeResponsavel.sigla + ")" }}</span>
                              </div>
                            </template>
                            <template v-slot:append>
                              <q-btn color="primary" @click="selecionarEntidade()" icon="search" round>
                                <q-tooltip>Localizar Entidade</q-tooltip>
                              </q-btn>
                            </template>
                          </q-field>
                        </div>
                        <!-- GO Início -->
                        <div class="col-sm-3 col-12">
                          <CinputDate outlined :error="$v.evento.inicio.$error" :error-message="'Data inválida'" :dense="false" v-model="state.evento.inicio" label="Início" />
                        </div>
                        <!-- GO Fim -->
                        <div class="col-sm-3 col-12">
                          <CinputDate outlined :error="$v.evento.fim.$error" :error-message="'Data inválida'" :dense="false" v-model="state.evento.fim" label="Fim" />
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-field outlined :hint="state.evento.taxaAzimuteCertoAbsorver ? 'Não será cobrado do atleta a taxa de inscrição' : 'Será repassada ao atleta a taxa de inscrição'">
                            <q-checkbox v-model="state.evento.taxaAzimuteCertoAbsorver" label="Absorver Taxa de Inscrição" />
                          </q-field>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-field outlined :hint="state.evento.publicado ? 'O evento fica visível nas plataformas integradas':'O evento fica visível somente para cadastro'">
                            <q-checkbox v-model="state.evento.publicado" label="Publicar" />
                          </q-field>
                        </div>
                      </div>
                    </div>
                  </q-tab-panel>
                  <q-tab-panel name="localizacao">
                    <div class="row q-col-gutter-sm">
                      <!-- GO Cep -->
                      <div class="col-sm-2 col-12">
                        <q-input @focus="focusedCep = true" @blur="focusedCep = false" :hint="$q.screen.gt.sm && focusedCep ? 'Enter para localizar' : undefined" outlined label="CEP" @keyup.enter="buscarCep" :error="$v.evento.endereco.cep.$error" error-message="Cep inválido" unmasked-value mask="##.###-###" v-model="state.evento.endereco.cep" bottom-slots>
                          <template v-slot:append>
                            <q-btn @click="buscarCep" round dense icon="search">
                              <q-tooltip>Localiza o endereço por cep</q-tooltip>
                            </q-btn>
                          </template>
                        </q-input>
                      </div>
                      <!-- GO Logradouro -->
                      <div class="col-sm-8 col-12">
                        <q-input outlined label="Logradouro (Rua, Avenida, Fazenda, ... etc.)" maxlength="120" v-model="state.evento.endereco.logradouro" :error="$v.evento.endereco.logradouro.$error" :error-message="mensagemRequired" bottom-slots />
                      </div>
                      <!-- GO Número -->
                      <div class="col-sm-2 col-12">
                        <q-input outlined label="Número" type="number" v-model="state.evento.endereco.numero" :error="$v.evento.endereco.numero.$error" bottom-slots :error-message="mensagemRequired" />
                      </div>
                      <!-- GO Complemento -->
                      <div class="col-sm-5 col-12">
                        <q-input outlined label="Complemento"  v-model="state.evento.endereco.complemento" />
                      </div>
                      <!-- GO Bairro -->
                      <div class="col-sm-3 col-12">
                        <q-input outlined label="Bairro" v-model="state.evento.endereco.bairro" :error="$v.evento.endereco.bairro.$error" bottom-slots :error-message="mensagemRequired" />
                      </div>
                      <!-- GO Cidade -->
                      <div class="col-sm-3 col-12">
                        <q-input outlined label="Cidade"  v-model="state.evento.endereco.cidade" :error="$v.evento.endereco.cidade.$error" bottom-slots :error-message="mensagemRequired" />
                      </div>
                      <div class="col-sm-1 col-12">
                        <!-- GO Tipo Uf -->
                        <q-select outlined v-model="state.evento.endereco.uf" label="UF" :emit-value="true" option-value="sigla" option-label="sigla" filter :options="$constantes.ESTADOS" />
                      </div>
                      <!-- GO Latitude -->
                      <div class="col-sm-3 col-12">
                        <q-input outlined label="Latitude" type="number"  v-model="state.evento.endereco.localizacao.lat" :error="$v.evento.endereco.localizacao.lat.$error" bottom-slots :error-message="mensagemRequired">
                          <template v-slot:append>
                            <q-btn @click="centralizaMapa()" round dense flat icon="refresh">
                              <q-tooltip>Atualiza o Mapa</q-tooltip>
                            </q-btn>
                          </template>
                        </q-input>
                      </div>
                      <!-- GO Longitude -->
                      <div class="col-sm-3 col-12">
                        <q-input outlined label="Longitude" type="number"  v-model="state.evento.endereco.localizacao.lng" :error="$v.evento.endereco.localizacao.lng.$error" bottom-slots :error-message="mensagemRequired">
                          <template v-slot:append>
                            <q-btn @click="centralizaMapa()" round dense flat icon="refresh">
                              <q-tooltip>Atualiza o Mapa</q-tooltip>
                            </q-btn>
                          </template>
                        </q-input>
                      </div>
                      <div v-if="mostraMapa" class="my-map col-12">
                        <div ref="pac-card" id="pac-card" class="pac-card">
                          <div v-show="mostraLocalizador" id="pac-container" class="col-12 label-no-dark">
                            <q-input dense :dark="false" style ref="localizador" placeholder="Localizar" outlined v-model="busca" />
                          </div>
                        </div>
                        <div :style="{ height: '400px',  borderRadius: '10px' }" id="map" ref="map"></div>
                      </div>
                      <div class="col-12">
                        <!-- <GMapAutocomplete placeholder="Digite um lugar"/>
                         <GMapMap
          :center="center"
          :ref="mapa"
          :zoom="7"
          
          style="width: 500px; height: 300px"
      >
      
        <GMapMarker
            :key="index"
            v-for="(marker, index) in markers"
            :position="marker.position"
        />
      </GMapMap> -->
                      </div>
                    </div>
                  </q-tab-panel>
                  <q-tab-panel name="adms">
                    <q-list bordered class="rounded-borders">
                      <q-item-label :dense="true" style="padding: 5px; font-size: 17px"
                        >Administradores
                        <q-btn color="primary" @click="inserirAdministrador" round size="xs" icon="add">
                          <q-tooltip>Inserir Administrador</q-tooltip>
                        </q-btn>
                      </q-item-label>
                      <div v-for="(adm, index) in state.evento.administradores" :key="index">
                        <q-separator />
                        <div class="row q-col-gutter-sm q-pa-md">
                          <div class="col-sm-5 col-12">
                            <q-field :readonly="index === 0" outlined label="Pessoa" stack-label :dense="false" :error="!adm.pessoa" error-message="Campo obrigatório">
                              <template v-if="adm.pessoa && adm.pessoa.foto" v-slot:prepend>
                                <q-avatar size="50px">
                                  <q-img :src="getUrlImagemLocal(adm.pessoa.foto)"></q-img>
                                </q-avatar>
                              </template>
                              <template v-slot:control>
                                <div class="self-center full-width no-outline" tabindex="0">
                                  <span v-if="adm.pessoa">{{ adm.pessoa.nome }}{{ adm.pessoa.nome !== adm.pessoa.apelido ? "(" + adm.pessoa.apelido + ")" : "" }}</span>
                                </div>
                              </template>
                              <template v-slot:append>
                                <q-btn
                                  color="primary"
                                  v-if="index > 0"
                                  @click="selecionarAdm(index)"
                                  icon="search"
                                  round
                                >
                                  <q-tooltip>Localizar Pessoa</q-tooltip>
                                </q-btn>
                              </template>
                            </q-field>
                          </div>
                          <div class="col-sm-2 col-7">
                            <q-select :readonly="index === 0" label="Tipo de Acesso" transition-show="scale" transition-hide="scale" outlined v-model="adm.acesso" :options="acessos" />
                          </div>
                          <div class="col-sm-3 col-5" v-if="index > 0 && tipoAcessoEvento === 'Administrativo'">
                            <q-btn color="red" outline @click="excluirAdministrador(index, $event)" label="Excluir" icon="delete">
                              <q-tooltip>Excluir Acesso</q-tooltip>
                            </q-btn>
                          </div>
                        </div>
                      </div>
                    </q-list>
                  </q-tab-panel>
                  <q-tab-panel name="conteudo">
                    <q-card>
                      <q-card-section>
                        <div class="row q-col-gutter-sm">
                          <div class="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2">
                            <q-card inline class="q-ma-sm">
                              <q-card-section>
                                <q-img style="width: 100%" :src="getUrlImagem" :ratio="1200 / 630" spinner-color="primary" spinner-size="82px"></q-img>
                              </q-card-section>
                              <q-separator />
                              <q-card-section>
                                <q-btn class="q-mr-sm" @click="buscarImagem" outline color="primary" label="Buscar Imagem" />
                                <q-btn class="q-mr-sm" v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && state.evento.imagem !== undefined && state.evento.imagem !== '')" @click="imageData = null" outline color="secondary" label="Ficar Sem" />
                                <q-btn class="q-mr-sm q-mt-sm" v-if="imageData !== '' && state.evento.imagem !== undefined && state.evento.imagem !== ''" @click="imageData = ''" outline color="deep-purple" label="Restaurar" />
                              </q-card-section>
                            </q-card>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </q-tab-panel>
                  <q-tab-panel name="geral" class="">
                    <q-list bordered class="rounded-borders az-radius-top">
                        <q-list bordered class="rounded-lg">
                                    <Expansion group="grupoGeral" icon="link" labelBotao="Inserir Grupo" corBotao="indigo" :erroPadrao="$v.evento.grupoLinks.$error" titulo="Grupos de Links" @onInserir="inserirGrupoLink" >
                                    <GrupoLink v-for="(item, index) in state.evento.grupoLinks"
                                                            draggable="true"
                                                            @dragend="(e: any) => finishDrag(state.evento.grupoLinks, item, index, e)"
                                                            @dragstart="(e: any) => startDrag(item, index, e)"
                                                        :key="'grupoLink' + index" v-model="state.evento.grupoLinks[index]"
                                                        :id="state.evento._id" :index="index"
                                                        :collectionName="'evento/' + state.evento.sigla + '/' + state.evento.ano"
                                                        @onExcluirGrupoLink="excluirGrupoLink" />
                                    </Expansion>
                                    <Expansion group="grupoGeral" labelBotao="Inserir Conteudo" corBotao="indigo" icon="ballot" :erroPadrao="$v.evento.conteudos.$error" titulo="Conteúdos Extras" @onInserir="inserirConteudo">
                                        <ConteudoExtra v-for="(item, index) in state.evento.conteudos"
                                        draggable="true"
                                                            @dragend="(e: any) => finishDrag(state.evento.conteudos, item, index, e)"
                                                            @dragstart="(e: any) => startDrag(item, index, e)"
                                                            :key="'conteudo' + index" v-model="state.evento.conteudos[index]"
                                                            @onExcluir="deletarGeral" />
                                    </Expansion>
                                    <Expansion group="grupoGeral" labelBotao="Inserir Contato" corBotao="indigo" icon="contacts" :erroPadrao="$v.evento.contatos.$error" titulo="Contatos" @onInserir="inserirContato">
                                        <Contato v-for="(item, index) in state.evento.contatos"
                                            @dragover="(e: any) => onDragOver(item, index, e)" draggable="true"
                                                        @dragend="(e: any) => finishDrag(state.evento.contatos, item, index, e)"
                                                        @dragstart="(e: any) => startDrag(item, index, e)"
                                                            :key="'contato' + index" v-model="state.evento.contatos[index]"
                                                            :index="index"
                                                            @onExcluir="deletarGeral" />
                                    </Expansion>
                                    <Expansion group="grupoGeral" labelBotao="Inserir" corBotao="indigo" icon="more_time" :erroPadrao="$v.evento.programacoes.$error" titulo="Programação" @onInserir="inserirProgramacoes">
                                    <Programacao v-for="(item, index) in state.evento.programacoes"
                                                @dragover="(e: any) => onDragOver(item, index, e)" draggable="true"
                                                            @dragend="(e: any) => finishDrag(state.evento.programacoes, item, index, e)"
                                                            @dragstart="(e: any) => startDrag(item, index, e)"
                                                                :key="'programacao' + index" v-model="state.evento.programacoes[index]"
                                                                :index="index"
                                                                @onExcluir="deletarGeral" />   
                                    </Expansion>
                                
                                    <q-expansion-item group="grupoGeral" header-class="az-radius-top" expand-separator icon="tag"
                                            label="Tags">
                                            <div class="row q-col-gutter-sm p-4">
                                            <div class="col-12">
                                                <q-field outlined label="Tags" stack-label :dense="dense">
                                                    <template v-slot:control>
                                                        <div class="self-center full-width no-outline" tabindex="0">
                                                            <q-chip v-for="(tag, index) in state.evento.tags" :key="index" dense
                                                                removable @remove="state.evento.tags.splice(index, 1)"
                                                                color="primary" text-color="white">
                                                                {{ tag }}
                                                            </q-chip>
                                                        </div>
                                                    </template>
                                                    <template v-slot:append>
                                                        <q-btn color="primary" @click="addTag()" icon="add" round>
                                                            <q-tooltip>Adicionar Tag</q-tooltip>
                                                        </q-btn>
                                                    </template>
                                                </q-field>
                                            </div>
                                            </div>
                                        </q-expansion-item>
                                </q-list>
                      <!-- <q-expansion-item group="grupoGeral" expand-separator icon="event_note" label="Banners">Banner</q-expansion-item>
                        <q-expansion-item group="grupoGeral" expand-separator icon="event_note" label="Hospedagem">Hospedagem</q-expansion-item>
                        <q-expansion-item group="grupoGeral" expand-separator icon="event_note" label="Alimentação">Alimentação</q-expansion-item>
                        <q-expansion-item group="grupoGeral" expand-separator icon="event_note" label="Fotos">Fotos</q-expansion-item>
                        <q-expansion-item group="grupoGeral" expand-separator icon="event_note" label="Vídeos">Vídeos</q-expansion-item>
                        <q-expansion-item group="grupoGeral" expand-separator icon="event_note" label="Notícias">Notícias</q-expansion-item> -->
                    </q-list>
                  </q-tab-panel>
                </q-tab-panels>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minLength, email, requiredIf } from "@vuelidate/validators";
import ImageUpload2 from "../ImageUpload2.vue";
import BuscarEntidade from "../BuscarEntidade.vue";
import BuscarPessoa from "../BuscarPessoa.vue";
import { Loader } from "@googlemaps/js-api-loader"
import { stat } from 'fs';

const loader = new Loader({
    apiKey: "AIzaSyBYArIKIP3RXubz_6gNW_3oBu0JNH9-sZA",
    version: "weekly",
    libraries: ["places", "drawing"]
});


const props = defineProps({
    id: { type: String, default: null },
    copia: null,
});
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

defineEmits([...useDialogPluginComponent.emits]);
const geral = useGeral();
const { $geralService } = useNuxtApp();
const dense = ref(false);
const map: any = ref(null);
const tipoAcessoEvento = ref('');
const objSelecionadoIndex = ref(-1);
const objSelecionado = ref<any>(null);
const objSelecionadoNome = ref<String>('');

// GO data
const state: any = reactive({
    evento: {
        percursos: [],
        administradores: [
        ],
        campeonatos: [],
        lotesInscricoes: [],
        contatos: [],
        documentos: [],
        programacoes: [],
        videos: [],
        grupoLinks: [],
        conteudos: [],
        parceiros: [],
        hospedagens: [],
        locaisAlimentacao: [],
        pontosTuristicos: [],
        banners: [],
    }
});

const tab = ref('dados');
const imageData = ref<any>('');
const imageUrl = ref('');

const $q = useQuasar();

const listaEtapas = ['Única', 'Primeira', 'Segunda', 'Terceira', 'Quarta', 'Quinta', 'Sexta', 'Sétima', 'Oitava'];

const hintTipo = computed(() => {
    if (state.evento.tipoEvento === 'Rendimento') {
        return 'Faz parte de algum ranking';
    } else if (state.evento.tipoEvento === 'Educacional') {
        return 'Campeonatos estudantis';
    } else {
        return 'Somente participação';
    }
});

const mensagemRequired = computed(() => {
    return 'Campo obrigatório';
});

const acessos = computed(() => {
    return ['Administrativo', 'Financeiro', 'Consulta'];
});

const nomeRota = computed(() => {
    const rota = $geralService.removeCaracteresEspeciais(state.evento.nome + '-' + state.evento.sigla + '-' + state.evento.ano + '-' + (state.evento.etapa == 'Única' ? '' : (state.evento.etapa + '-etapa')));
    state.evento.rota = rota;
    return rota
});

watch(() => nomeRota, async (newQuestion, oldQuestion) => {
    state.evento.rota = newQuestion;
})


// const setRota = () => {
//     state.evento.rota = $geralService.removeCaracteresEspeciais(state.evento.nome+"-"+state.evento.sigla+"-"+state.evento.ano+"-"+state.evento.etapa);
// }

watch(() => tab.value, async (val, oldVal) => {
    if (val === 'localizacao') {
        iniciaMapa();
    }
})


const mapa = ref(null)
const mostraMapa = ref(true);
const center = ref({ lat: 51.093048, lng: 6.842120 })
const markers = ref([
    {
        position: {
            lat: 51.093048, lng: 6.842120
        }
    }
])

const over = ref<any>({});
const startLoc = ref(0);
const dragging = ref(false);
const dragFrom = ref({});
const startDrag = (item: any, i: any, e: any) => {
    startLoc.value = e.clientY;
    dragging.value = true;
    dragFrom.value = item;
};
const finishDrag = (lista: any, item: any, pos: number, e: any) => {
    lista.splice(pos, 1)
    lista.splice(over.value.pos, 0, item);
    over.value = {}
};
const onDragOver = (item: any, pos: number, e: any) => {
    const dir = (startLoc.value < e.clientY) ? 'down' : 'up';
    setTimeout(() => {
        over.value = { item, pos, dir };
    }, 50)
};

const focusedCep = ref(false);
const googleMaps = ref<any>(null);

const busca = ref('');
 const newPlace = ref<any>(null);
 const marker = ref<any>(null);

const showBuscarPessoa = ref(false);

const indexSelecaoPessoa = ref(0);

const selecionarPessoa = (pessoa: any) => {
    state.evento.administradores[indexSelecaoPessoa.value].pessoa = pessoa;
    showBuscarPessoa.value = false;
};

const inserirAdministrador = () => {
    state.evento.administradores.push({
        pessoa: undefined,
        acesso: 'Administrativo'
    });
};

const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        years.push(i);
    }
    return years;
};
const listaAnos = getYears();

const excluirAdministrador = (index: number, event: any) => {
    event.stopPropagation();
    $q.dialog({
        title: 'Excluir Administrador',
        message: 'Deseja realmente excluir este administrador?',
        cancel: true
    }).onOk(async () => {
        state.evento.administradores.splice(index, 1);
    });
};

const centralizaMapa = async () => {
    mostraMapa.value = false;
    setTimeout(() => {
        mostraMapa.value = true;
        setTimeout(() => {
             iniciaMapa();
        }, 200);
            
      }, 200);
}              
         

const buscarCep = async () => {
    if (state.evento.endereco.cep.length === 8) {
        const end = await $geralService.buscarCep(state.evento.endereco.cep);
        if (!end.erro) {
            // Object.assign(state.entidade.enderecos[index], end);
            state.evento.endereco.logradouro = end.logradouro;
            state.evento.endereco.bairro = end.bairro;
            state.evento.endereco.cidade = end.localidade;
            state.evento.endereco.uf = end.uf;
            state.evento.endereco.desbloquearEndereco = false;
        } else {
             $q.notify({
                color: 'red',
                position: 'top',
                icon: 'close',
                message: 'CEP inválido!'
            });
            state.evento.endereco.desbloquearEndereco = true;
        }
    } else {
        $q.notify({
            color: 'red',
            position: 'top',
            icon: 'close',
            message: 'CEP inválido!'
        });
    }
};




const mostraLocalizador = ref(true);
const localizador = ref(null);

const isString = (str: any) => {
    if (typeof str === 'string') {
        return true;
    } else {
        return false;
    }
};

const iniciaMapa = () => {
    loader.load().then(async (google: any) => {
        if (isString(state.evento.endereco.localizacao.lat)) {
            state.evento.endereco.localizacao.lat = parseFloat(state.evento.endereco.localizacao.lat);
        }
        if(isString(state.evento.endereco.localizacao.lng)){
            state.evento.endereco.localizacao.lng = state.evento.endereco.localizacao.lng;
        }

        googleMaps.value = google;
        // @ts-ignore
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
          const mapProp = {
            center: new google.maps.LatLng(state.evento.endereco.localizacao),
            zoom: 14,
            mapTypeId: 'roadmap',
            mapTypeControl: true,
            gestureHandling: 'cooperative'
          };
          const map = await new Map(document.getElementById('map'), mapProp);
          // @ts-ignore
          const addressInput = localizador.value.getNativeElement();
          const card = document.getElementById('pac-card');

          map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
        
          const addressInputAutocomplete = new google.maps.places.Autocomplete(addressInput, {});
          addressInputAutocomplete.addListener('place_changed', function () {
            newPlace.value = addressInputAutocomplete.getPlace();
              busca.value = newPlace.value.name;
            if (newPlace.value.geometry) {
              state.evento.endereco.localizacao.lat = newPlace.value.geometry.location.lat();
              state.evento.endereco.localizacao.lng = newPlace.value.geometry.location.lng();
               if (newPlace.value.geometry.viewport) {
                    map.fitBounds(newPlace.value.geometry.viewport);
                } else {
                    map.setCenter(newPlace.value.geometry.location);
                    map.setZoom(18);
                }
              }
              if (newPlace.value.geometry) {
                  marker.value.setPosition(newPlace.value.geometry.location);
                  marker.value.setVisible(true);
              }
              
          });
          marker.value = await new google.maps.Marker({
            map: map,
            title: 'Localização',
              position: state.evento.endereco.localizacao,
            visible: true,
            draggable: true
          });
          setTimeout(() => {
            mostraLocalizador.value = true;
          }, 500);
          google.maps.event.addListener(marker.value, 'dragend', function () {
            state.evento.endereco.localizacao.lat = marker.value.position.lat();
            state.evento.endereco.localizacao.lng = marker.value.position.lng();
          });

        // Esta linha abaixo está tendo perda de referência possívelmente será removida
        // TODO testar perda de referência
        map.value = map;
     });
};





const etapaDescricao = computed(() => {
    if (state.evento.etapa === 'Única') {
        return 'Etapa Única ';
    } else {
        return state.evento.etapa + ' Etapa';
    }
});

// GO valida
const validations = {
    evento: {
        nome: {
            required
        },
        descritivo: {
            required
        },
        sigla: {
            required
        },
        inicio: {
            required
        },
        fim: {
            required
        },
        administradores: {
                    $each: helpers.forEach( {
                pessoa: {
                    required
                }
            })
        },
        endereco: {
            cep: {
                required,
                    minLength: minLength(8)
            },
            logradouro: {
                required
            },
            numero: {
                required
            },
            bairro: {
                required
            },
            cidade: {
                required
            },
            uf: {
                required
            },
            pais: {
                required
            },
            localizacao: {
                lat: {
                    required
                },
                lng: {
                    required
                }
            }
        },
        grupoLinks: {
            $each: helpers.forEach({
                descricao: {
                    required
                },
                icone: {
                    required
                },
                links: {
                    $each: helpers.forEach({
                        descricao: {
                            required
                        },
                        url: {
                            required
                        }
                    })
                }
            })
        },
        conteudos: {
            $each: helpers.forEach({
                titulo: {
                    required
                },
                texto: {
                    required
                },
                icone: {
                    required
                }
            })
        },
        contatos: {
            $each: helpers.forEach({
                nome: {
                    required
                },
                cargo: {
                    required
                },
                telefone: {
                    // @ts-ignore
                    requiredIfFuction: requiredIf((dd: any, obj: any) => {
                        if (obj.email) {
                            return false;
                        }
                        return true;
                    }),
                },
                email: {
                    email,
                    // @ts-ignore
                    requiredIfFuction: requiredIf((dd: any, obj: any) => {
                        if (obj.telefone) {
                            return false;
                        }
                        return true;
                    }),
                }
            })
        },
        programacoes: {
            $each: helpers.forEach({
                titulo: {
                    required
                },
                inicio: {
                    required
                },
                fim: {
                    required
                }
            })
        }
    },
    $validationGroups: {
        informacoesError: ["evento.nome", "evento.sigla", "evento.descritivo", "evento.inicio", "evento.fim"]
    }

   
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

onBeforeMount(async () => {
    if (props.id) {
        const ret: any = await useCustomFetch('evento/getPopulate', 'post', {
            filtro: {
                lixo: false,
                _id: props.id
            },
            populateObj: [
                {
                    path: 'entidadeResponsavel',
                    select: {
                        nomeRazao: 1,
                        nomeFantasia: 1,
                        sigla: 1,
                        logo: 1
                    }
                },
                {
                    path: 'administradores.pessoa',
                    select: {
                        nome: 1,
                        apelido: 1,
                        foto: 1
                    }
                }
            ]
        }, undefined);
        if (ret.valido) {
            state.evento = ret.data[0];
            for (let index = 0; index < state.evento.administradores.length; index++) {
                const adm = state.evento.administradores[index];
                if (adm.pessoa._id === geral.pessoa._id) {
                    tipoAcessoEvento.value = adm.acesso;
                    break;
                }
            }

            if (!state.evento.grupoLinks) {
                state.evento.grupoLinks = [];
            }
            
            if (props.copia) {
                state.evento.titulo = state.evento.titulo + " (Cópia)";
                state.evento._id = undefined;
                state.evento.__v = undefined;
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
        state.evento= {
            _id: await $geralService.getId(),
            entidade: geral.entidade._id,
            abrangencia: 'Municipal',
            tipoEvento: 'Rendimento',
            endereco: await $geralService.getEnderecoPadrao('Comercial'),
            percursos: [],
            ano: 2023,
            administradores: [
                {
                    pessoa: {
                        _id: geral.pessoa._id,
                        nome: geral.pessoa.nome,
                        apelido: geral.pessoa.apelido,
                        foto: geral.pessoa.foto
                    },
                    acesso: 'Administrativo'
                }
            ],
            campeonatos: [],
            publicado: false,
            lotesInscricoes: [],
            contatos: [],
            documentos: [],
            programacoes: [],
            videos: [],
            conteudos: [],
            grupoLinks: [],
            parceiros: [],
            hospedagens: [],
            locaisAlimentacao: [],
            pontosTuristicos: [],
            banners: [],
            lixo: false
        };
        inserir.value = true;
    }
});



const getUrlImagem = computed(() => {
    return $geralService.getUrlImagem(imageData.value, state.evento, 'imagem', imageUrl.value);
});

const getUrlImagemLocal = (caminho: String) => {
    return $geralService.getUrlS3Thumb(caminho,  {
        height: 128
    });
};

const addTag = () => {
    $q.dialog({
        title: 'Adicionar Tag',
        message: 'Digite uma tag por vez',
        prompt: {
            model: '',
            type: 'text' // optional
        },
        cancel: true
    }).onOk(data => {
        if (data) {
            state.evento.tags.push(data);
        }
    });
};

const selecionarEntidade = () => {
    $q.dialog({
        component: BuscarEntidade,
        persistent: true,
        componentProps: {
        },
    })
        .onOk(async (data) => {
            confirmSelecaoEntidade(data);
        })
        .onCancel(() => { });

}

const confirmSelecaoEntidade = (entidade: any) => {
    state.evento.entidadeResponsavel = entidade;
};

const selecionarAdm = (index: number) => {
    indexSelecaoPessoa.value = index;
    $q.dialog({
        component: BuscarPessoa,
        persistent: true,
        componentProps: {
        },
    })
        .onOk(async (data) => {
            confirmSelecaoAdm(data);
        })
        .onCancel(() => { });

}

const confirmSelecaoAdm = (pessoa: any) => {
    if (pessoa) {
        state.evento.administradores[indexSelecaoPessoa.value].pessoa = pessoa;
    }
};

const buscarImagem = () => {
    $q.dialog({
        component: ImageUpload2,
        persistent: true,
        componentProps: {
            winit: 1200,
            hinit: 630
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

const beforeSave = () => {
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Validando dados... Aguarde!',
        messageColor: 'white'
    });
    // $v.value.evento.vinculos.$touch();
    $v.value.evento.$touch();

    if ($v.value.evento.$error || !(imageData.value || state.evento.imagem)) {

        $q.loading.hide();
        $q.notify({
            color: 'warning',
            position: 'top',
            icon: 'check',
            message: 'Preeencha todos os campos obrigatórios para salvar!'
        });
        return;

    }

    // if ($v.value.evento.vinculos.$error) {
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

    delete state.evento.__v;


    const newEvento = JSON.parse(JSON.stringify(state.evento));

    if (imageData.value !== '') {
        $q.loading.show({
            spinner: QSpinnerOval,
            spinnerColor: 'white',
            spinnerSize: 60,
            message: 'Fazendo upload de imagem...Aguarde!',
            messageColor: 'white'
        });
    }

    $geralService.executaUpload(
        newEvento,
        'imagem',
        imageData.value,
        inserir.value,
        'jpg',
        'eventos/imagens/',
        save,
        undefined
    );
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
const save = async (newEvento: any, nomeTempFile: any) => {
    
    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Salvando registro...Aguarde!',
        messageColor: 'white'
    });
    let url = 'evento';
    let tipo = 'post';
    if (!inserir.value) {
        url += ('/' + props.id);
        tipo = 'put';
    }

    const ret: any = await useCustomFetch(url, tipo, newEvento, undefined);

    if (ret.valido) {
        $q.loading.hide();
        $q.notify({
            color: 'green',
            position: 'top',
            icon: 'check',
            message: 'Registro salvo com sucesso!'
        });
        onDialogOK(ret.data);
    } else {
        $q.loading.hide();
        if (nomeTempFile) {
            $geralService.deleteImagem(nomeTempFile);
            $q.loading.hide();
        }
    }
};

const excluirGrupoLink = (index: number) => {
    // if (state.evento.grupoLinks[index].documentos.length > 0) {
    // }
    $q
        .dialog({
            title: 'Confirmação',
            message: `Deseja realmente excluir o grupo ${state.evento.grupoLinks[index].descricao}? Todos os links deste grupo serão excluídos juntos.`,
            focus: 'cancel',
            ok: {
                color: 'primary',
                label: 'sim'
            },
            cancel: {
                color: 'negative',
                label: 'Não'
            }
        })
        .onOk(async () => {
            state.evento.grupoLinks.splice(index, 1);
            state.evento.grupoLinks.forEach((element: any) => {
                element.expanded = false;
            });
        });
};


const inserirGeral = (nomeLista: any, inicio: any) => {
    objSelecionadoIndex.value = -1;
    objSelecionadoNome.value = nomeLista;
    objSelecionado.value = null;
    state.evento[nomeLista].forEach((element: any) => {
        element.expanded = false;
    });
    state.evento[nomeLista].push(inicio || {});
};
const deletarGeral = (nomeLista: any, index: number) => {
    state.evento[nomeLista].splice(index, 1);
    state.evento[nomeLista].forEach((element: any) => {
        element.expanded = false;
    });
};

const inserirGrupoLink = () => {
    state.evento.grupoLinks.forEach((element: any) => {
        element.expanded = false;
    });

    if (state.evento.grupoLinks.length === 0) {
        state.evento.grupoLinks.push({
            links: [],
            descricao: 'Documentos',
            icone: 'fas fa-folder-open',
            expanded: true
        });
    } else {
        state.evento.grupoLinks.push({
            links: [],
            descricao: null,
            icone: null,
            expanded: true
        });
    }
};

const inserirConteudo = () => {
    inserirGeral('conteudos', { titulo: '', texto: '', icone: '', expanded: true });
}
const inserirContato = () => {
    inserirGeral('contatos', { nome: null, cargo: null, telefone: null, email: null, expanded: true });
}
const inserirProgramacoes = () => {
    inserirGeral('programacoes', { titulo: null, inicio: null, fim: null, icone: null, descricao: null, expanded: true });
}

</script>

