<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-avatar rounded size="35px" font-size="30px" class="bg-gradient-to-l from-yellow-500 to-yellow-700" text-color="white" icon="settings" />

          <q-toolbar-title class="">Configurações do Site</q-toolbar-title>
          <!-- GO btnSave -->
          <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive" aria-label="Salvarmargin-extra - " @click="save" :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel" :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
            <q-tab default name="contatos" icon="contact_page" label="Contatos" />
            <q-tab name="menu" icon="menu" label="Menu" />
            <q-tab name="midias" icon="image" label="Mídias" />
            <q-tab name="layout" icon="line_style" label="Layout" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="contatos">
              <q-markup-table flat bordered>
                <thead class="">
                  <tr>
                    <th colspan="6">
                      <div class="row no-wrap items-center">
                        <q-btn class="q-ml-sm" color="primary" label="Novo Contato" icon="add" @click="state.entidadeSite.contatos.push({})">
                          <q-tooltip> Novo Contato </q-tooltip>
                        </q-btn>
                      </div>
                    </th>
                  </tr>
                  <tr>
                    <th class="text-left text-subtitle2"></th>
                    <th class="text-left text-subtitle2">Cargo</th>
                    <th class="text-left">Nome</th>
                    <th class="text-left">Email</th>
                    <th class="text-left">telefone</th>
                    <th class="text-right">Funções</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in state.entidadeSite.contatos" :key="index" :class="{ 'az-tipo-menu': item.items }" draggable="true" @dragover="(e) => onDragOver(item, index, e)" @dragend="(e) => finishDrag(state.entidadeSite.contatos, item, index, e)" @dragstart="(e) => startDrag(item, index, e)">
                    <td class="text-right" style="max-width: 55px; min-width: 55px">
                      <q-btn btn-scale push round glossy class="q-mr-xs" icon="swap_vert" />
                      <!-- <q-btn btn-scale push round glossy class="q-mr-xs" color="grey" icon="arrow_upward" @click="$geralService.moverParaCima(listConteudo, index)" /> -->
                      <!-- <q-btn btn-scale push round glossy class="q-mr-md" color="grey" icon="arrow_downward" @click="$geralService.moverParaBaixo(listConteudo, index)" /> -->
                    </td>

                    <td class="text-left" style="min-width: 200px">
                      <q-input dense autofocus outlined v-model="item.cargo" type="text" />
                    </td>
                    <td class="text-left" style="min-width: 200px">
                      <q-input dense outlined v-model="item.nome" type="text" />
                    </td>
                    <td class="text-left" style="min-width: 200px">
                      <q-input dense outlined v-model="item.email" type="text" />
                    </td>
                    <td class="text-left" style="min-width: 200px">
                      <q-input dense outlined v-model="item.fone" type="text" />
                    </td>
                    <td class="text-right" style="width: 85px">
                      <!-- <q-btn class="q-mr-xs" color="grey" icon="arrow_upward" @click="$geralService.moverParaCima(state.entidadeSite.contatos, index)" />
                                                    <q-btn class="q-mr-md" color="grey" icon="arrow_downward" @click="$geralService.moverParaBaixo(state.entidadeSite.contatos, index)" /> -->
                      <q-btn color="negative" icon="delete" @click="state.entidadeSite.contatos.splice(index, 1)" />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>
            <q-tab-panel name="menu">
              <q-markup-table flat bordered>
                <thead>
                  <tr>
                    <th colspan="8">
                      <div class="row no-wrap items-center">
                        <q-btn class="q-ml-sm" color="primary" icon="add" label="Novo Atalho" @click="novoAtalho()">
                          <q-tooltip> Novo Atalho </q-tooltip>
                        </q-btn>
                        <q-btn class="q-ml-sm" color="warning" icon="add" label="Novo Submenu" @click="novoSubMenu()">
                          <q-tooltip> Novo SubMenu </q-tooltip>
                        </q-btn>
                        <q-breadcrumbs class="q-ml-lg">
                          <q-breadcrumbs-el style="font-size: 15px" :class="{ 'cursor-pointer': index < listCaminhos.length - 1 }" @click="setCaminho(index)" v-for="(item, index) in listCaminhos" :key="index" :label="item.display" />
                        </q-breadcrumbs>
                      </div>
                    </th>
                  </tr>
                  <tr>
                    <th class="text-left text-subtitle2"></th>
                    <th class="text-left text-subtitle2">Título</th>
                    <th class="text-left">Endereço</th>
                    <th class="text-left">Tooltip</th>
                    <th class="text-left">Ícone</th>
                    <th class="text-left">Target</th>
                    <th class="text-right">Funções</th>
                  </tr>
                </thead>
                <tbody>
                  <tr :class="{ 'az-tipo-menu': item.items }" draggable="true" @dragover="(e) => onDragOver(item, index, e)" @dragend="(e) => finishDrag(listConteudo, item, index, e)" @dragstart="(e) => startDrag(item, index, e)" v-for="(item, index) in listConteudo" :key="index">
                    <td class="text-right" style="max-width: 55px; min-width: 55px">
                      <q-btn btn-scale push round glossy class="q-mr-xs" icon="swap_vert" />
                      <!-- <q-btn btn-scale push round glossy class="q-mr-xs" color="grey" icon="arrow_upward" @click="$geralService.moverParaCima(listConteudo, index)" /> -->
                      <!-- <q-btn btn-scale push round glossy class="q-mr-md" color="grey" icon="arrow_downward" @click="$geralService.moverParaBaixo(listConteudo, index)" /> -->
                    </td>
                    <td class="text-left" style="min-width: 200px">
                      <q-input dense autofocus outlined v-model="item.label" type="text" />
                    </td>
                    <td class="text-left" style="min-width: 200px">
                      <q-input v-if="!item.items" dense outlined v-model="item.href" type="text" />
                    </td>
                    <td class="text-left" style="min-width: 200px">
                      <q-input dense outlined v-model="item.tooltip" type="text" />
                    </td>
                    <td class="text-left" style="min-width: 200px">
                      <q-input dense outlined v-model="item.icon" type="text" />
                    </td>
                    <td class="text-left">
                      <q-checkbox v-if="!item.items" v-model="item.abrirNovaAba" label="Abrir em Nova Aba" />
                    </td>
                    <td class="text-right" style="max-width: 87px; min-width: 87px">
                      <q-btn btn-scale push round glossy v-if="item.items" class="q-mr-xs" @click="addCaminho(item.items, item.label)" color="warning" icon="edit" />
                      <q-btn btn-scale push round glossy color="negative" icon="delete" @click="deletarMenu(index)" />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>
            <q-tab-panel name="midias">
              <span class="text-h5">Geral</span>
              <div class="row q-col-gutter-sm q-pa-md">
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Domínio" ref="state.entidadeSite.dominio" v-model="state.entidadeSite.dominio" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Google Analitics Id" ref="state.entidadeSite.pagina.analiticsId" v-model="state.entidadeSite.pagina.analiticsId" bottom-slots />
                </div>
              </div>
              <span class="text-h5">You Tube</span>
              <div class="row q-col-gutter-sm q-pa-md">
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Endereço" ref="state.entidadeSite.youtube.endereco" v-model="state.entidadeSite.youtube.endereco" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Playlist" ref="state.entidadeSite.youtube.playList" v-model="state.entidadeSite.youtube.playList" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Capa (CoverId)" ref="state.entidadeSite.youtube.playlistCoverId" v-model="state.entidadeSite.youtube.playlistCoverId" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Api Key" ref="state.entidadeSite.youtube.apiKey" v-model="state.entidadeSite.youtube.apiKey" bottom-slots />
                </div>
              </div>
              <span class="text-h5">Mídias Sociais</span>
              <div class="row q-col-gutter-sm q-pa-md">
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Instagram" ref="state.entidadeSite.instagram" v-model="state.entidadeSite.instagram" bottom-slots />
                </div>

                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Twitter" ref="state.entidadeSite.twitter" v-model="state.entidadeSite.twitter" bottom-slots />
                </div>

                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Facebook" ref="state.entidadeSite.facebook.endereco" v-model="state.entidadeSite.facebook.endereco" bottom-slots />
                </div>
                <!-- <div class="col-sm-6 col-md-4 col-12">
                                            <q-input outlined label="Fan Page" ref="state.entidadeSite.facebook.fanpage" v-model="state.entidadeSite.facebook.fanpage" bottom-slots />
                                        </div> -->
                <!-- <div class="col-sm-6 col-md-3 col-12">
                                            <q-input outlined label="Api Key" ref="state.entidadeSite.facebook.apiId" v-model="state.entidadeSite.facebook.apiId" bottom-slots />
                                        </div>
                                        <div class="col-sm-6 col-md-1 col-12">
                                            <q-input outlined label="Versão App" ref="state.entidadeSite.facebook.versao" v-model="state.entidadeSite.facebook.versao" bottom-slots />
                                        </div>
                                        <div class="col-sm-6 col-md-4 col-12">
                                            <q-input outlined label="Token" ref="state.entidadeSite.facebook.token" v-model="state.entidadeSite.facebook.token" bottom-slots />
                                        </div> -->
              </div>
              <!--
                                <input id="playList" name="playList" type="text" class="form-control" required ng-model="propriedades.youtube.playList">
                                <input id="apiKey" name="apiKey" type="text" class="form-control" required ng-model="propriedades.youtube.apiKey">
                                <input id="descricao" name="descricao" type="text" class="form-control" required ng-model="propriedades.youtube.descricao">
                        <h4>Facebook</h4>
                                <input id="fanpage" name="fanpage" type="text" class="form-control" required ng-model="propriedades.facebook.fanpage">
                                <input id="apiId" name="apiId" type="text" class="form-control" required ng-model="propriedades.facebook.apiId">
                                <input id="versao" name="versao" type="text" class="form-control" required ng-model="propriedades.facebook.versao">
                                <input id="token" name="token" type="text" class="form-control" required ng-model="propriedades.facebook.token">
                        <h4>Google Maps</h4>
                                <input id="key" name="key" type="text" class="form-control" required ng-model="propriedades.maps.key"> -->
            </q-tab-panel>
            <q-tab-panel name="layout">
              <span class="text-h5">Título</span>
              <div class="row q-col-gutter-sm q-pa-md">
                <div class="col-sm-6 col-md-3 col-12">
                  <q-input outlined label="Título" ref="state.entidadeSite.pagina.titulo" v-model="state.entidadeSite.pagina.titulo" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-3 col-12">
                  <q-input outlined label="Sub Título" ref="state.entidadeSite.pagina.subTitulo" v-model="state.entidadeSite.pagina.subTitulo" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-input :style="{ color: state.entidadeSite.pagina.destaqueCorTexto }" outlined label="Cor Texto" v-model="state.entidadeSite.pagina.destaqueCorTexto" class="my-input">
                    <template v-slot:append>
                      <q-btn icon="colorize" :style="{ color: $geralService.invertColor(state.entidadeSite.pagina.destaqueCorTexto), background: state.entidadeSite.pagina.destaqueCorTexto }">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-color v-model="state.entidadeSite.pagina.destaqueCorTexto" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-field outlined stack-label>
                    <q-checkbox v-model="state.entidadeSite.pagina.destaqueSombra" label="Sombra no Título" />
                  </q-field>
                </div>
                <div v-if="state.entidadeSite.pagina.destaqueSombra" class="col-sm-6 col-md-2 col-12">
                  <q-input :style="{ color: state.entidadeSite.pagina.destaqueCorSombra }" outlined label="Cor Sombra" v-model="state.entidadeSite.pagina.destaqueCorSombra" class="my-input">
                    <template v-slot:append>
                      <q-btn icon="colorize" :style="{ color: $geralService.invertColor(state.entidadeSite.pagina.destaqueCorSombra), background: state.entidadeSite.pagina.destaqueCorSombra }">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-color v-model="state.entidadeSite.pagina.destaqueCorSombra" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Fonte do Título" ref="state.entidadeSite.pagina.destaqueFonte" v-model="state.entidadeSite.pagina.destaqueFonte" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Tamanho da Fonte do Título" type="number" step="0.1" ref="state.entidadeSite.pagina.destaqueTamanho" v-model="state.entidadeSite.pagina.destaqueTamanho" bottom-slots />
                </div>
                <!-- <div class="col-sm-6 col-md-4 col-12">
                                        <q-input outlined label="Título Margem Superior" type="number" ref="state.entidadeSite.pagina.destaqueMarginTop" v-model="state.entidadeSite.pagina.destaqueMarginTop" bottom-slots />
                                    </div> -->
                <div class="col-sm-6 col-md-2 col-12">
                  <q-select label="Tipo Fundo" v-model="state.entidadeSite.pagina.tipoHeaderBackGround" :options="['Cor Sólida', 'Glossy', 'Gradiente', 'Banner']" outlined> </q-select>
                </div>
                <div v-if="state.entidadeSite.pagina.tipoHeaderBackGround === 'Banner'" class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Url Banner" ref="state.entidadeSite.pagina.urlBanner" v-model="state.entidadeSite.pagina.urlBanner" hint="Esta imagem deve ter o tamanho de 1920×165" />
                </div>
                <div v-if="state.entidadeSite.pagina.tipoHeaderBackGround !== 'Banner'" class="col-sm-6 col-md-2 col-12">
                  <q-input :style="{ color: state.entidadeSite.pagina.headerBackGroundCorA }" outlined label="Cor Fundo Primária" v-model="state.entidadeSite.pagina.headerBackGroundCorA" class="my-input">
                    <template v-slot:append>
                      <q-btn icon="colorize" :style="{ color: $geralService.invertColor(state.entidadeSite.pagina.headerBackGroundCorA), background: state.entidadeSite.pagina.headerBackGroundCorA }">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-color v-model="state.entidadeSite.pagina.headerBackGroundCorA" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div v-if="state.entidadeSite.pagina.tipoHeaderBackGround === 'Gradiente'" class="col-sm-6 col-md-2 col-12">
                  <q-input :style="{ color: state.entidadeSite.pagina.headerBackGroundCorB }" outlined label="Cor Fundo Secundária" v-model="state.entidadeSite.pagina.headerBackGroundCorB" class="my-input">
                    <template v-slot:append>
                      <q-btn icon="colorize" :style="{ color: $geralService.invertColor(state.entidadeSite.pagina.headerBackGroundCorB), background: state.entidadeSite.pagina.headerBackGroundCorB }">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-color v-model="state.entidadeSite.pagina.headerBackGroundCorB" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div v-if="state.entidadeSite.pagina.tipoHeaderBackGround !== 'Banner'" class="col-sm-6 col-md-2 col-12">
                  <q-field :class="{ glossy: state.entidadeSite.pagina.tipoHeaderBackGround === 'Glossy' }" outlined :label="'Exemplo de ' + state.entidadeSite.pagina.tipoHeaderBackGround" stack-label :style="{ color: 'white', background: state.entidadeSite.pagina.tipoHeaderBackGround === 'Gradiente' ? `linear-gradient(to bottom,${state.entidadeSite.pagina.headerBackGroundCorA} 0%, ${state.entidadeSite.pagina.headerBackGroundCorB} 100%)` : state.entidadeSite.pagina.headerBackGroundCorA }"> </q-field>
                </div>
              </div>
              <span class="text-h5">Página</span>

              <div class="row q-col-gutter-sm q-pa-md">
                <div class="col-sm-6 col-md-2 col-12">
                  <q-field outlined stack-label>
                    <q-checkbox v-model="state.entidadeSite.geral.mostrarNoticiasEntidadeNacional" label="Mostrar Notícias da Entidade Nacional" />
                  </q-field>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-field outlined stack-label>
                    <q-checkbox v-model="state.entidadeSite.geral.mostrarNoticiasEntidadeEstadual" label="Mostrar Notícias da Entidade Estadual" />
                  </q-field>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-input :style="{ color: state.entidadeSite.pagina.rodapeCorTexto }" outlined label="Rodapé Cor Texto" v-model="state.entidadeSite.pagina.rodapeCorTexto" class="my-input">
                    <template v-slot:append>
                      <q-btn icon="colorize" :style="{ color: $geralService.invertColor(state.entidadeSite.pagina.rodapeCorTexto), background: state.entidadeSite.pagina.rodapeCorTexto }">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-color v-model="state.entidadeSite.pagina.rodapeCorTexto" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Url Logo" ref="state.entidadeSite.pagina.urlLogo" v-model="state.entidadeSite.pagina.urlLogo" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Logo Altura" type="number" ref="state.entidadeSite.pagina.logoAltura" v-model="state.entidadeSite.pagina.logoAltura" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Logo Margin" type="number" ref="state.entidadeSite.pagina.logoMargin" v-model="state.entidadeSite.pagina.logoMargin" bottom-slots />
                </div>
              </div>

              <span class="text-h5">Menu Principal</span>

              <div class="row q-col-gutter-sm q-pa-md">
                <div class="col-sm-6 col-md-2 col-12">
                  <q-select label="Tipo Fundo" v-model="state.entidadeSite.pagina.menuTipoBackGround" :options="['Cor Sólida', 'Glossy', 'Gradiente']" outlined> </q-select>
                </div>
                <div v-if="state.entidadeSite.pagina.menuTipoBackGround === 'Gradiente'" class="col-sm-6 col-md-2 col-12">
                  <q-select   label="Direcao" v-model="state.entidadeSite.pagina.menuBackGroundDirecao" :options="['Vertical', 'Horizontal']" outlined> </q-select>
                </div>

                <div class="col-sm-6 col-md-2 col-12">
                  <q-input :style="{ color: state.entidadeSite.pagina.menuBackGroundCorA }" outlined label="Cor Fundo Primária" v-model="state.entidadeSite.pagina.menuBackGroundCorA" class="my-input">
                    <template v-slot:append>
                      <q-btn icon="colorize" :style="{ color: $geralService.invertColor(state.entidadeSite.pagina.menuBackGroundCorA), background: state.entidadeSite.pagina.menuBackGroundCorA }">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-color v-model="state.entidadeSite.pagina.menuBackGroundCorA" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div v-if="state.entidadeSite.pagina.menuTipoBackGround === 'Gradiente'" class="col-sm-6 col-md-2 col-12">
                  <q-input :style="{ color: state.entidadeSite.pagina.menuBackGroundCorB }" outlined label="Cor Fundo Secundária" v-model="state.entidadeSite.pagina.menuBackGroundCorB" class="my-input">
                    <template v-slot:append>
                      <q-btn icon="colorize" :style="{ color: $geralService.invertColor(state.entidadeSite.pagina.menuBackGroundCorB), background: state.entidadeSite.pagina.menuBackGroundCorB }">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-color v-model="state.entidadeSite.pagina.menuBackGroundCorB" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-field :class="{ glossy: state.entidadeSite.pagina.menuTipoBackGround === 'Glossy' }" outlined stack-label :style="{ color: 'white', background: state.entidadeSite.pagina.menuTipoBackGround === 'Gradiente' ? `linear-gradient(to bottom,${state.entidadeSite.pagina.menuBackGroundCorA} 0%, ${state.entidadeSite.pagina.menuBackGroundCorB} 100%)` : state.entidadeSite.pagina.menuBackGroundCorA }">
                    <span :style="{ color: state.entidadeSite.pagina.menuCorTexto, 'padding-top': '17px', 'font-weight': 'bold' }">{{ "Exemplo de " + state.entidadeSite.pagina.menuTipoBackGround }}</span>
                  </q-field>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-input :style="{ color: state.entidadeSite.pagina.menuCorTexto }" outlined label="Cor do Texto - Menu" v-model="state.entidadeSite.pagina.menuCorTexto" class="my-input">
                    <template v-slot:append>
                      <q-btn icon="colorize" :style="{ color: $geralService.invertColor(state.entidadeSite.pagina.menuCorTexto), background: state.entidadeSite.pagina.menuCorTexto }">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-color v-model="state.entidadeSite.pagina.menuCorTexto" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-field outlined stack-label>
                    <q-checkbox v-model="state.entidadeSite.pagina.menuNaDireita" label="Menu à Direita" />
                  </q-field>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-field outlined stack-label>
                    <q-checkbox v-model="state.entidadeSite.pagina.menuFixo" label="Menu Sempre Visível" />
                  </q-field>
                </div>
              </div>

              <div class="row q-col-gutter-sm q-pa-md">
                <div class="col-sm-6 col-md-4 col-12">
                  <q-field outlined stack-label>
                    <q-checkbox v-model="state.entidadeSite.pagina.menuSeparador" label="Usar Separador Antes do Menu" />
                  </q-field>
                </div>
                <div v-if="state.entidadeSite.pagina.menuSeparador" class="col-sm-6 col-md-2 col-12">
                  <q-input outlined label="Separador Espessura" ref="state.entidadeSite.pagina.menuSeparadorEspessura" v-model="state.entidadeSite.pagina.menuSeparadorEspessura" bottom-slots />
                </div>
                <div v-if="state.entidadeSite.pagina.menuSeparador" class="col-sm-6 col-md-2 col-12">
                  <q-input :style="{ color: state.entidadeSite.pagina.menuSeparadorCor }" outlined label="Separador Cor" v-model="state.entidadeSite.pagina.menuSeparadorCor" class="my-input">
                    <template v-slot:append>
                      <q-btn icon="colorize" :style="{ color: $geralService.invertColor(state.entidadeSite.pagina.menuSeparadorCor), background: state.entidadeSite.pagina.menuSeparadorCor }">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-color v-model="state.entidadeSite.pagina.menuSeparadorCor" />
                        </q-popup-proxy>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
              </div>

              <span class="text-h5">Menu Principal(Borda)</span>
              <div class="row q-col-gutter-sm q-pa-md">
                <div class="col-sm-6 col-md-2 col-12">
                  <q-select label="Cor Borda To" v-model="state.entidadeSite.pagina.bordaFrom" :options="listColorsIntensidade" outlined>
                    <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                      <q-item v-bind="itemProps" :key="opt" :class="'bg-' + opt">
                        <q-item-section>
                          <q-item-section>
                            <q-item-label>
                              {{ opt }}
                            </q-item-label>
                          </q-item-section>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <div :class="`flex h-full w-full rounded-xl p-0.5 shadow bg-gradient-to-${state.entidadeSite.pagina.bordaDirecao} from-${state.entidadeSite.pagina.bordaFrom} to-${state.entidadeSite.pagina.bordaTo}`">
                    <div class="flex items-center justify-center w-full h-full rounded-xl bg-red-500 dark:!bg-gray-900">
                      Borda do Menu
                    </div>
                  </div>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <div class="flex h-full w-full rounded-xl p-1 shadow" :style="{ color: 'white', background: state.entidadeSite.pagina.menuTipoBackGround === 'Gradiente' ? `linear-gradient(to ${state.entidadeSite.pagina.menuBackGroundDirecao==='Vertical'?'top':'left'},${state.entidadeSite.pagina.menuBackGroundCorA} 0%, ${state.entidadeSite.pagina.menuBackGroundCorB} 100%)` : state.entidadeSite.pagina.menuBackGroundCorA }">
                    <div class="flex items-center justify-center w-full h-full rounded-xl bg-red-500 dark:!bg-gray-900">
                      Borda do Menu
                    </div>
                  </div>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-select label="Cor Borda From" v-model="state.entidadeSite.pagina.bordaTo" :options="listColorsIntensidade" outlined>
                    <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                      <q-item v-bind="itemProps" :key="opt" :class="'bg-' + opt">
                        <q-item-section>
                          <q-item-section>
                            <q-item-label>
                              {{ opt }}
                            </q-item-label>
                          </q-item-section>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div class="col-sm-6 col-md-2 col-12">
                  <q-select label="Borda Direção" v-model="state.entidadeSite.pagina.bordaDirecao" :options="listDirecoes" outlined> </q-select>
                </div>
              </div>

              <span class="text-h5">Headers</span>
              <div class="row q-col-gutter-sm q-pa-md">
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Open Graphic Image" ref="state.entidadeSite.pagina.og_image" v-model="state.entidadeSite.pagina.og_image" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Open Graphic Type" ref="state.entidadeSite.pagina.og_type" v-model="state.entidadeSite.pagina.og_type" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Meta Robots" ref="state.entidadeSite.pagina.meta_robots" v-model="state.entidadeSite.pagina.meta_robots" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Meta Keywords" ref="state.entidadeSite.pagina.meta_keywords" v-model="state.entidadeSite.pagina.meta_keywords" bottom-slots />
                </div>
                <div class="col-sm-6 col-md-4 col-12">
                  <q-input outlined label="Url Favicon" ref="state.entidadeSite.pagina.urlFavIcon" v-model="state.entidadeSite.pagina.urlFavIcon" bottom-slots />
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
import { AnyMxRecord } from "dns";
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from "quasar";
import { reactive } from "vue";

const props = defineProps({
  id: { type: String, default: null },
  copia: null,
});
const geral = useGeral();
const { $geralService, $constantes } = useNuxtApp();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const state: any = reactive({
  entidadeSite: $constantes.getNewEntidadeSite(),
});
const dense = ref(false);
const $q = useQuasar();

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
  lista.splice(pos, 1);
  lista.splice(over.value.pos, 0, item);
  over.value = {};
};
const onDragOver = (item: any, pos: number, e: any) => {
  const dir = startLoc.value < e.clientY ? "down" : "up";
  setTimeout(() => {
    over.value = { item, pos, dir };
  }, 50);
};

//const listCor = ref<any>(['slate','gray',]);
const listColors = ref<any>(["slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"]);

const listCorIntensidade = ref<any>(["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]);

const listColorsIntensidade = computed(() => {
  const listt: any = [];
  listColors.value.map((cor: any) => {
    listCorIntensidade.value.map((intensidade: any) => {
      listt.push(cor + "-" + intensidade);
    });
  });
  return listt;
});

const listDirecoes = ref<any>(["br", "bl", "tr", "tl", "r", "l", "t", "b"]);

const listConteudo = ref<any>([]);
const listCaminhos = ref<any>([]);
const tab = ref("contatos");
const mensagemRequired = ref("Campo Obrigatório.");
const listaUf = $constantes.ESTADOS;

// GO valida
const validations = {
  entidadeSite: {},
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

onBeforeMount(async () => {
  // console.log(props.id);
  if (props.id) {
    const ret: any = await useCustomFetch(
      "entidadeSite/getPopulate",
      "post",
      {
        filtro: {
          _id: props.id,
        },
        populateObj: [
          {
            path: "entidade",
            select: {
              nomeRazao: 1,
              nomeFantasia: 1,
              cnpj: 1,
              sigla: 1,
              logo: 1,
            },
          },
        ],
      },
      undefined
    );
    if (ret.valido) {
      state.entidadeSite = ret.data[0];
      // console.log(ret.data);
      if (props.copia) {
        state.entidadeSite.nome = state.entidadeSite.nome + " (Cópia)";
        state.entidadeSite._id = undefined;
        state.entidadeSite.__v = undefined;
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
    state.entidadeSite.entidade = geral.entidade;
  }
  listCaminhos.value = [
    {
      menu: state.entidadeSite.menu,
      display: "Principal",
    },
  ];
  atualizaConteudo(state.entidadeSite.menu);
});

const addCaminho = (menu: any, title: String) => {
  listCaminhos.value.push({
    menu: menu,
    display: title,
  });
  atualizaConteudo(menu);
};

const setCaminho = (index: number) => {
  if (index + 1 < listCaminhos.value.length) {
    listCaminhos.value = listCaminhos.value.slice(0, index + 1);
  }
  atualizaConteudo(listCaminhos.value[index].menu);
};

const atualizaConteudo = (menu: any) => {
  listConteudo.value = menu;
};

const novoAtalho = () => {
  listConteudo.value.push({
    label: "Novo Atalho",
    tooltip: "",
    href: "",
    icon: "",
    abrirNovaAba: false,
    iconSize: "fa-1x",
  });
};

const novoSubMenu = () => {
  listConteudo.value.push({
    label: "Novo Submenu",
    tooltip: "",
    icon: "",
    iconSize: "fa-1x",
    items: [
      {
        label: "Novo Atalho",
        tooltip: "",
        href: "",
        icon: "",
        iconSize: "fa-1x",
      },
    ],
  });
};

const deletarMenu = (index: number) => {
  if (listConteudo.value[index].items === undefined) {
    listConteudo.value.splice(index, 1);
  } else {
    if (listConteudo.value[index].items.length === 0) {
      listConteudo.value.splice(index, 1);
    } else {
      $q.notify({
        position: "top",
        icon: "warning",
        color: "warning",
        message: "O submenu tem que estar vazio para a deleção!",
      });
    }
  }
};

const save = async () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Validando dados... Aguarde!",
    messageColor: "white",
  });
  // $v.value.entidadeSite.vinculos.$touch();
  $v.value.entidadeSite.$touch();

  if ($v.value.entidadeSite.$error) {
    $q.loading.hide();
    $q.notify({
      color: "warning",
      position: "top",
      icon: "check",
      message: "Preeencha todos os campos obrigatórios para salvar!",
    });
    return;
  }

  delete state.entidadeSite.__v;

  const newNoticia = JSON.parse(JSON.stringify(state.entidadeSite));

  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Salvando registro...Aguarde!",
    messageColor: "white",
  });
  let url = "entidadeSite";
  let tipo = "post";
  if (!inserir.value) {
    url += "/" + props.id;
    tipo = "put";
  }

  const ret: any = await useCustomFetch(url, tipo, newNoticia, undefined);

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
  }
};

const cancel = async () => {
  // console.log('passou aquitttt');
  onDialogCancel();
  $q.notify({
    position: "top",
    type: "info",
    textColor: "white",
    message: (inserir.value ? "Inserção " : "Edição ") + "cancelada!",
  });
  return;
};
</script>

<style lang="scss" scoped>
.az-tipo-menu {
  background-color: rgba(233, 172, 3, 0.05);
}
</style>
