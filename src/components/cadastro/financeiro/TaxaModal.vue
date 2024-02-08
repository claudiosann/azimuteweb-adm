<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-rose-700 to-pink-400" name="attach_money"
            size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Taxa</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="save" :label="$q.screen.gt.xs ? 'Salvar' : undefined"
                        icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <div class="q-ma-sm">
                        <div class="row q-col-gutter-sm">
                            <div class="col-sm-8 col-md-8 col-12">
                                <q-input hide-bottom-space outlined v-model="taxa.descricao" label="Descrição"
                                    :dense="dense" :readonly="movimentado" @blur="$v.descricao.$touch"
                                    :error="$v.descricao.$error" error-message="Campo obrigatório" />
                            </div>
                            <div class="col-sm-8 col-md-8 col-12">
                                <q-input type="number" hide-bottom-space outlined v-model="taxa.valorPadrao" label="Valor"
                                    :dense="dense" />
                            </div>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, email, requiredIf } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar } from 'quasar';

const props = defineProps({
    id: { type: String, default: null },
    copia: null,
    movimentado: null
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const geral = useGeral();
const taxa: any = ref({
    entidade: geral.entidade._id,
    tipo: 'Caixa',
    contatos: [],
    saldoAtual: 0
});
const dense = ref(false);
const $q = useQuasar();


// GO valida
const validations = {
     entidade: {
        required
    },
    descricao: {
        required
    },
    valorPadrao: {
        required
    },
};

const $v = useVuelidate(validations, taxa);

const inserir = ref(true);

onBeforeMount(async () => {

    if (props.id) {
        const ret: any = await useCustomFetch("taxa/" + props.id, "get", undefined, undefined);
        if (ret.valido) {
            taxa.value = ret.data;
            if (props.copia) {
                taxa.value.descricao = taxa.value.descricao + " (Cópia)";
                taxa.value._id = undefined;
                taxa.value.__v = undefined;
                inserir.value = true;
            } else {
                inserir.value = false;
            }
        } else {
            // console.log('passou aquidsdsdsds');
            setTimeout(async () => {
                await cancel();
                // navigateTo('/login');
            }, 1);
        }
    } else {
        inserir.value = true;
    }
});



const cancel = async () => {
    // console.log('passou aquitttt');
    onDialogCancel();
    $q.notify({
        position: "top",
        type: "info",
        textColor: "white",
        message: (inserir.value ? "Inserção " : "Edição ") + "cancelada!",
    });
    return;
};
// TO save
const save = async () => {
    $v.value.$touch();

    if ($v.value.$error) {
        $q.notify({
            color: "warning",
            position: "top",
            icon: "warning",
            message: "Não é possível salvar!",
            caption: "Preencha todos os campos obrigatórios.",
        });
        return;
    }

    let url = "taxa";
    let tipo = "post";
    if (!inserir.value) {
        url += "/" + props.id;
        tipo = "put";
    }
    // const ret = await this.$geralService.comunicaAsync(url, tipo, this.taxa, "salvar taxa");
    const ret: any = await useCustomFetch(url, tipo, taxa.value, undefined);
    if (ret.valido) {
        onDialogOK(ret.data);
        $q.notify({
            type: "positive",
            message: "Registro salvo com sucesso!",
        });
    } else {
        // console.log(ret);
        $q.notify({
            type: "negative",
            message: "Falha ao salvar",
        });
    }
};
</script>

