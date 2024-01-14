<template>
    <div>
        <q-separator />
        <q-expansion-item dense class="az-selecionado2  az-radius-bottom" :group="('descontosGroup' + index)"
            v-model="desconto.open">
            <template v-slot:header>
                <q-item-section >
                    <q-item dense class="pl-0!">
                        <q-item-section  >{{ desconto.descricao ? desconto.descricao : 'Indefinido' }}
                            <q-item-label>
                                <!-- <q-badge v-if="$v.loteInscricao.consumiveis.$each.$response.$data[index].descontos.$each.$response.$data[index2].$error" color="red" label="Incompleto" /> -->
                                <q-badge v-if="!desconto.descricao || !desconto.valor" color="red" label="Incompleto" />
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-item-section>
            </template>
            <div class=" col-sm-4 col-md-12 q-pa-sm">
                <div class="row q-col-gutter-sm">
                    <div class="col-sm-4 col-md-4 col-12">
                        <q-input autofocus hide-bottom-space outlined v-model="desconto.descricao"
                            label="Descrição do Desconto" :dense="dense" :error="!desconto.descricao"
                            error-message="Campo obrigatório" />
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input type="number" reverse-fill-mask hide-bottom-space outlined label="Valor" :dense="dense"
                            v-model="desconto.valor" :error="!desconto.valor" error-message="Campo obrigatório" />
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input unmasked-value type="number" hide-bottom-space outlined
                            v-model="desconto.idadeMinima" label="Idade Minima" :dense="dense" />
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input unmasked-value type="number" hide-bottom-space outlined
                            v-model="desconto.idadeMaxima" label="Idade Maxima" :dense="dense" />
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-select hide-bottom-space outlined v-model="desconto.sexo" :options="sexo" label="Sexo"
                            :dense="dense" />
                    </div>
                    <div v-if="percurso" class="col-md-5 col-12">
                        <q-field outlined  stack-label
                            label="Categorias">
                            <template v-slot:control>
                                <div class="self-center full-width no-outline" tabindex="0">
                                    <q-chip v-for="(cat, index4) in desconto.categorias" :key="index4" removable
                                        @remove="desconto.categorias.splice(index4, 1)" color="primary"
                                        text-color="white">{{ cat }}</q-chip>
                                </div>
                            </template>
                            <template v-slot:append>
                                <q-btn @click="emit('addCategoria', index, index2, 'descontos')" round dense outline icon="add" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-md-5 col-12">
                        <q-field outlined  stack-label
                            label="Entidades">
                            <template v-slot:control>
                                <div class="self-center full-width no-outline" tabindex="0">
                                    <q-chip square v-for="(entidade, index4) in desconto.entidades" :key="index4" removable
                                        @remove="desconto.entidades.splice(index4, 1)" color="primary" text-color="white">
                                        <q-avatar v-if="entidade.logo">
                                            <img :src="getUrlImagem(entidade.logo, 64)" />
                                        </q-avatar>
                                        {{ entidade.sigla }}
                                    </q-chip>
                                </div>
                            </template>
                            <template v-slot:append>
                                <q-btn round @click="()=>{console.log('jhjdhf'); emit('addEntidade', index, index2, 'descontos')}" dense outline icon="add" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input type="number" hide-bottom-space min="0" outlined
                            v-model="desconto.agrupador" label="Agrupador" :dense="dense" >
                        <template v-slot:after>
                                        <q-btn icon="help" round flat>
                                            <q-popup-proxy>
                                                <q-banner>
                                                    {{ `(Agrupador igual a 0(zero) ou vazio => descontos cumulativos.   (Agrupador maior que 0(zero) => desconto não cumulativos, o sistema aplica apenas o desconto de maior valor entre todos do mesmo agrupador). Válido para (Descontos / Descontos Para Dependentes).`}}
                                                </q-banner>
                                            </q-popup-proxy>
                                        </q-btn>
                                    </template></q-input>
                    </div>
                </div>
                <div class="col-12 q-mt-sm">
                    <q-btn color="red" outline @click="emit('onExcluir', index, index2, 'descontos')" label="Excluir Desconto" icon="delete">
                        <q-tooltip>Excluir Desconto</q-tooltip>
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
        default: true,
    },
});

const desconto: any = computed({
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

const $v = useVuelidate(rules, desconto, { $autoDirty: true });


onMounted(() => {
    setTimeout(() => {
        $v.value.$touch();
    }, 500);

});



</script>

<style scoped lang="scss"></style>
