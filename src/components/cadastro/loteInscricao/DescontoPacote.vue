<template>

    <div>
                                                <q-separator />
                                                <q-expansion-item dense class="az-selecionado5 az-radius-bottom" group="contatosGroup" v-model="pacote.open">
                                                    <template v-slot:header>
                                                        <q-item-section class="pl-0!">
                                                            <q-item dense class="pl-0!">
                                                                <q-item-section class="pl-0!">
                                                                    {{ pacote.descricao ? pacote.descricao : 'Indefinido' }}
                                                                    <q-item-label>
                                                                        <q-badge v-if="!(pacote.descricao && pacote.consumiveis.length > 1)" color="red" label="Incompleto" />
                                                                    </q-item-label>
                                                                </q-item-section>
                                                            </q-item>
                                                        </q-item-section>
                                                    </template>
                                                    <div class="col-sm-6 col-md-12 q-pa-sm">
                                                        <div class="row q-col-gutter-sm">
                                                            <div class="col-sm-6 col-md-4 col-12">
                                                                <q-input hide-bottom-space outlined  v-model="pacote.descricao" label="Descrição do Pacote" :dense="dense" :error="!pacote.descricao" error-message="Campo obrigatório" />
                                                            </div>
                                                            <!-- <div class="col-sm-6 col-md-2 col-12">
                                                                <q-input hide-bottom-space outlined  v-model="pacote.valor" label="Valor" :dense="dense" :error="!pacote.valor" error-message="Campo obrigatório" unmasked-value mask="R$ #.##" fill-mask="0" reverse-fill-mask />
                                                            </div>
                                                            <div class="col-md-4 col-sm-6 col-12">
                                                                <q-select hide-bottom-space outlined multiple use-chips v-model="pacote.consumiveis" :options="listaConsumiveis" option-label="descricao" emit-value :option-value="(obj) => obj._id" map-options label="Consumíveis" :dense="dense" :rules="[val => val.length > 1 || 'Selecione pelo menos dois consumíveis']">
                                                                <template v-slot:selected-item="scope">
                                                                  <q-chip
                                                                    removable
                                                                    dense
                                                                    @remove="scope.removeAtIndex(scope.index)"
                                                                    :tabindex="scope.tabindex"
                                                                    color="indigo"
                                                                    text-color="white"
                                                                  >
                                                                    {{ scope.opt.descricao }}
                                                                  </q-chip>
                                                                </template>
                                                                </q-select>
                                                            </div> -->
                                                        </div>
                                                        <slot></slot>
                                                        <!-- contato fim -->
                                                        <div class="col-12 q-mt-sm">
                                                            <q-btn color="red" outline @click="emit('onExcluir',index)" label="Excluir Pacote" icon="delete">
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

const pacote: any = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});


const rules = {
    descricao: {
                    required
                },
                // consumiveis: {
                //   required
                // },
};
const $q = useQuasar();

const emit = defineEmits(["update:modelValue", "onExcluir"]);

const $v = useVuelidate(rules, pacote, { $autoDirty: true });




onMounted(() => {
    setTimeout(() => {
        $v.value.$touch();
    }, 500);

});



</script>

<style scoped lang="scss"></style>
