<template>
    <div>
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-l from-cyan-500 to-blue-700" name="trending_up"
                            size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Percurso</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="save" :label="$q.screen.gt.xs ? 'Salvar' : undefined"
                        icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    
                <div class="row q-ma-sm q-col-gutter-sm">
                  <div class="col-md-6 col-sm-6 col-12">
                    <q-input
                      counter
                      maxlength="100"
                      ref="busca"
                      hide-bottom-space
                      outlined
                      v-model="percurso.descricao"
                      :label="$v.descricao.$error ? 'Descrição (Campo Obrigatório)' : 'Descrição'"
                      @blur="$v.descricao.$touch"
                      :error="$v.descricao.$error"
                    />
                  </div>
                  <div class="col-md-6 col-sm-6 col-12">
                    <q-input
                      counter
                      maxlength="100"
                      hint="Ex. 30% mata nativa 20% floresta de reflorestamento"
                      ref="busca"
                      hide-bottom-space
                      outlined
                      v-model="percurso.detalhes"
                      :label="$v.detalhes.$error ? 'Detalhes(Campo Obrigatório)' : 'Detalhes'"
                      @blur="$v.detalhes.$touch"
                      :error="$v.detalhes.$error"
                    />
                  </div>
                  <div class="col-sm-4 col-md-3  col-12">
                    <q-select
                      hide-bottom-space
                      outlined
                      v-model="percurso.modalidadeEsportiva"
                      @update:model-value="changeModalidadeEsportiva"
                      label="Modalidade Esportiva"
                      :dense="dense"
                      option-label="descricao"
                      :emit-value="true"
                      map-options
                      option-value="_id"
                      :options="listaModalidadeEsportiva"
                      @blur="$v.modalidadeEsportiva.$touch"
                      :error="$v.modalidadeEsportiva.$error"
                      error-message="Campo obrigatório"
                    ></q-select>
                  </div>
                  <div class="col-sm-4 col-md-3  col-12">
                    <q-select
                      hide-bottom-space
                      outlined
                      v-model="percurso.modeloCategoria"
                      label="Modelo de Categoria"
                      :dense="dense"
                      option-label="descricao"
                      :emit-value="true"
                      map-options
                      option-value="_id"
                      :options="listaModeloCategoria"
                      @blur="$v.modeloCategoria.$touch"
                      :error="$v.modeloCategoria.$error"
                      error-message="Campo obrigatório"
                    ></q-select>
                  </div>
                  <div class="col-sm-4 col-md-3 col-12">
                    <CinputDate outlined label="Início" tipo="datetime" v-model="percurso.inicio" hide-bottom-space
                     @blur="$v.inicio.$touch"
                          :error="$v.inicio.$error"></CinputDate>
                  </div>
                  <div class="col-md-4 col-sm-6 col-12">
                    <q-select
                      hide-bottom-space
                      outlined
                      v-model="percurso.tipo"
                      :options="tipoOld"
                      label="Tipo"
                      :dense="dense"
                    />
                  </div>
                </div>
                <div>
                    
                  <div class="row q-mx-sm q-col-gutter-sm">
                    <div v-if="percurso.modeloCategoria" class="col-12 ">
                      <q-list bordered class="rounded-lg pb-2">
                        <div class="flex justify-between">
                        <q-item-label class="p-0 m-2 text-lg" :dense="true">
                          Grupos de Categorias
                        </q-item-label>
                         <q-btn class="mt-2 mr-2" push glossy color="indigo" @click="inserirGrupo" icon="add"  label="Inserir Grupo">
                                <q-tooltip>Inserir Novo Grupo</q-tooltip>
                              </q-btn>
                              </div>
                        <PercursoGrupo  v-for="(grupo, idx) in percurso.grupos" :key="idx" :index="idx" :modeloCategoria="modeloCategoria" @onExcluir="excluirGrupo" v-model="percurso.grupos[idx]"></PercursoGrupo>
                      </q-list>
                    </div>
                  </div>
                </div>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar } from 'quasar';

const props = defineProps({
    id: { type: String, default: null },
    evento: { type: String, default: null },
    copia: null,
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data

const geral = useGeral();
const percurso: any = ref({ 
    evento: props.evento,
    modeloCategoria: null,
    inicio: '',
    entidade: geral.entidade._id,
    tipo: 'Tradicional',
    grupos: [],
    grupo: 0,
    imagem: '',
    quantidadeDisponivel: 10000,
    quantidadeMaximaPorPessoa: 1
 });
const dense = ref(false);
const $q = useQuasar();

const listaModeloCategoria = <any>ref([]);
const listaModalidadeEsportiva = <any>ref([]);

const tipoOld = [
    'Tradicional',
    'Médio',
    'Longo',
    'Sprint',
    'Precisão',
    'Modelo',
    'Mountain Bike',
    'Treino',
    'Revezamento',
    'Revezamento'
];
                
const mensagemRequired = 'Campo Obrigatório.';


// GO valida
const validations = {
   
    descricao: {
        required
    },
    inicio: {
        required
    },
    detalhes: {
        required
    },
    modeloCategoria: {
        required
    },
    modalidadeEsportiva: {
        required
    },
    grupos: {
        $each: helpers.forEach({
            descricao: {
                required
            },
            categorias: {
                $each: helpers.forEach({
                    categoria: {
                        required
                    },
                    tempoZerador: {
                        required
                    }
                })
            }
        })
    }
};

const $v = useVuelidate(validations, percurso);

const inserir = ref(true);

onBeforeMount(async () => {
    await getListaModalidadeEsportiva();
    if (props.id) {
        const ret: any = await useCustomFetch("percurso/" + props.id, "get", undefined, undefined);
        if (ret.valido) {
            console.log(ret.data);
            percurso.value = ret.data;
            if (props.copia) {
                percurso.value.descricao = percurso.value.descricao + " (Cópia)";
                percurso.value._id = undefined;
                percurso.value.__v = undefined;
                inserir.value = true;
            } else {
                inserir.value = false;
            }
            getListaModeloCategoria();
        } else {
            console.log('passou aquidsdsdsds');
            setTimeout(async () => {
                await cancel();
                // navigateTo('/login');
            }, 1);
        }
    } else {
        inserir.value = true;
    }
});

const changeModalidadeEsportiva = (value: any) => {
    percurso.value.modeloCategoria = null;

    console.log('changeModalidadeEsportiva', value);

    percurso.value.modeloCategoria = null;
    getListaModeloCategoria();
    console.log('listModalidadeEsportiva', listaModalidadeEsportiva.value);
    percurso.value.esporte = listaModalidadeEsportiva.value.find((modalidade: any) => modalidade._id == value).esporte;
    console.log('percurso.esporte', percurso.value.esporte);
};

// GO inserirGrupo
const inserirGrupo = () => {
    for (let index = 0; index < percurso.value.grupos.length; index++) {
        percurso.value.grupos[index].expanded = false;
    }
    percurso.value.grupos.push({
        descricao: '',
        distancia: 0, // metros
        altimetria: 0, // metros
        quantidadePontos: 0,
        categorias: [],
        pontos: [],
        partidas: [],
        expanded: true
    });
};

const excluirGrupo = (index: number) => {
    percurso.value.grupos.splice(index, 1);

};

const modeloCategoria = computed(() => {
    if (percurso.value.modeloCategoria) {
        for (let index = 0; index < listaModeloCategoria.value.length; index++) {
            if(listaModeloCategoria.value[index]._id === percurso.value.modeloCategoria){
                return listaModeloCategoria.value[index];
            }
        }
    }
    console.log('tá retornando null');
    return null;
});

const getListaModeloCategoria = async () => {
    try {
        const ret = await useCustomFetch(
            'modeloCategoria/getPopulate',
            'post',
            {
                filtro: {
                    modalidadesEsportivas: {$in: [percurso.value.modalidadeEsportiva]},
                    lixo: false
                }
            },
            null
        );
        if (ret.valido) {
            listaModeloCategoria.value = ret.data;
        } else {
            listaModeloCategoria.value = [];
        }
    } catch (error) { }
};
const getListaModalidadeEsportiva = async () => {
    try {
        console.log(geral.entidade.esportes);
        const ret = await useCustomFetch(
            'modalidadeEsportiva/getPopulate',
            'post',
            {
                filtro: {
                    lixo: false,
                    esporte: {$in: geral.entidade.esportes.map((esporte: any) => esporte._id)}
                }
            },
            null
        );
        console.log({
                    lixo: false,
                    esporte: {$in: [geral.entidade.esportes.map((esporte: any) => esporte._id)]}
                })
        if (ret.valido) {
            listaModalidadeEsportiva.value = ret.data;
            console.log('listaModalidadeEsportiva.value', listaModalidadeEsportiva.value);
        } else {
            listaModalidadeEsportiva.value = [];
            console.log(ret);
        }
    } catch (error) { }
};

const cancel = async () => {
    console.log('passou aquitttt');
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
const save = async () => {
    $v.value.$touch();

    if ($v.value.$error) {
        $q.notify({
            color: "warning",
            position: "top",
            icon: "warning",
            message: "Não é possível salvar!",
            caption: "Preencha todos os campos obrigatórios.",
        });
        return;
    }

    let url = "percurso";
    let tipo = "post";
    if (!inserir.value) {
        url += "/" + props.id;
        tipo = "put";
    }
    // const ret = await this.$geralService.comunicaAsync(url, tipo, percurso.value, "salvar percurso");
    const ret: any = await useCustomFetch(url, tipo, percurso.value, undefined);
    if (ret.valido) {
        onDialogOK(ret.data);
        $q.notify({
            type: "positive",
            message: "Registro salvo com sucesso!",
        });
    } else {
        console.log(ret);
        $q.notify({
            type: "negative",
            message: "Falha ao salvar",
        });
    }
};
</script>

