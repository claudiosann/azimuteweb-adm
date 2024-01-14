<template>
    <div>
        <q-separator />
        <q-expansion-item dense  class="az-selecionado3  az-radius-bottom" :group="('acrescimosGroup' + index)"
            v-model="acrescimo.open">
            <template v-slot:header>
                <q-item-section>
                    <q-item dense class="pl-0!">
                        <q-item-section>{{ acrescimo.descricao ? acrescimo.descricao : 'Indefinido' }}
                            <q-item-label>
                                <!-- <q-badge v-if="$v.loteInscricao.consumiveis.$each.$response.$data[index].acrescimos.$each.$response.$data[index2].$error" color="red" label="Incompleto" /> -->
                                <q-badge v-if="!acrescimo.descricao || !acrescimo.valor" color="red" label="Incompleto" />
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-item-section>
            </template>
            <div class="col-sm-4 col-md-12 q-pa-sm">
                <div class="row q-col-gutter-sm">
                    <div class="col-sm-4 col-md-4 col-12">
                        <q-input autofocus hide-bottom-space outlined v-model="acrescimo.descricao"
                            label="Descrição do Acréscimo" :dense="dense" :error="!acrescimo.descricao"
                            error-message="Campo obrigatório" />
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input type="number" reverse-fill-mask hide-bottom-space outlined label="Valor" :dense="dense"
                            v-model="acrescimo.valor" :error="!acrescimo.valor" error-message="Campo obrigatório" />
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input unmasked-value type="number" hide-bottom-space outlined
                            v-model="acrescimo.idadeMinima" label="Idade Minima" :dense="dense" />
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input unmasked-value type="number" hide-bottom-space outlined
                            v-model="acrescimo.idadeMaxima" label="Idade Maxima" :dense="dense" />
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-select hide-bottom-space outlined v-model="acrescimo.sexo" :options="sexo" label="Sexo"
                            :dense="dense" />
                    </div>
                    <div v-if="percurso" class="col-md-5 col-12">
                        <q-field outlined  stack-label
                            label="Categorias">
                            <template v-slot:control>
                                <div class="self-center full-width no-outline" tabindex="0">
                                    <q-chip v-for="(cat, index4) in acrescimo.categorias" :key="index4" removable
                                        @remove="acrescimo.categorias.splice(index4, 1)" color="primary"
                                        text-color="white">{{ cat }}</q-chip>
                                </div>
                            </template>
                            <template v-slot:append>
                                <q-btn @click="emit('addCategoria', index, index2, 'acrescimos')" round dense outline icon="add" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-md-5 col-12">
                        <q-field outlined stack-label
                            label="Entidades">
                            <template v-slot:control>
                                <div class="self-center full-width no-outline" tabindex="0">
                                    <q-chip square v-for="(entidade, index4) in acrescimo.entidades" :key="index4" removable
                                        @remove="acrescimo.entidades.splice(index4, 1)" color="primary" text-color="white">
                                        <q-avatar v-if="entidade.logo">
                                            <img :src="getUrlImagem(entidade.logo, 64)" />
                                        </q-avatar>
                                        {{ entidade.sigla }}
                                    </q-chip>
                                </div>
                            </template>
                            <template v-slot:append>
                                <q-btn  @click="emit('addEntidade', index, index2, 'acrescimos')" round dense outline icon="add" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input type="number" hide-bottom-space min="0" outlined
                            :ref="'state.loteInscricao.consumiveis' + index + '.acrescimos' + index2 + '.agrupador'"
                            v-model="acrescimo.agrupador" label="Agrupador" :dense="dense" >
                            <template v-slot:after>
                                            <q-btn icon="help" round flat>
                                                <q-popup-proxy>
                                                    <q-banner>
                                                        {{ `(Agrupador igual a 0(zero) ou vazio => acrescimo cumulativo.   (Agrupador maior que 0(zero) => acréscimo não cumulativo, o sistema aplica apenas o acréscimo de maior valor entre todos do mesmo agrupador). Válido para (Acréscimos / Acréscimos Para Dependentes).` }}
                                                    </q-banner>
                                                </q-popup-proxy>
                                            </q-btn>
                                        </template>
                        </q-input>
                    </div>
                </div>
                <div class="col-12 q-mt-sm">
                    <q-btn color="red" outline @click="emit('onExcluir', index, index2, 'acrescimos')"
                        label="Excluir Acréscimo" icon="delete">
                        <q-tooltip>Excluir Acréscimo</q-tooltip>
                    </q-btn>
                </div>
            </div>
        </q-expansion-item>
    </div>
</template>

<script setup lang="ts">

import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({}),
    },
    index: {
        type: Number,
        default: null,
    },
    index2: {
        type: Number,
        default: null,
    },
    dense: {
        type: Boolean,
        default: false,
    },
    listaModeloCategoria: {
        type: Object,
        default: null,
    },
    getUrlImagem: {
        type: Function,
        default: () => { },
    },
    percurso: {
        type: Boolean,
        default: false,
    },
});

const acrescimo: any = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const sexo = ['Masculino', 'Feminino', 'Qualquer'];

const rules = {
    descricao: {
        required
    },
    valor: {
        required
    }
};


const emit = defineEmits(["update:modelValue", "onExcluir", "addEntidade", "addCategoria"]);

const $v = useVuelidate(rules, acrescimo, { $autoDirty: true });


onMounted(() => {
    setTimeout(() => {
        $v.value.$touch();
    }, 500);

});



</script>

<style scoped lang="scss"></style>
