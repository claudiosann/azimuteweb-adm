<template>
    <!-- <ExpansionItem v-model="contatoObj.expanded" :erroPadrao="v$.$error" :titulo="contatoObj.titulo"
        :icon="contatoObj.icone">
        
    </ExpansionItem> -->

    <div class="row mb-2">
        <span class="w-[3rem] ">
            <q-btn mr-2 btn-scale push round glossy class="q-mr-xs" icon="swap_vert" />
        </span>
        <span class="md:w-[calc(100%-6rem)] ">
            <div class="row q-col-gutter-sm ">

            <div class="col-md-3 col-12">
                <q-input hide-bottom-space dense autofocus outlined label="Cargo" v-model="contatoObj.cargo" type="text"
                    :error="v$.cargo.$error"  />
            </div>
            <div class="col-md-3 col-12">
                <q-input hide-bottom-space dense outlined v-model="contatoObj.nome" label="Nome" type="text"
                    :error="v$.nome.$error"  />

            </div>
            <div class="col-md-4 col-12">
                <q-input hide-bottom-space dense outlined v-model="contatoObj.email" label="Email" type="text"
                    :error="v$.email.$error"  />
            </div>
            <div class="col-md-2 col-12">
                <q-input hide-bottom-space dense outlined v-model="contatoObj.telefone" label="Telefone" type="text"
                    :error="v$.telefone.$error" />
            </div>
        </div>
        </span>
        <span class="w-[3rem] "><q-btn ml-1 push round btn-scale color="negative" icon="delete" @click="excluir"><q-tooltip>Excluir</q-tooltip></q-btn></span>
    </div>
    
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required, email, requiredIf } from "@vuelidate/validators";


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

const contatoObj: any = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const rules = {
    nome: { required },
    cargo: { required },
    telefone: {
        // @ts-ignore
        requiredIfFuction: requiredIf((dd: any, obj: any) => {
            if (obj.email) {
                return false;
            }
            return true;
        }),
    },
    email: {
        email,
         // @ts-ignore
        requiredIfFuction: requiredIf((dd: any, obj: any) => {
            if (obj.telefone) {
                return false;
            }
            return true;
        }),
    }
};



const emit = defineEmits(["update:modelValue", "onExcluir"]);

const v$ = useVuelidate(rules, contatoObj, { $autoDirty: true });

const excluir = () => {
    emit("onExcluir", 'contatos', props.index);
}

onMounted(() => {
    v$.value.$touch();
});


</script>

<style scoped lang="scss"></style>
