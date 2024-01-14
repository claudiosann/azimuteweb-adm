<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-orange-700 to-yellow-400"
                        name="account_balance" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Conta</q-toolbar-title>
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
                                <q-input hide-bottom-space outlined v-model="financeiroConta.descricao" label="Descrição"
                                    :dense="dense" :readonly="movimentado" @blur="$v.descricao.$touch"
                                    :error="$v.descricao.$error" error-message="Campo obrigatório" />
                            </div>
                            <div class="col-sm-4 col-md-4 col-12">
                                <q-select hide-bottom-space outlined v-model="financeiroConta.tipo" :options="tipoOld"
                                    label="Tipo" :dense="dense" :readonly="movimentado"
                                    @blur="$v.tipo.$touch" :error="$v.tipo.$error"
                                    error-message="Campo obrigatório" />
                            </div>
                            <div v-if="financeiroConta.tipo !== 'Caixa'" class="col-12">
                                <div class="q-col-gutter-sm row">
                                    <div class="col-xs-12 col-sm-4 col-md-4 col-12">
                                        <q-input hide-bottom-space outlined v-model="financeiroConta.banco" label="Banco"
                                            :dense="dense" />
                                    </div>
                                    <div class="col-xs-8 col-sm-2 col-md-3">
                                        <q-input type="number" hide-bottom-space outlined v-model="financeiroConta.agencia"
                                            label="Agência" :dense="dense" />
                                    </div>
                                    <div class="col-xs-4 col-sm-2 col-md-1">
                                        <q-input type="number" hide-bottom-space outlined v-model="financeiroConta.operacao"
                                            label="Op." :dense="dense" />
                                    </div>
                                    <div class="col-xs-12 col-sm-4 col-md-4 col-12">
                                        <q-input type="number" hide-bottom-space outlined v-model="financeiroConta.numero"
                                            label="Conta" :dense="dense" />
                                    </div>
                                    <div class="col-xs-12 col-sm-4 col-md-4 col-12">
                                        <q-select hide-bottom-space outlined v-model="financeiroConta.chavePixTipo" :options="['CNPJ/CPF', 'Celular', 'Aleatória']"
                                        label="Tipo ChavePix" :dense="dense"/>
                                    </div>
                                    <div class="col-xs-12 col-sm-4 col-md-4 col-12">
                                        <q-input maxlength="150" hide-bottom-space outlined v-model="financeiroConta.chavePix"
                                            label="Chave PIX" :dense="dense" />
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-8 col-md-8 col-12">
                                <q-input hide-bottom-space outlined v-model="financeiroConta.obs" label="Observação"
                                    :dense="dense" />
                            </div>
                            <div class="col-sm-4 col-md-4 col-12">
                                <q-field hide-bottom-space outlined label="Saldo" :dense="dense" stack-label>
                                    <template v-slot:control>
                                        <div class="self-center full-width no-outline" tabindex="0">{{
                                            financeiroConta.saldoAtual }}</div>
                                    </template>
                                </q-field>
                            </div>
                            <div class="col-12">
                                <q-list bordered class="rounded-borders">
                                    <q-item-label :dense="true" class="text-lg" style="padding: 5px;">Contatos
                                        <q-btn color="primary" @click="inserirContato" icon="add" round size="xs">
                                            <q-tooltip>Inserir Novo Contato</q-tooltip>
                                        </q-btn>
                                        <q-badge v-if="$v.contatos.$error" class="ml-3" color="red" label="incompleto" />
                                    </q-item-label>
                                    <div v-for="(contato, index) in financeiroConta.contatos" :key="index">
                                        <q-separator />
                                        <q-expansion-item group="contatosGroup" v-model="contato.open">
                                            <template v-slot:header>
                                                <q-item-section>
                                                    <q-item class="pl-0" dense>
                                                        <q-item-section>
                                                            {{ contato.nome }}
                                                        </q-item-section>
                                                    </q-item>
                                                </q-item-section>
                                            </template>
                                            <q-card class="col-sm-6 col-md-12 q-pa-sm">
                                                <!--contato inicio -->
                                                <div class="row q-col-gutter-sm">
                                                    <div class="col-sm-6 col-md-4 col-12">
                                                        <q-input hide-bottom-space outlined
                                                            :ref="'contatos' + index + '.nome'" v-model="contato.nome"
                                                            label="Nome" :dense="dense"
                                                            @blur="$v.contatos.$each.$response.$data[index].nome.$touch"
                                                            :error="$v.contatos.$each.$response.$data[index].nome.$error"
                                                            error-message="Campo obrigatório" />
                                                    </div>
                                                    <div class="col-sm-6 col-md-3 col-12">
                                                        <q-input hide-bottom-space outlined
                                                            :ref="'contatos' + index + '.telefone'"
                                                            v-model="contato.telefone" label="Telefone" :dense="dense"
                                                            unmasked-value
                                                            @blur="$v.contatos.$each.$response.$data[index].telefone.$touch"
                                                                :error="$v.contatos.$each.$response.$data[index].telefone.$error"
                                                                error-message="E-mail ou Telefone é obrigatório"
                                                            :mask="((contato.telefone) && financeiroConta.contatos[index].telefone.toString().length === 10) ? '(##) ####-#####' : '(##) #####-####'" />
                                                    </div>
                                                    <div class="col-sm-6 col-md-3 col-12">
                                                        <q-input  hide-bottom-space outlined
                                                            :ref="'contatos' + index + '.email'" v-model="contato.email"
                                                                   @blur="$v.contatos.$each.$response.$data[index].email.$touch"
                                                                    :error="$v.contatos.$each.$response.$data[index].email.$error"
                                                                    :error-message="!$v.contatos.$each.$response.$data[index].email.email ? 'E-mail inválido' :'E-mail ou Telefone é obrigatório'"
                                                            label="Email" :dense="dense" />
                                                    </div>
                                                    <div class="col-sm-6 col-md-2 col-12">
                                                        <q-input hide-bottom-space outlined
                                                            :ref="'contatos' + index + '.funcao'" v-model="contato.funcao"
                                                            label="Função" :dense="dense" />
                                                    </div>
                                                </div>
                                                <!-- contato fim -->
                                                <div class="col-12 q-mt-sm">
                                                    <q-btn color="red" outline @click="excluirContato(index)"
                                                        label="Excluir Contato" icon="delete">
                                                        <q-tooltip>Excluir Contato</q-tooltip>
                                                    </q-btn>
                                                </div>
                                            </q-card>
                                        </q-expansion-item>
                                    </div>
                                </q-list>
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
const financeiroConta: any = ref({
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
    tipo: {
        required
    },
    contatos: {
        $each: helpers.forEach({
            nome: {
                required
            },
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
        })
    }
};

const tipoOld = ['Caixa', 'Conta Corrente', 'Conta Poupança', 'Conta Investimento'];

const $v = useVuelidate(validations, financeiroConta);

const inserir = ref(true);

onBeforeMount(async () => {

    if (props.id) {
        const ret: any = await useCustomFetch("financeiroConta/" + props.id, "get", undefined, undefined);
        if (ret.valido) {
            financeiroConta.value = ret.data;
            if (props.copia) {
                financeiroConta.value.descricao = financeiroConta.value.descricao + " (Cópia)";
                financeiroConta.value._id = undefined;
                financeiroConta.value.__v = undefined;
                inserir.value = true;
            } else {
                inserir.value = false;
            }
        } else {
            console.log('passou aquidsdsdsds');
            setTimeout(async () => {
                await cancel();
                // navigateTo('/login');
            }, 1);
        }
    } else {
        inserir.value = true;
    }
});

const inserirContato = () => {
    for (let index = 0; financeiroConta.value.contatos.length > index; index++) {
        financeiroConta.value.contatos[index].open = false;
    }
    financeiroConta.value.contatos.push({
        nome: '',
        telefone: '',
        email: '',
        funcao: '',
        open: true
    });
};

const excluirContato = (index: number) => {
    financeiroConta.value.contatos.splice(index, 1);
};

const cancel = async () => {
    console.log('passou aquitttt');
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

    let url = "financeiroConta";
    let tipo = "post";
    if (!inserir.value) {
        url += "/" + props.id;
        tipo = "put";
    }
    // const ret = await this.$geralService.comunicaAsync(url, tipo, this.financeiroConta, "salvar financeiroConta");
    const ret: any = await useCustomFetch(url, tipo, financeiroConta.value, undefined);
    if (ret.valido) {
        onDialogOK(ret.data);
        $q.notify({
            type: "positive",
            message: "Registro salvo com sucesso!",
        });
    } else {
        console.log(ret);
        $q.notify({
            type: "negative",
            message: "Falha ao salvar",
        });
    }
};
</script>

