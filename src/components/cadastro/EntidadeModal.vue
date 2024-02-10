<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon name="home_work" size="30px" />
          <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Entidade</q-toolbar-title>
          <!-- GO btnSave -->
          <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive" aria-label="Salvarmargin-extra - " @click="beforeSave" :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel" :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <div class="q-ma-sm">
            <q-tabs v-model="tab" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
              <q-tab default name="dados" icon="line_style" label="Informações" />
              <q-tab name="configuracoes" icon="settings" label="Configurações" />
              <q-tab name="adms" icon="supervisor_account" label="Administradores" />
              <q-tab name="logo" icon="image" label="Logo" />
            </q-tabs>
            <q-separator />
            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="dados">
                <div class="row q-col-gutter-sm">
                  <div class="col-md-5 col-12">
                    <q-input hide-bottom-space counter maxlength="100" outlined v-model="state.entidade.nomeRazao" label="Nome Razão" :dense="dense" @blur="$v.entidade.nomeRazao.$touch" :error="$v.entidade.nomeRazao.$error" error-message="Campo obrigatório" />
                  </div>
                  <div class="col-md-5 col-12">
                    <q-input counter maxlength="100" hide-bottom-space outlined v-model="state.entidade.nomeFantasia" label="Nome Fantasia" :dense="dense" @blur="$v.entidade.nomeFantasia.$touch" :error="$v.entidade.nomeFantasia.$error" error-message="Campo obrigatório" />
                  </div>
                  <div class="col-md-2 col-12">
                    <q-input counter maxlength="10" count hide-bottom-space outlined v-model="state.entidade.sigla" label="Sigla" :dense="dense" @blur="$v.entidade.sigla.$touch" :error="$v.entidade.sigla.$error" error-message="Campo obrigatório" />
                  </div>
                  <div class="col-md-5 col-12">
                    <q-input mask="##.###.###/####-##" unmasked-value hide-bottom-space outlined v-model="state.entidade.cnpj" label="CNPJ" :dense="dense" @blur="$v.entidade.cnpj.$touch" :error="$v.entidade.cnpj.$error" error-message="Campo obrigatório" />
                  </div>
                  <!-- <q-select :dark="$q.dark.isActive" :ref="'entidade.uf'" hide-bottom-space outlined v-model="state.entidade.uf" label="UF" :emit-value="true" option-value="sigla" option-label="sigla" filter :options="listaUf" :error="$v.entidade.uf.$error" error-message="Campo obrigatório" /> -->
                </div>
                <!-- GO Endereços -->
                <div class="row q-col-gutter-sm q-mt-sm">
                  <div class="col-12 col-md-12">
                    <q-list :dark="$q.dark.isActive" dense bordered class="rounded-borders">
                      <q-item-label :dense="true" header style="padding: 5px">Endereço </q-item-label>
                      <div class="row q-col-gutter-sm q-pa-md">
                        <!-- GO CEP -->
                        <div class="col-sm-6 col-md-2 col-12">
                          <q-input :dark="$q.dark.isActive" outlined label="CEP" :ref="'entidade.endereco.cep'" :error="$v.entidade.endereco.cep.$error" :error-message="$v.entidade.endereco.cep.$validator === 'minLength' ? 'O mínimo é 8 números!' : mensagemRequired" unmasked-value mask="##.###-###" v-model="state.entidade.endereco.cep" bottom-slots @blur="verificaCEP()"></q-input>
                        </div>
                        <!-- GO Logradouro -->
                        <div class="col-sm-10 col-md-8 col-12">
                          <q-input :dark="$q.dark.isActive" outlined label="Logradouro" maxlength="120" :ref="'entidade.endereco.logradouro'" v-model="state.entidade.endereco.logradouro" :error="$v.entidade.endereco.logradouro.$error" :error-message="mensagemRequired" bottom-slots :readonly="!state.entidade.endereco.desbloquearEndereco" />
                        </div>
                        <!-- GO Número -->
                        <div class="col-sm-2 col-md-2 col-12">
                          <q-input :dark="$q.dark.isActive" outlined label="Número" type="number" :step="1" :ref="'entidade.endereco.numero'" v-model="state.entidade.endereco.numero" :error="$v.entidade.endereco.numero.error" bottom-slots :error-message="mensagemRequired" />
                        </div>
                        <!-- GO Complemento -->
                        <div class="col-md-4 col-12">
                          <q-input :dark="$q.dark.isActive" outlined label="Complemento" :ref="'entidade.endereco.complemento'" v-model="state.entidade.endereco.complemento" />
                        </div>
                        <!-- GO Bairro -->
                        <div class="col-sm-5 col-md-3 col-12">
                          <q-input :dark="$q.dark.isActive" outlined label="Bairro" :ref="'entidade.endereco.bairro'" v-model="state.entidade.endereco.bairro" :error="$v.entidade.endereco.bairro.$error" bottom-slots :error-message="mensagemRequired" :readonly="!state.entidade.endereco.desbloquearEndereco" />
                        </div>
                        <!-- GO Cidade -->
                        <div class="col-sm-5 col-md-3 col-12">
                          <q-input :dark="$q.dark.isActive" outlined label="Cidade" :ref="'entidade.endereco.cidade'" v-model="state.entidade.endereco.cidade" :error="$v.entidade.endereco.cidade.$error" bottom-slots :error-message="mensagemRequired" :readonly="!state.entidade.endereco.desbloquearEndereco" />
                        </div>
                        <div class="col-sm-2 col-12">
                          <!-- GO Tipo Uf -->
                          <q-select :dark="$q.dark.isActive" outlined :ref="'entidade.endereco.uf'" v-model="state.entidade.endereco.uf" label="UF" :emit-value="true" option-value="sigla" option-label="sigla" filter :options="listaUf" :readonly="!state.entidade.endereco.desbloquearEndereco" />
                        </div>
                      </div>
                    </q-list>
                  </div>
                </div>
                <!-- GO Telefones -->
                <div class="row q-col-gutter-sm q-pt-md">
                  <div class="col-12 col-md-12">
                    <q-list bordered class="rounded-borders">
                      <q-item-label :dense="true" header style="padding: 5px"
                        >Telefones
                        <q-btn color="primary" @click="inserirTelefone" round size="xs" icon="add">
                          <q-tooltip>Inserir Telefone</q-tooltip>
                        </q-btn>
                      </q-item-label>
                      <div v-for="(telefone, index) in state.entidade.telefones" :key="index">
                        <q-separator />
                        <div class="row q-col-gutter-sm q-pa-md">
                          <div class="col-sm-3 col-md-2 col-12">
                            <!-- GO Tipo Telefone -->
                            <q-select :dark="$q.dark.isActive" outlined transition-show="flip-up" transition-hide="flip-down" emit-value option-value="descricao" option-label="descricao" :ref="'entidade.telefones' + index + '.tipo'" v-model="state.entidade.telefones[index].tipo" label="Tipo de Telefone" :options="listaTipoTelefone" />
                          </div>
                          <!-- GO DDD -->
                          <div class="col-sm-2 col-md-1 col-3">
                            <field>
                              <q-input :dark="$q.dark.isActive" outlined label="DDD" unmasked-value mask="##" :ref="'entidade.telefones' + index + '.ddd'" v-model="state.entidade.telefones[index].ddd" :error="$v.entidade.telefones.$each.$response.$errors[index].ddd && $v.entidade.telefones.$each.$response.$errors[index].ddd.length > 0" bottom-slots :error-message="$v.entidade.telefones.$each.$response.$errors[index].ddd.length > 0 ? ($v.entidade.telefones.$each.$response.$errors[index].ddd[0].$validator === 'minLength' ? 'O mínimo é 2 números!' : mensagemRequired) : ''" />
                            </field>
                          </div>
                          <!-- GO Telefone -->

                          <div class="col-sm-7 col-md-4 col-9">
                            <q-input :dark="$q.dark.isActive" outlined label="Telefone" unmasked-value :mask="(telefone.numero || '') && telefone.numero.toString().length === 8 ? '####-#####' : '#####-####'" :ref="'entidade.telefones' + index + '.numero'" v-model="state.entidade.telefones[index].numero" :error="$v.entidade.telefones.$each.$response.$errors[index].numero && $v.entidade.telefones.$each.$response.$errors[index].numero.length > 0" bottom-slots :error-message="$v.entidade.telefones.$each.$response.$errors[index].numero.length > 0 ? ($v.entidade.telefones.$each.$response.$errors[index].numero[0].$validator === 'minLength' ? 'O mínimo é 8 números!' : mensagemRequired) : ''" />
                            <!-- <pre>{{ $v.entidade.telefones.$each.$response.$errors[index].numero }}</pre> -->
                          </div>
                          <!-- GO Complemento -->

                          <div class="col-sm-12 col-md-4 col-12">
                            <q-input :dark="$q.dark.isActive" outlined label="Complemento" maxlength="100" :ref="'entidade.telefones' + index + '.complemento'" v-model="state.entidade.telefones[index].complemento" />
                          </div>
                          <div class="col-sm-12 col-md-1 col-12">
                            <div outlined class="h-14 flex items-center">
                              <q-btn round color="red" @click="excluirTelefone(index)" icon="delete">
                                <q-tooltip>Excluir o telefone</q-tooltip>
                              </q-btn>
                            </div>
                          </div>
                        </div>
                      </div>
                    </q-list>
                  </div>
                </div>
              </q-tab-panel>
              <q-tab-panel name="configuracoes">
                <q-list bordered class="rounded-borders">
                  <q-expansion-item default-opened group="validacaoGroup" label="Geral" dense-toggle expand-separator>
                    <div class="q-ma-sm row q-col-gutter-sm" style="padding-bottom: 13px !important">
                      <div class="col-12">
                        <q-field outlined>
                          <q-checkbox v-model="state.entidade.ativo" label="Entidade Ativa" />
                        </q-field>
                      </div>
                      <div class="col-md-4 col-12">
                        <q-select hide-bottom-space outlined v-model="state.entidade.tipo" :options="tipoOld" label="Tipo" :dense="dense" @blur="$v.entidade.tipo.$touch" :error="$v.entidade.tipo.$error" error-message="Campo obrigatório" />
                      </div>
                      <div class="col-md-4 col-12">
                        <q-select outlined v-model="state.entidade.abrangencia" :options="listaAbrangencia" label="Abrangência" stack-label />
                      </div>
                      <div class="col-md-4 col-12">
                        <q-select hide-bottom-space outlined v-model="state.entidade.tratamentoMasculino" emit-value map-options :options="tipoTratamento" label="Tratamento" :dense="dense" />
                      </div>
                      <div class="col-md-4 col-12">
                        <q-select class="full-width" outlined v-model="state.entidade.esportes" @filter="filterFn" label="Selecionar Esportes" use-input input-debounce="0" map-options emit-value multiple use-chips filter :options="listaEsportesFiltro" />
                      </div>
                    </div>
                  </q-expansion-item>
                  <q-expansion-item default-opened group="validacaoGroup" label="Financeiro" dense-toggle expand-separator>
                    <div class="pb-3">
                      <div class="q-ma-sm row q-col-gutter-sm">
                        <div class="col-md-4 col-12">
                          <q-select hint="Conta para integração com a plataforma de pagamentos" hide-bottom-space outlined v-model="state.entidade.financeiroContaPrincipal" :options="listaConta" map-options :emit-value="true" label="Conta Principal" option-value="_id" option-label="descricao" :dense="dense" />
                        </div>
                      </div>
                      <div v-if="state.entidade.abrangencia == 'Estadual' || state.entidade.abrangencia == 'Nacional'" class="q-ma-sm row q-col-gutter-sm">
                        <div class="col-md-6 col-12">
                          <q-item-label :dense="true" header style="padding-top: 20px; padding-bottom: 0px"
                            >Taxas Para Eventos de Rendimento
                            <q-btn color="primary" @click="state.entidade.taxasEventosRendimento ? state.entidade.taxasEventosRendimento.push({}) : (state.entidade.taxasEventosRendimento = [{}])" round size="xs" icon="add">
                              <q-tooltip>Inserir Taxas Para Eventos de Rendimento </q-tooltip>
                            </q-btn>
                          </q-item-label>
                          <div class="col-12">
                            <span v-for="(ter, index2) in state.entidade.taxasEventosRendimento" :key="index2">
                              <div class="rounded-lg pb-0.5 bg-gray-200 dark:bg-gray-700">
                                <div class="q-ma-sm row q-col-gutter-sm">
                                  <div class="col-sm-3 col-12">
                                    <q-select hide-bottom-space outlined v-model="ter.abrangencia" :options="['Nacional', 'Regional', 'Estadual', 'Municipal']" label="Abrangencia" :dense="dense" />
                                  </div>
                                  <div class="col-sm-3 col-12">
                                    <q-select hide-bottom-space outlined v-model="ter.tipo" :options="['Percentual', 'Valor']" label="Tipo" :dense="dense" />
                                  </div>
                                  <div class="col-sm-3 col-12">
                                    <q-input type="number" outlined label="Valor" v-model="ter.valor" />
                                  </div>
                                  <div class="col-sm-3 col-12">
                                    <q-btn flat color="red" @click="state.entidade.taxasEventosRendimento.splice(index2, 1)" label="Excluir" icon="delete">
                                      <q-tooltip>Excluir Configurações de Filiação</q-tooltip>
                                    </q-btn>
                                  </div>
                                </div>
                              </div>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-expansion-item>
                  <q-expansion-item group="validacaoGroup" label="Filiação de Entidades" dense-toggle expand-separator>
                    <div class="q-pa-sm row q-col-gutter-sm">
                      <div class="col-12">
                        <div class="q-ma-sm row col-12">
                          <q-item-label :dense="true" header style="padding: 5px"
                            >Configuração
                            <q-btn color="primary" @click="state.entidade.filiacoesEntidades.push({ tipoEntidadesAceitas: [], taxas: [], documentosObrigatorios: [] })" round size="xs" icon="add">
                              <q-tooltip>Inserir Configuração de Filiação</q-tooltip>
                            </q-btn>
                          </q-item-label>
                        </div>
                        <span v-for="(filiacaoEntidade, index) in state.entidade.filiacoesEntidades" :key="index">
                          <q-list class="az-configuracao q-mb-sm rounded-borders" bordered>
                            <div class="q-ma-sm row q-col-gutter-sm">
                              <div class="col-md-6 col-12">
                                <q-select hide-bottom-space outlined v-model="filiacaoEntidade.tipoEntidadesAceitas" :options="listaTipoEntidade" label="Entidades aceitas para filiação" multiple use-chips stack-label />
                              </div>
                              <div class="col-md-6 col-12">
                                <q-select hide-bottom-space outlined v-model="filiacaoEntidade.taxas" use-input input-debounce="0" :option-label="labelTaxa" emit-value map-options :options="listaTaxas" label="Taxas para a filiação de entidades" multiple use-chips stack-label />
                              </div>
                              <q-item-label :dense="true" header style="padding-top: 20px; padding-bottom: 0px"
                                >Documentos Obrigatórios
                                <q-btn color="primary" @click="filiacaoEntidade.documentosObrigatorios.push({})" round size="xs" icon="add">
                                  <q-tooltip>Inserir Configuração de Documentos Obrigatórios</q-tooltip>
                                </q-btn>
                              </q-item-label>
                              <div class="col-12">
                                <span v-for="(confDoc, index2) in filiacaoEntidade.documentosObrigatorios" :key="index2">
                                  <q-list class="az-configuracao-documento q-mb-sm rounded-borders" bordered>
                                    <div class="q-ma-sm row q-col-gutter-sm">
                                      <div class="col-sm-4 col-12">
                                        <q-input outlined label="Descrição" hint="Descrição do documento" v-model="confDoc.descricao" />
                                      </div>
                                      <div class="col-sm-6 col-12">
                                        <q-input outlined label="Instrução" hint="Instrução para o atleta sobre o documento" v-model="confDoc.instrucao" />
                                      </div>
                                      <div class="col-sm-2 col-12">
                                        <q-btn flat color="red" @click="filiacaoEntidade.documentosObrigatorios.splice(index2, 1)" label="Excluir" icon="delete">
                                          <q-tooltip>Excluir Configurações de Filiação</q-tooltip>
                                        </q-btn>
                                      </div>
                                    </div>
                                  </q-list>
                                </span>
                              </div>
                              <div class="col-12">
                                <q-btn flat color="red" @click="state.entidade.filiacoesEntidades.splice(index, 1)" label="Excluir Configuração" icon="delete">
                                  <q-tooltip>Excluir Configurações de Filiação</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </q-list>
                        </span>
                      </div>
                    </div>
                  </q-expansion-item>
                  <q-expansion-item group="validacaoGroup" label="Filiação de Atletas" dense-toggle expand-separator>
                    <div class="q-pa-sm row q-col-gutter-sm">
                      <div class="col-md-4 col-12">
                        <q-field outlined dense>
                          <template v-slot:control>
                            <div class="self-center full-width no-outline" tabindex="0">
                              <q-checkbox keep-color v-model="state.entidade.filiacaoPessoa.permite" label="Permite a Filiação de Pessoas" />
                            </div>
                          </template>
                        </q-field>
                      </div>

                      <div v-if="state.entidade.filiacaoPessoa.permite" class="col-md-4 col-12">
                        <q-field outlined dense>
                          <template v-slot:control>
                            <div class="self-center full-width no-outline" tabindex="0">
                              <q-checkbox keep-color v-model="state.entidade.filiacaoPessoa.validacaoSMS" label="Validação via SMS obrigatória" />
                            </div>
                          </template>
                        </q-field>
                      </div>
                      <div v-if="state.entidade.filiacaoPessoa.permite" class="col-md-4 col-12">
                        <q-field outlined dense>
                          <template v-slot:control>
                            <div class="self-center full-width no-outline" tabindex="0">
                              <q-checkbox keep-color v-model="state.entidade.filiacaoPessoa.validacaoEmail" label="Validação via E-MAIL obrigatória" />
                            </div>
                          </template>
                        </q-field>
                      </div>
                      <q-item-label v-if="state.entidade.filiacaoPessoa.permite" :dense="true" header style="padding-top: 20px; padding-bottom: 0px"
                        >Documentos Obrigatórios
                        <q-btn color="primary" @click="state.entidade.filiacaoPessoa.documentosObrigatorios.push({})" round size="xs" icon="add">
                          <q-tooltip>Inserir Configuração de Documentos Obrigatórios</q-tooltip>
                        </q-btn>
                      </q-item-label>
                      <div v-if="state.entidade.filiacaoPessoa.permite" class="col-12">
                        <span v-for="(confDoc, index2) in state.entidade.filiacaoPessoa.documentosObrigatorios" :key="index2">
                          <q-list class="az-configuracao-documento q-mb-sm rounded-borders" bordered>
                            <div class="q-ma-sm row q-col-gutter-sm">
                              <div class="col-sm-4 col-12">
                                <q-input outlined label="Descrição" hint="Descrição do documento" v-model="confDoc.descricao" />
                              </div>
                              <div class="col-sm-6 col-12">
                                <q-input outlined label="Instrução" hint="Instrução para o atleta sobre o documento" v-model="confDoc.instrucao" />
                              </div>
                              <div class="col-sm-2 col-12">
                                <q-btn flat color="red" @click="state.entidade.filiacaoPessoa.documentosObrigatorios.splice(index2, 1)" label="Excluir" icon="delete">
                                  <q-tooltip>Excluir Documento</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </q-list>
                        </span>
                      </div>
                    </div>
                    <div v-if="state.entidade.filiacaoPessoa.permite" class="q-pa-sm row q-col-gutter-sm">
                      <div class="col-md-6 col-12">
                        <q-field outlined label="Filiações em entidades obrigatórias" stack-label>
                          <template v-slot:control>
                            <div class="self-center full-width no-outline" tabindex="0">
                              <q-chip v-for="(entObri, index) in state.entidade.filiacaoPessoa.filiacoesObrigatorias" :key="index" removable @remove="excluirFiliacoesObrigatoria(index)" color="red" text-color="white">
                                <q-avatar>
                                  <img :src="getUrlImagemThumb(entObri.logo, 64)" />
                                </q-avatar>
                                <div class="ellipsis">
                                  {{ entObri.sigla }}
                                  <q-tooltip>{{ entObri.nomeRazao }}</q-tooltip>
                                </div>
                              </q-chip>
                            </div>
                          </template>
                          <template v-slot:append>
                            <q-btn @click="localizarEntidade" round flat icon="add" />
                          </template>
                        </q-field>
                      </div>
                      <div class="col-md-6 col-12">
                        <q-select hide-bottom-space outlined v-model="state.entidade.filiacaoPessoa.taxaFiliacao" use-input input-debounce="0" :option-label="labelTaxa" emit-value map-options :options="listaTaxas" label="Taxa para a filiação de atletas" use-chips stack-label />
                      </div>
                      <div class="col-md-6 col-12">
                        <q-select hide-bottom-space outlined v-model="state.entidade.filiacaoPessoa.taxaFiliacaoTemporaria" use-input input-debounce="0" :option-label="labelTaxa" emit-value map-options :options="listaTaxas" label="Taxa para a filiação temporária de atletas" use-chips stack-label />
                      </div>
                      <div class="col-md-6 col-12">
                        <q-select hide-bottom-space outlined v-model="state.entidade.filiacaoPessoa.taxaFiliacaoConversao" use-input input-debounce="0" :option-label="labelTaxa" emit-value map-options :options="listaTaxas" label="Taxa para a conversão de filiação temporária para definitiva" use-chips stack-label />
                      </div>
                    </div>
                  </q-expansion-item>
                </q-list>
              </q-tab-panel>
              <q-tab-panel name="adms">
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <div class="layout-padding">
                      <div class="row q-ma-md">
                        <q-btn color="primary" @click="inserirVinculos" icon="add" label="Inserir Administrador">
                          <q-tooltip>Inserir Administrador</q-tooltip>
                        </q-btn>
                      </div>
                      <q-list v-if="state.vinculos.length > 0">
                        <div v-for="(vinculo, index) in state.vinculos" :key="index">
                          <q-expansion-item v-if="!vinculo.suporte || geral.pessoa._id == '5aff4d2f47667633c7ace227'" group="vinculosGroup" popup v-model="state.vinculos[index].open" :key="index">
                            <template v-slot:header>
                              <q-item-section avatar v-if="vinculo.pessoa && vinculo.pessoa.foto">
                                <q-avatar size="50px">
                                  <q-img :src="getUrlImagemThumb(vinculo.pessoa.foto, 128)"></q-img>
                                </q-avatar>
                              </q-item-section>
                              <q-item-section>
                                <q-item dense>
                                  <q-item-section>
                                    {{ vinculo.pessoa ? vinculo.pessoa.nome : "" }}
                                    <q-item-label caption>{{ vinculo.tipoLigacao ? vinculo.tipoLigacao : "" }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </q-item-section>
                              <q-item-section avatar>
                                <q-checkbox v-model="vinculo.ativo" label="Ativo" />
                              </q-item-section>
                            </template>

                            <div class="row q-col-gutter-sm q-pa-md">
                              <div class="col-12">
                                <q-field :readonly="!vinculo.ativo" outlined label="Pessoa" :ref="'vinculos' + index + '.pessoa'" stack-label :dense="false" :error="!vinculo.pessoa" error-message="Campo obrigatório">
                                  <!-- <template v-if="vinculo.pessoa && vinculo.pessoa.foto" v-slot:prepend>
                                                                    <q-avatar size="50px">
                                                                        <q-img :src="getUrlImagemThumb(vinculo.pessoa.foto, 128)"></q-img>
                                                                    </q-avatar>
                                                                </template> -->
                                  <template v-slot:control>
                                    <div class="self-center full-width no-outline" tabindex="0">
                                      <span v-if="vinculo.pessoa">{{ `${vinculo.pessoa.nome}${vinculo.pessoa.nome !== vinculo.pessoa.apelido ? ` (${vinculo.pessoa.apelido})` : ""}` }}</span>
                                    </div>
                                  </template>
                                  <template v-slot:append>
                                    <q-btn
                                      color="primary"
                                      @click="
                                        () => {
                                          localizarPessoa();
                                          indexVinculo = index;
                                        }
                                      "
                                      icon="search"
                                      round
                                    >
                                      <q-tooltip>Localizar Pessoa</q-tooltip>
                                    </q-btn>
                                  </template>
                                </q-field>
                              </div>
                              <div class="col-12">
                                <q-select hide-bottom-space outlined :readonly="!vinculo.ativo" v-if="state.vinculos[index].entidade !== undefined" :ref="'vinculos' + index + '.acessos'" v-model="state.vinculos[index].acessosSistema" label="Perfis de Acessos ao Sistema" multiple use-chips :emit-value="true" map-options option-value="_id" option-label="descricao" :options="listaAcessosSistema" />
                              </div>
                              <div class="col-12">
                                <q-select hide-bottom-space outlined :readonly="!vinculo.ativo" :ref="'vinculos' + index + '.funcoesExtras'" multiple use-chips :emit-value="true" map-options option-value="value" option-label="label" v-model="state.vinculos[index].funcoesExtras" label="Funções Extras" :options="listaFuncoes" />
                              </div>
                              <div class="col-12">
                                <q-select hide-bottom-space outlined :readonly="!vinculo.ativo" :ref="'vinculos' + index + '.funcoesRestritivas'" multiple use-chips :emit-value="true" map-options option-value="value" option-label="label" v-model="state.vinculos[index].funcoesRestritivas" label="Funções Restritivas" :options="listaFuncoes" />
                              </div>
                              <div class="col-12">
                                <q-select hide-bottom-space outlined :readonly="!vinculo.ativo" v-if="state.vinculos[index].entidade !== undefined" :ref="'vinculos' + index + '.tipoLigacao'" v-model="vinculo.tipoLigacao" label="Tipo de Vínculo" emit-value map-options :options="['Equipe Técnica', 'Administração', 'Diretoria']" />
                              </div>
                              <!-- GO cargo -->
                              <div class="col-md-4 col-12">
                                <q-input hide-bottom-space outlined :readonly="!vinculo.ativo" label="Cargo (Opcional)" maxlength="120" :ref="'vinculos' + index + '.cargo'" v-model="state.vinculos[index].cargo" />
                              </div>

                              <!-- GO Data Início -->
                              <div class="col-sm-6 col-md-4 col-12">
                                <CinputDate outlined :dense="false" :readonly="!vinculo.ativo" :ref="'vinculos' + index + '.dataInicio'" v-model="state.vinculos[index].dataInicio" label="Data Inicial" :error="!state.vinculos[index].dataInicio || state.vinculos[index].dataInicio.length == 0" :error-message="mensagemRequired" />
                              </div>
                              <!-- GO Data Fim -->
                              <div class="col-sm-6 col-md-4 col-12">
                                <CinputDate outlined :dense="false" :readonly="!vinculo.ativo" :ref="'vinculos' + index + '.dataFim'" v-model="state.vinculos[index].dataFim" label="Data Final" />
                              </div>
                              <div class="col-12">
                                <q-btn flat color="red" @click="excluirVinculo(index)" label="Excluir Administrador" icon="delete">
                                  <q-tooltip>Excluir o administrador</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </q-expansion-item>
                        </div>
                      </q-list>
                    </div>
                  </div>
                </div>
              </q-tab-panel>
              <q-tab-panel keep-alive name="logo">
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
                            <q-btn class="q-mt-sm" v-if="(imageData != '' && imageData != null) || (imageData != null && imageData != '' && state.entidade.logo !== undefined && state.entidade.logo !== '')" @click="imageData = null" outline color="secondary" label="Ficar Sem" />
                            <q-btn class="q-mt-sm" v-if="imageData !== '' && state.entidade.logo !== undefined && state.entidade.logo !== ''" @click="imageData = ''" outline color="deep-purple" label="Restaurar" />
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minLength } from "@vuelidate/validators";
import BuscarPessoa from "../BuscarPessoa.vue";
import BuscarEntidade from "../BuscarEntidade.vue";
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
const state: any = reactive({ entidade: { endereco: {} }, vinculos: [] });
const dense = ref(false);
const $q = useQuasar();
const geral = useGeral();
const listaConta = ref<any>([]);

const imageData = ref<any>("");
const imageUrl = ref("");
const tab = ref("dados");
const mensagemRequired = ref("Campo Obrigatório.");
const indexVinculo = ref(-1);

const listaFuncoes = $geralService.getLista($constantes.FUNCOES_SISTEMA, "id", "descricao");
const listaValidacaoTipo = ["Endereço", "Ata/Contrato Social", "Email", "Celular", "CNPJ"];
const validacoes = ref<any>([]);
const listaTaxas = ref([]);
const listaTipoDocumentoPF = ref<any>([]);
const listaTipoDocumentoPJ = ref<any>([]);
const listaTipoEntidade = ["Confederação", "Federação", "Clube", "Liga", "Associação", "Assessoria", "ONG", "Academia", "Universidade", "Faculdade", "Escola", "Colégio", "Outro"];
const listaAbrangencia = ["Local", "Estadual", "Nacional", "Regional", "Internacional"];
const listaAcessosSistema = ref<any>([]);
const vinculosDeletados = ref<any>([]);
const listaEsportes = ref<any>([]);
const listaEsportesFiltro = ref<any>([]);
const listaUf = $constantes.ESTADOS;
const listaTipoEndereco = $constantes.TIPO_ENDERECO;
const listaTipoTelefone = $constantes.TIPO_TELEFONE;
const tipoOld = ["Confederação", "Federação", "Clube", "Associação", "Assessoria", "ONG", "Outro"];
const tipoTratamento = [
  {
    label: "Masculino (o, do, ao)",
    value: true,
  },
  {
    label: "Feminino (A, da, à)",
    value: false,
  },
];

// GO valida
const validations = {
  entidade: {
    nomeRazao: {
      required,
    },
    cnpj: {
      required,
    },
    nomeFantasia: {
      required,
    },
    sigla: {
      required,
    },
    tipo: {
      required,
    },
    telefones: {
      $each: helpers.forEach({
        ddd: {
          required,
          minLength: minLength(2),
        },
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
  await iniciaListaEsporte();
  await getListaAcessos();
  if (props.id) {
    const ret: any = await useCustomFetch(
      "entidade/getPopulate",
      "post",
      {
        filtro: {
          _id: props.id,
        },
        populateObj: [
          {
            path: "filiacaoPessoa.filiacoesObrigatorias",
            select: {
              nomeRazao: 1,
              sigla: 1,
              logo: 1,
            },
          },
        ],
      },
      undefined
    );
    if (ret.valido) {
      await iniciaListaTaxas();
      await iniciaListaConta();
      state.entidade = ret.data[0];
      // console.log(ret.data);
      if (!state.entidade.configuracoes) {
        state.entidade.configuracoes = getNewConfiguracoes();
      }
      if (!state.entidade.filiacoesEntidades) {
        state.entidade.filiacoesEntidades = [];
      }

      if (!state.entidade.filiacaoPessoa) {
        state.entidade.filiacaoPessoa = {
          permite: false,
          taxas: [],
          filiacoesObrigatorias: [],
          documentosObrigatorios: [],
        };
      }
      if (!state.entidade.filiacaoPessoa.documentosObrigatorios) {
        state.entidade.filiacaoPessoa.documentosObrigatorios = [];
      }
      if (!state.entidade.abrangencia) {
        state.entidade.abrangencia = "Local";
      }
      state.entidade = JSON.parse(JSON.stringify(state.entidade));
      getVinculos();

      if (props.copia) {
        state.entidade.descricao = state.entidade.descricao + " (Cópia)";
        state.entidade._id = undefined;
        state.entidade.__v = undefined;
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
    state.entidade = await getNewEntidade();
    inserir.value = true;
  }
  // console.log($v.value);
  // console.log(state.entidade);
});

const iniciaListaConta = async () => {
  const ret1: any = await useCustomFetch(
    "financeiroConta/getPopulate",
    "post",
    {
      filtro: {
        lixo: false,
        entidade: props.id,
        tipo: { $in: ["Conta Corrente", "Conta Poupança"] },
      },
      select: {
        descricao: 1,
      },
      populateObj: [],
    },
    undefined
  );

  if (ret1.valido) {
    listaConta.value = ret1.data;
  } else {
    listaConta.value = [];
  }
};

const labelTaxa = (obj: any) => {
  return obj.label + " (" + $geralService.numeroParaMoeda(obj.obj.valorPadrao) + ")";
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

const getListaAcessos = async () => {
  const ret1: any = await useCustomFetch(
    "acessoSistema/getPopulate",
    "post",
    {
      filtro: {
        entidade: props.id,
        lixo: false,
      },
      populateObj: [],
    },
    undefined
  );

  if (ret1.valido) {
    listaAcessosSistema.value = ret1.data;
  }
  // console.log(ret1);
};

const confirmSelecaoAdm = (pessoa: any) => {
  if (pessoa) {
    state.vinculos[indexVinculo.value].pessoa = pessoa;
  }
};
const localizarPessoa = () => {
  $q.dialog({
    component: BuscarPessoa,
    persistent: true,
    componentProps: {},
  })
    .onOk(async (data) => {
      confirmSelecaoAdm(data);
    })
    .onCancel(() => {});
};
const localizarEntidade = () => {
  $q.dialog({
    component: BuscarEntidade,
    persistent: true,
    componentProps: {},
  })
    .onOk(async (data) => {
      confirmSelecaoEntidade(data);
    })
    .onCancel(() => {});
};

const inserirVinculos = () => {
  // if (listaAcessosSistema.value.length > 0) {
  state.vinculos.forEach((element: any) => {
    element.open = false;
  });
  state.vinculos.push({
    pessoa: undefined,
    acessosSistema: [],
    funcoesExtras: [],
    funcoesRestritivas: [],
    dataInicio: "",
    open: true,
    ativo: true,
    tipoLigacao: "Administração",
    entidade: props.id,
  });

  // } else {
  //     $q.notify({
  //         position: 'top',
  //         icon: 'warning',
  //         color: 'warning',
  //         message: "Cadastre antes os 'Acessos de Sistemas' para inserir administradores!"
  //     });
  // }
};
const excluirVinculo = (index: number) => {
  $q.dialog({
    title: "Confirmação",
    message: "Excluir o vínculo?",
    cancel: "Não",
    ok: "Sim",
  }).onOk(() => {
    if (state.vinculos[index]._id) {
      state.vinculosDeletados.push(state.vinculos[index]._id);
    }
    state.vinculos.splice(index, 1);
  });
};
const getUrlImagemThumb = (caminho: any, tamanho: any) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: tamanho !== undefined ? tamanho : 128,
  });
};

const getUrlImagem = computed(() => {
  return $geralService.getUrlImagem(imageData.value, state.entidade, "logo", imageUrl.value);
});

const confirmSelecaoEntidade = (entidade: any) => {
  state.entidade.filiacaoPessoa.filiacoesObrigatorias.push(entidade);
};
const excluirFiliacoesObrigatoria = (index: number) => {
  state.entidade.filiacaoPessoa.filiacoesObrigatorias.splice(index, 1);
};
const inserirValidacao = () => {
  validacoes.value.forEach((element: any) => {
    element.open = false;
  });
  validacoes.value.push({
    open: true,
  });
};
const excluirValidacao = (index: number) => {
  validacoes.value.splice(index, 1);
};

const iniciaListaEsporte = async () => {
  const ret1: any = await useCustomFetch(
    "esporte/getPopulate",
    "post",
    {
      filtro: {
        lixo: false,
      },
      populateObj: [],
    },
    undefined
  );

  if (ret1.valido) {
    listaEsportes.value = ret1.data.map((esporte: any) => {
      return {
        label: esporte.descricao,
        value: esporte._id,
        obj: esporte,
      };
    });
    listaEsportesFiltro.value = listaEsportes.value;
  } else {
    listaEsportes.value = [];
    listaEsportesFiltro.value = [];
  }
};
const iniciaListaTaxas = async () => {
  const ret1: any = await useCustomFetch(
    "taxa/getPopulate",
    "post",
    {
      filtro: {
        lixo: false,
        entidade: props.id,
      },
      populateObj: [],
    },
    undefined
  );

  if (ret1.valido) {
    listaTaxas.value = ret1.data.map((taxa: any) => {
      return {
        label: taxa.descricao,
        value: taxa._id,
        obj: taxa,
      };
    });
    // console.log(listaTaxas.value);
  } else {
    listaTaxas.value = [];
  }
};
// GO setPrincipal
const setPrincipal = (indice: number, lista: any) => {
  for (let index = 0; index < lista.length; index++) {
    if (indice !== index) {
      lista[index].principal = false;
    }
  }
};
const addAtribuicao = (membro: any) => {
  $q.dialog({
    title: "Adicionar Atribuição",
    message: "Digite textos curtos",
    prompt: {
      model: "",
      type: "text", // optional
    },
    cancel: true,
  }).onOk((data) => {
    if (data) {
      membro.atribuicoes.push(data);
    }
  });
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
// GO inserirEndereco
const inserirEndereco = async () => {
  const principal = state.entidade.enderecos.length === 0;
  state.entidade.enderecos.push(await $geralService.getEnderecoPadrao(listaTipoEndereco[0].descricao, principal));
};
const excluirEndereco = (indice: number) => {
  $q.dialog({
    title: "Confirmação",
    message: "Excluir o endereço?",
    cancel: "Não",
    ok: "Sim",
  }).onOk(() => {
    const excluirPrincipal = state.entidade.enderecos[indice].principal;
    state.entidade.enderecos.splice(indice, 1);
    if (excluirPrincipal && state.entidade.enderecos.length > 0) {
      // Garante que o campo 'state.entidade.endereco' não fique desatualizado.
      state.entidade.enderecos[0].principal = true;
    }
  });
};
// GO inserirTelefone
const inserirTelefone = () => {
  const principal = state.entidade.telefones.length === 0;
  state.entidade.telefones.push($geralService.getTelefonePadrao(listaTipoTelefone[2].descricao, principal));
};
const excluirTelefone = (indice: number) => {
  $q.dialog({
    title: "Confirmação",
    message: "Excluir o telefone?",
    cancel: "Não",
    ok: "Sim",
  }).onOk(() => {
    const excluirPrincipal = state.entidade.telefones[indice].principal;
    state.entidade.telefones.splice(indice, 1);
    if (excluirPrincipal && state.entidade.telefones.length > 0) {
      // Garante que o campo 'state.entidade.telefone' não fique desatualizado.
      state.entidade.telefones[0].principal = true;
    }
  });
};
const verificaCEP = async () => {
  const end = await $geralService.buscarCep(state.entidade.endereco.cep);
  if (end) {
    // Object.assign(state.entidade.enderecos[index], end);
    state.entidade.endereco.logradouro = end.logradouro;
    state.entidade.endereco.bairro = end.bairro;
    state.entidade.endereco.cidade = end.localidade;
    state.entidade.endereco.uf = end.uf;
    state.entidade.endereco.desbloquearEndereco = false;
  } else {
    state.entidade.endereco.desbloquearEndereco = true;
  }
};

//gravar no banco

const beforeSave = () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Validando dados... Aguarde!",
    messageColor: "white",
  });
  // $v.value.vinculos.$touch();
  $v.value.entidade.$touch();

  if ($v.value.entidade.$error) {
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

  delete state.entidade.__v;

  // Cria newEntidade para não bagunçar as máscaras em caso de alguma falha de comunicação
  const newEntidade = JSON.parse(JSON.stringify(state.entidade));

  if (imageData.value !== "") {
    $q.loading.show({
      spinner: QSpinnerOval,
      spinnerColor: "white",
      spinnerSize: 60,
      message: "Fazendo upload de imagem...Aguarde!",
      messageColor: "white",
    });
  }

  $geralService.executaUpload(newEntidade, "logo", imageData.value, inserir.value, "jpg", "entidades/imagens/logos/", save, undefined);
};
// TO save
const save = async (newEntidade: any, nomeTempFile: any) => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Salvando registro...Aguarde!",
    messageColor: "white",
  });
  let url = "entidade";
  let tipo = "post";
  if (!inserir.value) {
    url += "/" + props.id;
    tipo = "put";
  }

  const ret: any = await useCustomFetch(url, tipo, newEntidade, undefined);

  if (ret.valido) {
    await saveVinculos();
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
      $q.loading.hide();
    }
  }
};
const saveVinculos = async () => {
  for (let index = 0; index < state.vinculos.length; index++) {
    const vinculo = state.vinculos[index];
    const tipo = vinculo._id === undefined ? "post" : "put";
    const url = "vinculo" + (vinculo._id === undefined ? "" : "/" + vinculo._id);
    await useCustomFetch(url, tipo, vinculo, undefined);
  }
  for (let index = 0; index < vinculosDeletados.value.length; index++) {
    const vinculoId = vinculosDeletados.value[index];
    const url = "vinculo/" + vinculoId;
    await useCustomFetch(url, "delete", {}, undefined);
  }
};

const filterFn = (val: any, update: any) => {
  update(() => {
    if (val === "") {
      listaEsportesFiltro.value = listaEsportes.value;
    } else {
      const needle = val.toLowerCase();
      listaEsportesFiltro.value = listaEsportes.value.filter((esporte: any) => esporte.label.toLowerCase().indexOf(needle) > -1);
    }
  });
};
const getNewEntidade = async () => {
  const ret = await useCustomFetch("id", "get", undefined, undefined);
  // console.log(ret);
  if (ret.valido) {
    return {
      ativo: true,
      endereco: { logradouro: "", tipo: "Comercial", principal: true, numero: "", cep: "", bairro: "", cidade: "", uf: "", pais: "Brasil", complemento: "", desbloquearEndereco: true },
      telefones: [{ ddd: "", numero: "", tipo: "Celular", principal: true }],
      abrangencia: "Local",
      taxasEventosRendimento: [],
      filiacaoPessoa: {
        // Na hora da filiação o sistema vai exigir que o atleta complete alguns campos
        permite: false,
        taxas: [],
        documentosObrigatorios: [],
        tipoDeAprovacao: "Decrescente",
        crnmObrigatorio: false,
        cpfObrigatorio: false,
        rgObrigatorio: false,
        enderecoObrigatorio: false,
        validacaoEmail: false,
        validacaoCelular: false,
        validacaoEndereco: false,
        validacaoFacebook: false,
        filiacoesObrigatorias: [],
      },
      filiacoesEntidades: [],
      configuracoes: getNewConfiguracoes(),
    };
  } else {
    return null;
  }
};
const getVinculos = async () => {
  const ret1 = await useCustomFetch(
    "vinculo/getPopulate",
    "post",
    {
      filtro: {
        lixo: false,
        entidade: props.id,
      },
      populateObj: [
        {
          path: "pessoa",
          select: {
            nome: 1,
            apelido: 1,
            foto: 1,
          },
        },
      ],
    },
    undefined
  );

  if (ret1.valido) {
    state.vinculos = ret1.data;
  }
};

const getNewConfiguracoes = () => {
  return {
    geral: {},
    pagina: {},
    conta: {},
    caminho: {
      base: "",
    },
    youtube: {},
    facebook: {},
    maps: {
      key: "AIzaSyBHESCdv12BO0wu3nvGwDweTYP09b67E2s",
    },
    endereco: {},
    menu: {
      background: "#322f62",
      color: "#ffffff",
      align: "rigth",
      title: "Principal",
      menus: [],
    },
    domain: "",
  };
};
</script>
