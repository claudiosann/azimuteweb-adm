<template>
    <div v-if="$v">
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card>
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon name="123" size="30px" />
                    <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Modelo de Pontuação</q-toolbar-title>
                    <!-- GO btnSave -->
                    <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
                        aria-label="Salvarmargin-extra - " @click="save" :label="$q.screen.gt.xs ? 'Salvar' : undefined"
                        icon="save"></q-btn>
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
                    <div class="row mb-3">
                        <div class="col-sm-6 col-12">
                            <q-input hide-bottom-space outlined v-model="state.modeloPontuacao.descricao" label="Descrição"
                                @blur="$v.modeloPontuacao.descricao.$touch" :error="$v.modeloPontuacao.descricao.$error"
                                error-message="Campo obrigatório" />
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-sm-6 col-12">
                            <q-input type="number" hide-bottom-space outlined
                                v-model="state.modeloPontuacao.pontuacaoMinima" label="Pontuação Mínima"
                                @blur="$v.modeloPontuacao.pontuacaoMinima.$touch"
                                :error="$v.modeloPontuacao.pontuacaoMinima.$error" error-message="Campo obrigatório" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-6 col-12">
                            <q-markup-table flat bordered>
                                <thead class="">
                                    <tr>
                                        <th colspan="14">
                                            <div class="row no-wrap items-center">
                                                <q-btn class="q-ml-sm" color="primary" label="Inserir" icon="add"
                                                    @click="addTabela">
                                                    <q-tooltip>
                                                        Inserir Registro
                                                    </q-tooltip>
                                                </q-btn>
                                            </div>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th class="text-left"></th>
                                        <th class="text-left">Colocação</th>
                                        <th class="text-left">Pontuação</th>
                                        <th class="text-right"><span mr-2>Excluir</span></th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in state.modeloPontuacao.tabela" :key="index"
                                        :class="{ 'az-tipo-menu': item.items }">
                                        <td draggable="true" @dragover="(e) => onDragOver(item, index, e)"
                                            @dragend="(e) => finishDrag(state.modeloPontuacao.tabela, item, index, e)"
                                            @dragstart="(e) => startDrag(item, index, e)" class="text-right"
                                            style="width:55px;">
                                            <q-btn :tabindex="-1" btn-scale push round glossy class="q-mr-xs"
                                                icon="swap_vert" />
                                        </td>

                                        <td class="text-left tddif">
                                            <q-input type="number" dense outlined :min="1" v-model="item.colocacao"
                                                :error="$v.modeloPontuacao.tabela.$each.$response.$errors[index].colocacao && $v.modeloPontuacao.tabela.$each.$response.$errors[index].colocacao.length > 0"
                                                hide-bottom-space />
                                        </td>
                                        <td class="text-left tddif">
                                            <q-input type="number" dense :min="1" outlined v-model="item.pontuacao"
                                                :error="$v.modeloPontuacao.tabela.$each.$response.$errors[index].pontuacao && $v.modeloPontuacao.tabela.$each.$response.$errors[index].pontuacao.length > 0"
                                                hide-bottom-space />
                                        </td>

                                        <td class="text-right" style="width:55px;">
                                            <q-btn class="mr-1" push round glossy color="negative" icon="delete"
                                                @click="state.modeloPontuacao.tabela.splice(index, 1)" />
                                        </td>
                                    </tr>
                                </tbody>
                            </q-markup-table>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { reactive } from 'vue';

const props = defineProps({
    id: { type: String, default: null },
    copia: null,
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const state: any = reactive({ modeloPontuacao: {} });
const $q = useQuasar();

const over = ref<any>({});
const startLoc = ref(0);
const dragging = ref(false);
const dragFrom = ref({});
const startDrag = (item: any, i: any, e: any) => {
    startLoc.value = e.clientY;
    dragging.value = true;
    dragFrom.value = item;
};
const finishDrag = (lista: any, item: any, pos: number, e: any) => {
    lista.splice(pos, 1)
    lista.splice(over.value.pos, 0, item);
    over.value = {}
};
const onDragOver = (item: any, pos: number, e: any) => {
    const dir = (startLoc.value < e.clientY) ? 'down' : 'up';
    setTimeout(() => {
        over.value = { item, pos, dir };
    }, 50)
};


// GO valida
const validations = {
    modeloPontuacao: {
        pontuacaoMinima: {
            required
        },
        descricao: {
            required
        },
        tabela: {
            $each: helpers.forEach({
                colocacao: { required },
                pontuacao: { required },
            })
        }
    }
};

const $v = useVuelidate(validations, state);

const inserir = ref(true);

const addTabela = () => {

    let colocacao = null;
    let pontuacao = null;
    if ($v.value.modeloPontuacao.tabela.$model.length > 0) {
        if ($v.value.modeloPontuacao.tabela.$model[$v.value.modeloPontuacao.tabela.$model.length - 1].colocacao) {
            colocacao = $v.value.modeloPontuacao.tabela.$model[$v.value.modeloPontuacao.tabela.$model.length - 1].colocacao + 1;
        }
    }
    if ($v.value.modeloPontuacao.tabela.$model.length > 1) {
        let pontuacaoUltimo = $v.value.modeloPontuacao.tabela.$model[$v.value.modeloPontuacao.tabela.$model.length - 1].pontuacao;
        let pontuacaoPenultimo = $v.value.modeloPontuacao.tabela.$model[$v.value.modeloPontuacao.tabela.$model.length - 2].pontuacao;
        if(pontuacaoUltimo && pontuacaoPenultimo){
            pontuacao = pontuacaoUltimo - (pontuacaoPenultimo - pontuacaoUltimo);
        }
        if (pontuacao && pontuacao < state.modeloPontuacao.pontuacaoMinima) {
             $q.notify({
                color: "warning",
                position: "top",
                icon: "warning",
                message: "Não é possível inserir!",
                caption: "Já chegou na pontuação mínima.",
            });
            return;
        }
    }

    $v.value.modeloPontuacao.tabela.$model.push({
        descricao: '', maximoParticipantes: 1, idadeMinima: 0, idadeMaxima: 120,
        'colocacao': colocacao,
        'pontuacao': pontuacao,
    });
}

onBeforeMount(async () => {
    if (props.id) {
        const ret: any = await useCustomFetch("modeloPontuacao/" + props.id, "get", undefined, undefined);
        if (ret.valido) {
            state.modeloPontuacao = JSON.parse(JSON.stringify(ret.data));
            if (props.copia) {
                state.modeloPontuacao.descricao = state.modeloPontuacao.descricao + " (Cópia)";
                state.modeloPontuacao._id = undefined;
                state.modeloPontuacao.__v = undefined;
                inserir.value = true;
            } else {
                inserir.value = false;
            }
        } else {
            setTimeout(async () => {
                await cancel();
                // navigateTo('/login');
            }, 1);
        }
    } else {
        state.modeloPontuacao = { descricao: "", pontuacaoMinima: 1, tabela: [] };
        inserir.value = true;
    }

});

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
    // console.log($v.value.modeloPontuacao);
    $v.value.modeloPontuacao.$touch();

    if ($v.value.modeloPontuacao.$error) {
        $q.notify({
            color: "warning",
            position: "top",
            icon: "warning",
            message: "Não é possível salvar!",
            caption: "Preencha todos os campos obrigatórios.",
        });
        return;
    }

    let url = "modeloPontuacao";
    let tipo = "post";
    if (!inserir.value) {
        url += "/" + props.id;
        tipo = "put";
    }
    // const ret = await this.$geralService.comunicaAsync(url, tipo, this.modeloPontuacao, "salvar modeloPontuacao");
    const ret: any = await useCustomFetch(url, tipo, state.modeloPontuacao, undefined);
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

<style lang="scss" scoped>
td,
th {
    padding: 0px 5px 0px 0px !important;
}

.tddif {
    width: 80px !important;
    width: 80px !important;
}</style>