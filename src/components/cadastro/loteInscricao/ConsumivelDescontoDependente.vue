<template>
    <div>
        <q-separator />
        <q-expansion-item dense class="az-selecionado4 az-radius-bottom"
            :group="('descontosDependentesGroup' + index)" v-model="descDep.open">
            <template v-slot:header>
                <q-item-section>
                    <q-item dense class="pl-0!">
                        <q-item-section>{{ descDep.descricao ? descDep.descricao : 'Indefinido' }}
                            <q-item-label>
                                <!-- <q-badge v-if="$v.loteInscricao.consumiveis.$each.$response.$data[index].descontosDependentes.$each.$response.$data[index2].$error || descDep.sequenciaDescontos.length < 1" color="red" label="Incompleto" /> -->
                                <q-badge v-if="!descDep.descricao || descDep.sequenciaDescontos.length < 1" color="red"
                                    label="Incompleto" />
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-item-section>
            </template>
            <div class="col-sm-4 col-md-12 q-pa-sm">
                <div class="row q-col-gutter-sm">
                    <div class="col-sm-4 col-md-4 col-12">
                        <q-input autofocus hide-bottom-space outlined v-model="descDep.descricao"
                            label="Descrição do Desconto" :dense="dense" :error="!descDep.descricao"
                            error-message="Campo obrigatório" />
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input unmasked-value type="number" :min="0" hide-bottom-space outlined
                            v-model="descDep.minimo" label="A partir do" :dense="dense" >
                             <template v-slot:append>
                                <q-btn icon="help" round flat>
                                    <q-popup-proxy>
                                        <q-banner>
                                            A partir do dependente (N) será aplicado o desconto
                                        </q-banner>
                                    </q-popup-proxy>
                                </q-btn>
                            </template>
                        </q-input>
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input unmasked-value type="number" hide-bottom-space outlined
                            v-model="descDep.maximo" label="Qtde Máxima" :dense="dense" >
                            <template v-slot:append>
                                <q-btn icon="help" round flat>
                                    <q-popup-proxy>
                                        <q-banner>
                                            Número máximo de dependentes que será aplicado o desconto
                                        </q-banner>
                                    </q-popup-proxy>
                                </q-btn>
                            </template>
                        </q-input>
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input unmasked-value type="number" hide-bottom-space outlined
                            v-model="descDep.idadeMinima" label="Idade Minima" :dense="dense" />
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input unmasked-value type="number" hide-bottom-space outlined
                            v-model="descDep.idadeMaxima" label="Idade Maxima" :dense="dense" />
                    </div>
                    <div class="col-sm-4 col-md-6 col-12">
                        <q-select multiple hide-bottom-space use-chips he outlined v-model="descDep.tipo"
                            :options="listaTipoDependentes" label="Tipos Aceitos" :dense="dense">
                            <template v-slot:selected-item="scope">
                                <q-chip removable dense @remove="scope.removeAtIndex(scope.index)"
                                    :tabindex="scope.tabindex" color="indigo" text-color="white">
                                    {{ scope.opt }}
                                </q-chip>
                            </template>

                        </q-select>
                    </div>
                    <div class="col-sm-4 col-md-6 col-12">
                        <q-field outlined stack-label label="Senquência de descontos"
                            :error="descDep.sequenciaDescontos.length < 1" error-message="Adicione pelo menos um valor">
                            <template v-slot:control>
                                <div class="self-center full-width no-outline" tabindex="0">
                                    <q-chip v-for="(valor, index4) in descDep.sequenciaDescontos" :key="index4" removable
                                        @remove="descDep.sequenciaDescontos.splice(index4, 1)" color="indigo"
                                        text-color="white">{{ $geralService.numeroParaMoeda(valor) }}</q-chip>
                                </div>
                            </template>
                            <template v-slot:append>
                                <q-btn @click="emit('onAddValores', index, index2)" round dense outline icon="add" />
                                <q-btn icon="help" round flat>
                                    <q-popup-proxy>
                                        <q-banner>
                                            exemplo [10.00, 20.00, 30.00] - o primeiro desconto será de 10,00 o segundo de
                                            20,00 e a partir do terceiro será de 30,00 (tudo isso respeitando o campo
                                            Qtde Mínima e Qtde Máxima, se informado)
                                        </q-banner>
                                    </q-popup-proxy>
                                </q-btn>
                            </template>
                        </q-field>
                    </div>
                    <div v-if="percurso" class="col-md-5 col-12">
                        <q-field outlined  stack-label
                            label="Categorias">
                            <template v-slot:control>
                                <div class="self-center full-width no-outline" tabindex="0">
                                    <q-chip v-for="(cat, index4) in descDep.categorias" :key="index4" removable
                                        @remove="descDep.categorias.splice(index4, 1)" color="indigo" text-color="white">{{
                                            cat }}</q-chip>
                                </div>
                            </template>
                            <template v-slot:append>
                                <q-btn @click="emit('addCategoria', index, index2, 'descontosDependentes')" round dense outline icon="add" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-md-5 col-12">
                        <q-field outlined  stack-label
                            label="Entidades">
                            <template v-slot:control>
                                <div class="self-center full-width no-outline" tabindex="0">
                                    <q-chip square v-for="(entidade, index4) in descDep.entidades" :key="index4" removable
                                        @remove="descDep.entidades.splice(index4, 1)" color="indigo" text-color="white">
                                        <q-avatar v-if="entidade.logo">
                                            <img :src="getUrlImagem(entidade.logo, 64)" />
                                        </q-avatar>
                                        {{ entidade.sigla }}
                                    </q-chip>
                                </div>
                            </template>
                            <template v-slot:append>
                                <q-btn @click="() => {
                                    console.log('addEntidade');
                      emit('addEntidade', index, index2, 'descontosDependentes');
                    }" round dense outline icon="add" />
                            </template>
                        </q-field>
                    </div>
                    <div class="col-sm-4 col-md-2 col-12">
                        <q-input type="number" hide-bottom-space min="0" outlined
                            :ref="'state.loteInscricao.consumiveis' + index + '.descontosDependentes' + index2 + '.agrupador'"
                            v-model="descDep.agrupador" label="Agrupador" :dense="dense" >
                        <template v-slot:append>
                                    <q-btn icon="help" round flat>
                                        <q-popup-proxy>
                                            <q-banner>
                                                Se um desconto tiver o mesmo agrupador, o sistema irá aplicar apenas o desconto de maior valor entre todos do mesmo agrupador. Válido para (Descontos / Descontos Para Dependentes).
                                            </q-banner>
                                        </q-popup-proxy>
                                    </q-btn>
                                </template>
                        </q-input>
                    </div>
                </div>
                <div class="col-12 q-mt-sm">
                    <q-btn color="red" outline @click="emit('onExcluir', index, index2, 'descontosDependentes')"
                        label="Excluir Desconto" icon="delete">
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
        default: false,
    },
});

const descDep: any = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const listaTipoDependentes = ['Pai/Mãe', 'Cônjuge', 'Filho(a)', 'Qualquer'];

const rules = {
    descricao: {
        required
    }
};


const emit = defineEmits(["update:modelValue", "onExcluir", "addEntidade", "addCategoria", "onAddValores"]);

const $v = useVuelidate(rules, descDep, { $autoDirty: true });


onMounted(() => {
    setTimeout(() => {
        $v.value.$touch();
    }, 500);

});



</script>

<style scoped lang="scss"></style>
