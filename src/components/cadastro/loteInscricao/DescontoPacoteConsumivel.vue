<template>
    <div>
        <q-separator />
        <q-expansion-item  dense class="az-selecionado2  az-radius-bottom" :group="('descontosGroup' + index)"
            v-model="pacoteConsumivel.open">
            <template v-slot:header>
                <q-item-section >
                    <q-item class="pl-0!" dense>
                        <q-item-section>{{ pacoteConsumivel.consumivel ? getDescricaoConsumivel(pacoteConsumivel.consumivel)  : 'Indefinido' }}
                            <q-item-label>
                                <!-- <q-badge v-if="$v.loteInscricao.consumiveis.$each.$response.$data[index].descontos.$each.$response.$data[index2].$error" color="red" label="Incompleto" /> -->
                                <q-badge v-if="!pacoteConsumivel.consumivel || !pacoteConsumivel.valor" color="red" label="Incompleto" />
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-item-section>
            </template>
            <div class=" col-sm-4 col-md-12 q-pa-sm">
                <div class="row q-col-gutter-sm">
                    <div class="col-md-4 col-sm-6 col-12">
                        <q-select hide-bottom-space outlined v-model="pacoteConsumivel.consumivel"
                            :options="listaConsumiveis" option-label="descricao" emit-value option-value="_id"
                            map-options label="Consumível" :dense="dense"
                            :rules="[val => val.length > 0 || 'Selecione um consumível']">
                        </q-select>
                    </div>
                    <div class="col-md-4 col-sm-6 col-12">
                         
                    <q-select hide-bottom-space outlined v-model="pacoteConsumivel.tipo" :options="['Percentual', 'Valor']" label="Tipo" :dense="dense" />
                         
                    </div>
                    <div class="col-sm-6 col-md-2 col-12">
                        <q-input hide-bottom-space outlined v-model="pacoteConsumivel.valor" label="Valor" :dense="dense"
                              :prefix="pacoteConsumivel.tipo=='Valor'?'R$':'%'" type="number" input-class="text-right"/>
                    </div>
                    
                    <div class="col-sm-6 col-md-4 col-12">
                            <q-input type="number" hide-bottom-space min="0" outlined
                                v-model="pacoteConsumivel.agrupador" label="Agrupador" :dense="dense" >
                            <template v-slot:after>
                                            <q-btn icon="help" round flat>
                                                <q-popup-proxy>
                                                    <q-banner>
                                                        {{ `(Agrupador igual a 0(zero) ou vazio => descontos cumulativos.   (Agrupador maior que 0(zero) => desconto não cumulativos, o sistema aplica apenas o desconto de maior valor entre todos do mesmo agrupadore do mesmo consumível). Válido para (Descontos Para Pacotes` }}
                                                    </q-banner>
                                                </q-popup-proxy>
                                            </q-btn>
                                        </template></q-input>
                        </div>

                </div>
                <div class="col-12 q-mt-sm">
                    <q-btn color="red" outline @click="emit('onExcluir', index, index2, 'descontos')"
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
    listaConsumiveis: {
        type: Array,
        default: null,
    }
});

const pacoteConsumivel: any = computed({
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
    consumivel: {
        required
    }
};


const emit = defineEmits(["update:modelValue", "onExcluir",]);

const $v = useVuelidate(rules, pacoteConsumivel, { $autoDirty: true });


onMounted(() => {
    setTimeout(() => {
        $v.value.$touch();
    }, 500);

});



</script>

<style scoped lang="scss"></style>
