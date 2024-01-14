<template>
    <ExpansionItem v-model="programacaoObj.expanded"  class="shadow-1 mb-2" rounded :erroPadrao="v$.$error" :titulo="programacaoObj.titulo"
        :icon="programacaoObj.icone">
        
         <div class="row q-col-gutter-sm">
                                                            <span class="col-md-3 col-12">
                                                                <q-input ref="titulo_programacao" maxlength="80" counter
                                                                    autofocus hide-bottom-space outlined
                                                                    v-model="programacaoObj.titulo" label="Título"
                                                                    :error="v$.titulo.$error"
                                                                    error-message="Campo obrigatório" />
                                                            </span>
                                                            <!-- GO Início -->
                                                            <div class="col-md-3 col-12">
                                                                <CinputDate tipo="datetime" outlined
                                                                    :error="v$.inicio.$error"
                                                                    :error-message="'Campo Obrigátório'" :dense="false"
                                                                    v-model="programacaoObj.inicio" label="Início" />
                                                            </div>
                                                            <!-- GO Fim -->
                                                            <div class="col-md-3 col-12">
                                                                <CinputDate tipo="datetime" outlined
                                                                    :error="v$.fim.$error"
                                                                    :error-message="'Campo Obrigátório'" :dense="false"
                                                                    v-model="programacaoObj.fim" label="Fim" />
                                                            </div>
                                                            <span class="col-md-3 col-12">
                                                                <q-select clearable outlined v-model="programacaoObj.icone"
                                                                    label="Ícone (Opcional)" use-input input-debounce="100"
                                                                    behavior="menu" @filter="filterFn" :options="listaIcones">
                                                                    <template v-slot:prepend>
                                                                        <q-icon :name="programacaoObj.icone" />
                                                                    </template>
                                                                    <template v-slot:option="scope">
                                                                        <q-item v-bind="scope.itemProps">
                                                                            <q-item-section avatar>
                                                                                <q-icon :name="scope.opt" />
                                                                            </q-item-section>
                                                                            <q-item-section>
                                                                                <q-item-label caption>{{ scope.opt
                                                                                }}</q-item-label>
                                                                            </q-item-section>
                                                                        </q-item>
                                                                    </template>
                                                                    <template v-slot:no-option>
                                                                        <q-item>
                                                                            <q-item-section class="text-grey"> No results
                                                                            </q-item-section>
                                                                        </q-item>
                                                                    </template></q-select>
                                                            </span>
                                                            <span class="col-12">
                                                                <q-input hide-bottom-space maxlength="300" type="textarea"
                                                                    counter outlined v-model="programacaoObj.descricao"
                                                                    label="Descrição (Opcional)" />
                                                            </span>
                                                        </div>

        <div class="col-12 q-mt-md">
            <q-btn color="red" outline @click="excluir" :label="'Excluir Item'" icon="delete">
                <q-tooltip>Excluir Item</q-tooltip>
            </q-btn>
        </div>
    </ExpansionItem>
</template>

<script setup lang="ts">
import icones from '../service/iconawesome';
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useQuasar} from 'quasar';


const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({}),
    },
    index: {
        type: Number,
        default: null,
    },
});

const programacaoObj: any = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const rules = {
    titulo: {
        required
    },
    inicio: {
        required
    },
    fim: {
        required
    }
};
const $q = useQuasar();

const listaIcones = ref<any>(icones);

const emit = defineEmits(["update:modelValue", "onExcluir"]);

const v$ = useVuelidate(rules, programacaoObj, { $autoDirty: true });

const excluir = () => {
    emit("onExcluir", 'programacoes', props.index);
}

const filterFn = (val: any, update: Function) => {
    if (val === '') {
        update(() => {
            listaIcones.value = icones;
        });
        return;
    }
    update(() => {
        const needle = val.toLowerCase();
        listaIcones.value = icones.filter((v) => v.toLowerCase().indexOf(needle) > -1);
    });
};

onMounted(() => {
    v$.value.$touch();
});


</script>

<style scoped lang="scss"></style>
