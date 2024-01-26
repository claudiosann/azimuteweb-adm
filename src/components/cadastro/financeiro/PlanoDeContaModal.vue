<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-teal-700 to-lime-400"
                        name="format_list_numbered" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Plano de Conta</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="save" :label="$q.screen.gt.xs ? 'Salvar' : undefined"
                        icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <div class="q-ma-sm ">
                        <div class="row q-col-gutter-sm">
                            <div class="col-sm-6 col-md-3 col-12">
                                <q-field hide-bottom-space outlined label="Especificacao" dense stack-label
                                    @blur="$v.especificacao.$touch" :error="$v.especificacao.$error"
                                    error-message="Campo obrigatório">
                                    <template v-slot:control>
                                        <div class="col-12 self-center full-width no-outline row" tabindex="0">
                                            <q-radio class="col-6" v-model="financeiroPlanoConta.especificacao"
                                                val="Analítica" label="Analítica" />
                                            <q-radio class="col-6" v-model="financeiroPlanoConta.especificacao"
                                                val="Sintética" label="Sintética" />
                                        </div>
                                    </template>
                                </q-field>
                            </div>
                            <div class="col-sm-6 col-md-3 col-12">
                                <q-field :readonly="!inserir" hide-bottom-space outlined label="Tipo" dense stack-label
                                    @blur="$v.tipo.$touch" :error="$v.tipo.$error" error-message="Campo obrigatório">
                                    <template v-slot:control>
                                        <div class="col-12 self-center full-width no-outline row" tabindex="0">
                                            <q-radio class="col-6" v-if="nodePai.plano.tipo === 'D'"
                                                v-model="financeiroPlanoConta.tipo" val="D" label="Débito" />
                                            <q-radio class="col-6" v-if="nodePai.plano.tipo === 'C'"
                                                v-model="financeiroPlanoConta.tipo" val="C" label="Crédito" />
                                        </div>
                                    </template>
                                </q-field>
                            </div>
                            <div v-if="financeiroPlanoConta.financeiroPlanoContaPai" class="col-sm-6 col-md-6 col-12">
                                <q-field outlined
                                    label="Plano de Conta Pai" stack-label>
                                    <template v-slot:control>
                                        <div class="self-center full-width no-outline" tabindex="0">{{
                                            financeiroPlanoConta.financeiroPlanoContaPai.identificador + ' - ' +
                                            financeiroPlanoConta.financeiroPlanoContaPai.descricao }} </div>
                                    </template>
                                </q-field>
                            </div>
                            <div class="col-sm-6 col-md-12 col-12">
                                <q-input hide-bottom-space outlined v-model="financeiroPlanoConta.descricao"
                                    label="Descrição" :dense="dense" @blur="$v.descricao.$touch"
                                    :error="$v.descricao.$error" error-message="Campo obrigatório" />
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
    nodePai: null,
    movimentado: null
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const geral = useGeral();
const financeiroPlanoConta: any = ref({
    entidade: '',
    tipo: '',
    especificacao: '',
    identificador: '',
    financeiroPlanoContaPai: '' // tem que ser um objeto para ser usar no field
});
const dense = ref(false);
const $q = useQuasar();


// GO valida
const validations = {
    entidade: {
        required
    },
    tipo: {
        required
    },
    especificacao: {
        required
    },
    descricao: {
        required
    }
};


const $v = useVuelidate(validations, financeiroPlanoConta);

const inserir = ref(true);

const getSequencia = () => {
    if (props.nodePai.children) {
        if (props.nodePai.children.length > 0) {
            const sp = props.nodePai.children[props.nodePai.children.length - 1].plano.identificador.split('.');
            return (parseInt(sp[sp.length - 1]) + 1);
        } else {
            return 1;
        }
    } else {
        return 1;
    }
};

onBeforeMount(async () => {

    if (props.id) {
              const ret = await useCustomFetch('financeiroPlanoConta/getPopulate', 'post', { filtro: { _id: props.id }, populateObj: ['financeiroPlanoContaPai'] }, undefined);
        if (ret.valido) {
            financeiroPlanoConta.value = ret.data[0];
            if (props.copia) {
                financeiroPlanoConta.value.descricao = financeiroPlanoConta.value.descricao + " (Cópia)";
                financeiroPlanoConta.value._id = undefined;
                financeiroPlanoConta.value.__v = undefined;
                inserir.value = true;
            } else {
                inserir.value = false;
            }
        } else {
            setTimeout(async () => {
                await cancel();
            }, 1);
        }
    } else {
        // console.log('props.nodePai', props.nodePai);
        financeiroPlanoConta.value =
        {
            entidade: geral.entidade._id,
            tipo: props.nodePai.plano.tipo,
            especificacao: 'Analítica',
            identificador: props.nodePai.plano.identificador + '.' + getSequencia(),
            financeiroPlanoContaPai: props.nodePai.plano // tem que ser um objeto para ser usar no field
        };

        inserir.value = true;
    }
});

const inserirContato = () => {
    for (let index = 0; financeiroPlanoConta.value.contatos.length > index; index++) {
        financeiroPlanoConta.value.contatos[index].open = false;
    }
    financeiroPlanoConta.value.contatos.push({
        nome: '',
        telefone: '',
        email: '',
        funcao: '',
        open: true
    });
};

const excluirContato = (index: number) => {
    financeiroPlanoConta.value.contatos.splice(index, 1);
};

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

    let url = "financeiroPlanoConta";
    let tipo = "post";
    if (!inserir.value) {
        url += "/" + props.id;
        tipo = "put";
    }
    // const ret = await this.$geralService.comunicaAsync(url, tipo, this.financeiroPlanoConta, "salvar financeiroPlanoConta");
    const ret: any = await useCustomFetch(url, tipo, financeiroPlanoConta.value, undefined);
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

