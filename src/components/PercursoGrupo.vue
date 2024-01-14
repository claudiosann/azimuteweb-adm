<template>
    <ExpansionItem v-model="percursoGrupo.expanded" rounded class="m-2 shadow-1" :spaced="false" :erroPadrao="$v.$error"
        :titulo="percursoGrupo.descricao" :icon="percursoGrupo.icone">

        <div class="col-md-12 q-pa-sm">
            <div class="row q-col-gutter-sm">
                <div class="col-sm-6 col-md-5 col-12">
                    <q-input hide-bottom-space outlined autofocus v-model="percursoGrupo.descricao" label="Descricao"
                        :dense="dense" @blur="$v.descricao.$touch" :error="$v.descricao.$error"
                        error-message="Campo obrigatório" />
                </div>
                <div class="col-md-2 col-sm-6 col-12">
                    <q-input mask="#" fill-mask=" " reverse-fill-mask suffix="metros" min="1" outlined
                        v-model="percursoGrupo.distancia" label="Distância" :dense="dense" />
                </div>
                <div class="col-md-2 col-sm-6 col-12">
                    <q-input mask="#" fill-mask=" " reverse-fill-mask suffix="metros" min="1" outlined
                        v-model="percursoGrupo.altimetria" label="Altimetria" :dense="dense" />
                </div>
                <div class="col-md-2 col-sm-6 col-12">
                    <q-input mask="#" fill-mask=" " reverse-fill-mask min="1" outlined
                        v-model="percursoGrupo.quantidadePontos" label="Numero de Pontos" :dense="dense" />
                </div>
                <div class="col-12">
                    <q-list bordered class="rounded-lg pb-2">
                        <div class="flex justify-between">
                        <q-item-label class="p-0 m-2 text-lg" :dense="true">
                            Categorias
                        </q-item-label>
                        <q-btn class="mt-2 mr-2" push glossy color="indigo" @click="inserirCategoria" icon="add"
                            label="Inserir Categoria">
                            <q-tooltip>Inserir Nova Categoria</q-tooltip>
                        </q-btn>
                        </div>
                        <div class="mb-2" v-for="(cat, index2) in percursoGrupo.categorias" :key="index2">
                                <div class="mt-0 ml-1 row q-col-gutter-sm">
                                    <div class="col-sm-4 col-md-3 col-12">
                                        <q-select hide-bottom-space outlined  dense v-model="cat.categoria" label="Categoria"
                                            autofocus option-label="descricao" :emit-value="true" map-options
                                            @filter="filterFn" use-input input-debounce="0" option-value="descricao"
                                            :options="options"
                                            :error="$v.categorias.$each.$response.$data[index2].categoria.$error"
                                            ></q-select>
                                    </div>
                                    <div class="col-sm-4 col-md-2 col-12">
                                        <q-input type="number" suffix="minutos" :step="1" hide-bottom-space outlined min=0
                                            :ref="'percurso.grupos' + index + '.categorias' + index2 + '.tempoZerador'"
                                            v-model="cat.tempoZerador" label="Tempo Zerador" dense
                                            :error="$v.categorias.$each.$response.$data[index2].tempoZerador.$error"
                                            />
                                    </div>
                                     <div class="col-12 col-sm-2 ">
                                        <q-btn color="red" @click="excluirCategoria(index2)" round push glossy label=""
                                            icon="delete">
                                            <q-tooltip>Excluir categoria</q-tooltip>
                                        </q-btn>
                                    </div>
                                </div>
                               
                        </div>
                    </q-list>
                </div>
            </div>
        </div>

        <div class="col-12 q-mt-md">
            <q-btn color="red" outline @click="excluir" :label="'Excluir Grupo'" icon="delete">
                <q-tooltip>Excluir Grupo</q-tooltip>
            </q-btn>
        </div>
    </ExpansionItem>
</template>

<script setup lang="ts">

import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { useQuasar } from 'quasar';

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({}),
    },
    index: {
        type: Number,
        default: null,
    },
    dense: {
        type: Boolean,
        default: false,
    },
    modeloCategoria: {
        type: Object,
        default: null,
    },
});

const percursoGrupo: any = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const inserirCategoria = () => {
    percursoGrupo.value.categorias.push({
        categoria: '',
        tempoZerador: 0,
        expanded: true
    });
    $v.value.touch();
};

const excluirCategoria = (index1: number) => {
    percursoGrupo.value.categorias.splice(index1, 1);
};

const rules = {
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
            },
            $validationGroups: {
                categoriasError: ["categoria", "tempoZerador"]
            },
        })
    }
};
const $q = useQuasar();

const emit = defineEmits(["update:modelValue", "onExcluir"]);

const $v = useVuelidate(rules, percursoGrupo, { $autoDirty: true });

const excluir = () => {
    emit("onExcluir", props.index);
}

const options = ref<any>([]);

onMounted(() => {
    setTimeout(() => {
    $v.value.$touch();    
    }, 500);

    if (props.modeloCategoria) {
        options.value = props.modeloCategoria.categorias;
    }
    
});

const filterFn = (val: string, update: any) => {
    if (val === '') {
        update(() => {
            if (props.modeloCategoria) {
                options.value = props.modeloCategoria.categorias;
            } else {
                options.value = [];
            }
        });
        return;
    }

    update(() => {
        const needle = val.toLowerCase();
        if (props.modeloCategoria) {
            options.value = props.modeloCategoria.categorias.filter((v: any) => v.descricao.toLowerCase().includes(needle));
        } else {
            options.value = [];
        }
    });
};


</script>

<style scoped lang="scss"></style>
