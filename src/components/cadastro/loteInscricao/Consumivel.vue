<template>
    <div>
        <q-separator />
        <q-expansion-item dense class="az-selecionado az-radius-bottom"  expand-separator icon="perm_identity"
            group="contatosGroup" v-model="consumido.open">
            <template v-slot:header>
                <q-item-section >
                    <q-item dense class="pl-0!">
                        <q-item-section>
                            
                                
                                {{ consumido.consumivel ? consumido.consumivel.descricao: '' }}
                                <q-item-label>
                                <q-badge v-if="!(consumido.consumivel)" color="red" label="Incompleto" />
                                <q-badge class=""
                                    v-if="(consumido.consumivel) && !(parseFloat(consumido.valor) > 0)"
                                    :color="consumido.valor > 0 ? 'blue' : 'green'" label="Gratuito" />
                                <q-badge class=""
                                    v-if="(consumido.consumivel) && (parseFloat(consumido.valor) > 0)" color="blue"
                                    :label="'R$ ' + $geralService.numeroParaMoeda(consumido.valor)" />
                                    </q-item-label>
                            
                            <!-- {{getDescricao(consumido.consumivel)}} -->
                            <!-- {{ $refs.state.loteInscricao['consumivel'+index]}} -->
                        </q-item-section>
                    </q-item>
                </q-item-section>
            </template>
            <div class="col-sm-6 col-md-12 q-pa-sm">
                <div class="row q-col-gutter-sm mb-4">
                    <div class="col-md-4 col-sm-6 col-12">
                        <q-select :ref="'state.loteInscricao.consumivel' + index" hide-bottom-space outlined
                            v-model="consumido.consumivel" :options="listaConsumiveis" option-label="descricao" emit-value
                            :option-value="(obj) => obj" map-options label="Consumível" :dense="dense"
                            :error="!(consumido.consumivel)" error-message="Campo Obrigatório" />
                    </div>
                    <div v-if="consumido.consumivel" class="col-sm-6 col-md-2 col-12">
                        <q-input prefix="R$ " hide-bottom-space outlined type="number"
                            v-model="consumido.valor" label="Valor" :dense="dense"
                            error-message="Campo obrigatório" />
                    </div>
                    <div v-if="consumido.consumivel" class="col-md-2 col-sm-6 col-12">
                        <q-input outlined input-class="text-right" type="number" :step="1" :min="0"
                            v-model="consumido.quantidade" label="Qtde Disponível" :dense="dense" />
                    </div>
                    </div>
                    <slot></slot>
                    <!-- contato fim -->
                    <div class="col-12 mt-4">
                        <q-btn color="red" outline @click="emit('onExcluir', index)" label="Excluir Configuração"
                            icon="delete">
                            <q-tooltip>Excluir Configuração</q-tooltip>
                        </q-btn>
                    </div>
                
            </div>
        </q-expansion-item>
    </div>
</template>

<script setup lang="ts">

import { useVuelidate } from "@vuelidate/core";
import { required, requiredIf } from "@vuelidate/validators";
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
    listaConsumiveis: {
        type: Array,
        default: [],
    },
});

const consumido: any = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const getDescricaoConsumivel = (id: String) => {
    const consumivel: any = props.listaConsumiveis.find((obj: any) => obj._id === id);
    return consumivel ? consumivel.descricao : '';
};


const rules = {
    consumido: { 
       
     },
    
};
const $q = useQuasar();

const emit = defineEmits(["update:modelValue", "onExcluir"]);

const $v = useVuelidate(rules, consumido, { $autoDirty: true });


onMounted(() => {
    setTimeout(() => {
        $v.value.$touch();
    }, 500);

});



</script>

<style scoped lang="scss"></style>
