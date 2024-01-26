<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon name="category" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Modelo de Categoria</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="save" :label="$q.screen.gt.xs ? 'Salvar' : undefined"
                        icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <div class="row q-col-gutter-sm">
                        <div class="col-sm-6 col-12">
                            <q-input hide-bottom-space outlined v-model="state.modeloCategoria.descricao"
                                :label="$v.modeloCategoria.descricao.$error ? 'Descrição (Campo Obrigatório)' : 'Descrição'"
                                @blur="$v.modeloCategoria.descricao.$touch" :error="$v.modeloCategoria.descricao.$error" />
                        </div>
                        <div class="col-sm-6 col-12">
                            <q-select outlined @update:model-value="(value) => changeTipo(value)"
                                v-model="state.modeloCategoria.tipo" label="Tipo de Categoria"
                                :options="['Individual', 'Coletivo']" />
                        </div>
                        <div class="col-12">
                                                    
                                                        <q-select class="full-width" outlined v-model="state.modeloCategoria.modalidadesEsportivas"
                                                            @filter="filterFn" label="Modalidades Esportivas" use-input use-chips multiple
                                                            input-debounce="0" map-options emit-value  filter
                                                            :options="listaModalidadeEsportivaFiltro" />
                                                    
                                                </div>
                        <div class="col-12">
                            <q-markup-table flat bordered>
                                <thead class="">
                                    <tr>
                                        <th colspan="14">
                                            <div class="row no-wrap items-center">
                                                <q-btn class="q-ml-sm" color="primary" label="Inserir Categoria" icon="add"
                                                    @click="addCatecoria">
                                                    <q-tooltip>
                                                        Categorias
                                                    </q-tooltip>
                                                </q-btn>
                                            </div>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th class="text-left"></th>
                                        <th class="text-left">Descrição</th>
                                        <th class="text-left">Tipo</th>
                                        <th class="text-left">Id Min</th>
                                        <th class="text-left">Id Max</th>
                                        <th class="text-left">Pa Max</th>
                                        <th class="text-left">F Min</th>
                                        <th class="text-left">F Max</th>
                                        <th class="text-left">M Min</th>
                                        <th class="text-left">M Max</th>
                                        <th class="text-left">Dificuldade</th>
                                        <th class="text-right"><span mr-2>Excluir</span></th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in state.modeloCategoria.categorias" :key="index"
                                        :class="{ 'az-tipo-menu': item.items }">
                                        <td draggable="true" @dragover="(e) => onDragOver(item, index, e)"
                                            @dragend="(e) => finishDrag(state.modeloCategoria.categorias, item, index, e)"
                                            @dragstart="(e) => startDrag(item, index, e)" class="text-right"
                                            style="width:55px;">
                                            <q-btn btn-scale push round glossy class="q-mr-xs" icon="swap_vert" />
                                        </td>
                                        <td class="text-left" style="min-width:110px;">
                                            <q-input dense outlined v-model="item.descricao" 
                                            :error="$v.modeloCategoria.categorias.$each.$response.$errors[index].descricao.length>0" hide-bottom-space/>
                                            <!-- <pre>{{ $v.modeloCategoria.categorias.$each.$response.$errors[index].descricao }}</pre> -->
                                        </td>
                                        <td class="text-left">
                                                <q-select dense v-model="item.tipo"
                                                    @update:model-value="(value) => changeTipoCategoria(value, index)"
                                                    :options="listaTipo" outlined
                                                    :error="$v.modeloCategoria.categorias.$each.$response.$errors[index].tipo && $v.modeloCategoria.categorias.$each.$response.$errors[index].tipo.length > 0"  hide-bottom-space/>
                                            </td>
                                            <td class="text-left tddif">
                                                <q-input type="number" dense outlined :min="0" v-model="item.idadeMinima"
                                                    :error="$v.modeloCategoria.categorias.$each.$response.$errors[index].idadeMinima && $v.modeloCategoria.categorias.$each.$response.$errors[index].idadeMinima.length > 0" hide-bottom-space/>
                                            </td>
                                            <td class="text-left tddif">
                                                <q-input type="number" dense outlined :min="0" v-model="item.idadeMaxima"
                                                    :error="$v.modeloCategoria.categorias.$each.$response.$errors[index].idadeMaxima && $v.modeloCategoria.categorias.$each.$response.$errors[index].idadeMaxima.length > 0" hide-bottom-space/>
                                            </td>
                                            <td class="text-left tddif">
                                                <q-input type="number" dense
                                                    :readonly="state.modeloCategoria.tipo === 'Individual'" outlined :min="0"
                                                    v-model="item.maximoParticipantes"
                                                    :error="$v.modeloCategoria.categorias.$each.$response.$errors[index].maximoParticipantes && $v.modeloCategoria.categorias.$each.$response.$errors[index].maximoParticipantes.length > 0" hide-bottom-space />
                                            </td>
                                            <td class="text-left tddif">
                                                <q-input type="number" :readonly="state.modeloCategoria.tipo === 'Individual'"
                                                    dense outlined :min="0" v-model="item.minimoFeminino"
                                                    :error="$v.modeloCategoria.categorias.$each.$response.$errors[index].minimoFeminino && $v.modeloCategoria.categorias.$each.$response.$errors[index].minimoFeminino.length > 0" hide-bottom-space />
                                            </td>
                                            <td class="text-left tddif">
                                                <q-input type="number" dense
                                                    :readonly="state.modeloCategoria.tipo === 'Individual' || item.tipo === 'Masculino'"
                                                    :min="0" :max="item.maximoParticipantes" outlined
                                                    v-model="item.maximoFeminino"
                                                    :error="$v.modeloCategoria.categorias.$each.$response.$errors[index].maximoFeminino && $v.modeloCategoria.categorias.$each.$response.$errors[index].maximoFeminino.length > 0" hide-bottom-space />
                                            </td>
                                            <td class="text-left tddif">
                                                <q-input type="number" :readonly="state.modeloCategoria.tipo === 'Individual'"
                                                    dense outlined :min="0" v-model="item.minimoMasculino"
                                                    :error="$v.modeloCategoria.categorias.$each.$response.$errors[index].minimoMasculino && $v.modeloCategoria.categorias.$each.$response.$errors[index].minimoMasculino.length > 0" hide-bottom-space />
                                            </td>
                                            <td class="text-left tddif">
                                                <q-input type="number" dense
                                                    :readonly="state.modeloCategoria.tipo === 'Individual' || item.tipo === 'Feminino'"
                                                    :min="0" :max="item.maximoParticipantes" outlined
                                                    v-model="item.maximoMasculino"
                                                    :error="$v.modeloCategoria.categorias.$each.$response.$errors[index].maximoMasculino && $v.modeloCategoria.categorias.$each.$response.$errors[index].maximoMasculino.length > 0" hide-bottom-space />
                                            </td>
                                            <td class="text-left">
                                                <q-input type="number" :min="0" :max="5"  dense outlined v-model="item.nivelDificuldade"
                                                    :error="$v.modeloCategoria.categorias.$each.$response.$errors[index].nivelDificuldade && $v.modeloCategoria.categorias.$each.$response.$errors[index].nivelDificuldade.length > 0" hide-bottom-space />
                                            </td>
                                        <td class="text-right" style="width:55px;">
                                            <q-btn class="mr-1" push round glossy color="negative" icon="delete"
                                                @click="state.modeloCategoria.categorias.splice(index, 1)" />
                                        </td>
                                    </tr>
                                </tbody>
                            </q-markup-table>
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
import { AddressbarColor, useDialogPluginComponent, useQuasar } from 'quasar';
import { reactive } from 'vue';

const props = defineProps({
    id: { type: String, default: null },
    copia: null,
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const state: any = reactive({ modeloCategoria: {} });
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


// GO valida
const validations = {
    modeloCategoria: {
        descricao: {
            required
        },
        categorias: {
            $each: helpers.forEach({
                descricao: { required },
                tipo: { required },
                idadeMinima: { required },
                idadeMaxima: { required },
                maximoParticipantes: { required },
                minimoFeminino: { required },
                minimoMasculino: { required },
                maximoFeminino: { required },
                maximoMasculino: { required },
                nivelDificuldade: { required }
            })
        }
    }
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

const listaTipo = ref(['Masculino', 'Feminino']);

const listaModalidadeEsportivaFiltro = ref<any>([]);
const listaModalidadeEsportiva = ref<any>([]);


const addCatecoria = () => {
    $v.value.modeloCategoria.categorias.$model.push({
        descricao: '', maximoParticipantes: 1, idadeMinima: 0, idadeMaxima: 120,
        'tipo': '',
        'minimoFeminino': null,
        'minimoMasculino': null,
        'maximoFeminino': null,
        'maximoMasculino': null,
        'nivelDificuldade': null
    });
}
const iniciaListaModalidadeEsportiva = async () => {
    const ret1: any = await useCustomFetch('modalidadeEsportiva/getPopulate', 'post', {
        filtro: {
            lixo: false
        },
        populateObj: []
    }, undefined);

    if (ret1.valido) {
        listaModalidadeEsportiva.value = ret1.data.map((esporte: any) => {
            return {
                label: esporte.descricao,
                value: esporte._id,
                obj: esporte
            };
        });
        listaModalidadeEsportivaFiltro.value = listaModalidadeEsportiva.value;
    } else {
        listaModalidadeEsportiva.value = [];
        listaModalidadeEsportivaFiltro.value = [];
    }
};

const filterFn = (val: any, update: any) => {
    update(() => {
        if (val === '') {
            listaModalidadeEsportivaFiltro.value = listaModalidadeEsportiva.value;
        } else {
            const needle = val.toLowerCase();
            listaModalidadeEsportivaFiltro.value = listaModalidadeEsportiva.value.filter(
                (esporte: any) => esporte.label.toLowerCase().indexOf(needle) > -1
            );
        }
    });
};

const changeTipo = (value: String) => {

    if (value === "Individual") {
        listaTipo.value = ['Masculino', 'Feminino'];

    } else {
        listaTipo.value = ['Masculino', 'Feminino', 'Misto'];
    }
    // console.log(listaTipo.value);
}

const changeTipoCategoria = (value: String, index: number) => {
    if (value === 'Masculino') {
        state.modeloCategoria.categorias[index].minimoMasculino = 1;
        state.modeloCategoria.categorias[index].maximoMasculino = 1;
        state.modeloCategoria.categorias[index].minimoFeminino = 0;
        state.modeloCategoria.categorias[index].maximoFeminino = 0;
        if (state.modeloCategoria.tipo === "Individual") {
            state.modeloCategoria.categorias[index].maximoParticipantes = 1;
        } else {
            state.modeloCategoria.categorias[index].maximoParticipantes = 2;
        }
    } else if (value === 'Feminino') {
        state.modeloCategoria.categorias[index].minimoMasculino = 0;
        state.modeloCategoria.categorias[index].maximoMasculino = 0;
        state.modeloCategoria.categorias[index].minimoFeminino = 1;
        state.modeloCategoria.categorias[index].maximoFeminino = 1;
        if (state.modeloCategoria.tipo === "Individual") {
            state.modeloCategoria.categorias[index].maximoParticipantes = 1;
        } else {
            state.modeloCategoria.categorias[index].maximoParticipantes = 2;
        }
    } else if (value === 'Misto') {
        state.modeloCategoria.categorias[index].minimoMasculino = 1;
        state.modeloCategoria.categorias[index].maximoMasculino = 1;
        state.modeloCategoria.categorias[index].minimoFeminino = 1;
        state.modeloCategoria.categorias[index].maximoFeminino = 1;
        state.modeloCategoria.categorias[index].maximoParticipantes = 2;
    }
};

onBeforeMount(async () => {
    await iniciaListaModalidadeEsportiva();
    if (props.id) {
        const ret: any = await useCustomFetch("modeloCategoria/" + props.id, "get", undefined, undefined);
        if (ret.valido) {
            state.modeloCategoria = JSON.parse(JSON.stringify(ret.data));
            if (props.copia) {
                state.modeloCategoria.descricao = state.modeloCategoria.descricao + " (Cópia)";
                state.modeloCategoria._id = undefined;
                state.modeloCategoria.__v = undefined;
                inserir.value = true;
            } else {
                inserir.value = false;
                changeTipo(state.modeloCategoria.tipo);
            }
        } else {
            // console.log('passou aquidsdsdsds');
            setTimeout(async () => {
                await cancel();
                // navigateTo('/login');
            }, 1);
        }
    } else {
        state.modeloCategoria = {  descricao: "", tipo: 'Individual', categorias: [], modalidadesEsportivas: [] } ;
        inserir.value = true;
    }
    
});

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
// TO save
const save = async () => {
    // // console.log($v.value.modeloCategoria);
    $v.value.modeloCategoria.$touch();

    if ($v.value.modeloCategoria.$error) {
        $q.notify({
            color: "warning",
            position: "top",
            icon: "warning",
            message: "Não é possível salvar!",
            caption: "Preencha todos os campos obrigatórios.",
        });
        return;
    }

    let url = "modeloCategoria";
    let tipo = "post";
    if (!inserir.value) {
        url += "/" + props.id;
        tipo = "put";
    }
    // console.log(state.modeloCategoria);
    // const ret = await this.$geralService.comunicaAsync(url, tipo, this.modeloCategoria, "salvar modeloCategoria");
    const ret: any = await useCustomFetch(url, tipo, state.modeloCategoria, undefined);
    if (ret.valido) {
        onDialogOK(ret.data);
        $q.notify({
            type: "positive",
            message: "Registro salvo com sucesso!",
        });
    } else {
        // console.log(ret);
        $q.notify({
            type: "negative",
            message: "Falha ao salvar",
        });
    }
};
</script>

<style lang="scss" scoped>td,
th {
    padding: 0px 5px 0px 0px !important;
}

.tddif {
    width: 80px !important;
    width: 80px !important;
}</style>