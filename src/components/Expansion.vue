<template>
  <q-expansion-item :group="group" expand-separator>
                                                <template v-slot:header>
                                                    <q-item-section avatar>
                                                        <q-icon :name="icon" />
                                                    </q-item-section>
                                                    <q-item-section>
                                                        <div class="text-bold">
                                                            {{ titulo ? titulo : "(indefinido)" }}
                                                            <q-badge class="ml-1" align="top" v-if="erroPadrao" color="red"
                                                                label="Incompleto" />
                                                        </div>
                                                    </q-item-section>
                                                </template>
                                                <div class="q-pa-md">
                                                    <div class="row q-mb-md">
                                                        <q-btn btn-scale push :label="labelBotao" :color="corBotao"
                                                            @click="inserirGeral"
                                                            icon="add"></q-btn>
                                                    </div>
                                                    <q-list class="rounded-lg">
                                                             <slot></slot>
                                                    </q-list>
                                                </div>
                                                
                                            </q-expansion-item>
</template>

<script setup lang="ts">
const props = defineProps({
    erroPadrao: {
        type: Boolean,
        default: false,
    },
    titulo: {
        type: String,
        default: '',
    },
    group: {
        type: String,
        default: '',
    },
    labelBotao: {
        type: String,
        default: 'Inserir',
    },
    icon: {
        type: String,
        default: '',
    },
    corBotao: {
        type: String,
        default: 'primary',
    },
});

const emit = defineEmits(["onInserir"]);

const inserirGeral = () => {
    emit("onInserir", null);
};

</script>

<style scoped lang="scss">
</style>
