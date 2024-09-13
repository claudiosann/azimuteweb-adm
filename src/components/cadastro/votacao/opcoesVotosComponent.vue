<template>
    <div class="flex flex-row justify-center">
        <q-table class="basis-full" title="Treats" :rows="rows" :columns="columns" :pagination="pagination" row-key="name">
            <template v-slot:top>
                <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
                    :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 " name="category" size="30px" />
                    <q-toolbar-title><span class="mr-3 text-weight-medium">Opções de Voto (Candidatos)</span></q-toolbar-title>
                    <q-btn @click="addRow" class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir"
                        aria-label="Menu Sistema" icon="add">
                        <q-tooltip>Inserir Novo Registro</q-tooltip>
                    </q-btn>
                </q-toolbar>

            </template>

            <template v-slot:body-cell="props">
                <q-td :style="{ width: props.col.name == 'action' ? '100px' : undefined }" :props="props">
                    <span v-if="props.col.name == 'action'">
                        <q-btn @click="editRow(props.rowIndex)" btn-scale push round glossy icon="edit" />
                        <q-btn class="ml-2" @click="removeRow(props.rowIndex)" btn-scale push round glossy icon="delete" />
                    </span>
                    <span v-else-if="props.col.name == 'disputas'">
                        <span v-for="(disputa, index) in props.value" :key="index">
                        <span v-for="(dp, index3) in listaDisputas" :key="index">
                            <q-chip v-if="dp._id == disputa">{{dp.descricao}}</q-chip>
                        </span>
                        </span>
                    </span>
                    <span v-else-if="props.col.name == 'corPadrao'">
                            <q-chip v-if="props.value" :style="{'background-color': props.value, color: 'white' }">{{props.value}}</q-chip>
                    </span>
                    <span v-else>{{ props.value }}</span>
                </q-td>
            </template>

            <!-- <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="descricao">
                            
                        </q-td>
                        <q-td style="width: 50px;" key="quantidade">
                            <q-input dense type="number" hide-bottom-space outlined v-model="props.row.quantidade" label="Quantidade"/>
                        </q-td>
                        <q-td style="width: 45px;" key="action">
                            <q-btn @click="removeRow(props.rowIndex)" btn-scale push round glossy icon="delete">
                            </q-btn>
                            
                        </q-td>
                    </q-tr>
                </template> -->
        </q-table>
        <q-dialog v-model="fixed" persistent>
            <q-card>
                <q-form @submit="confirmRow">
                <q-card-section>
                    <div class="text-h6">{{ selectedItemIndex > -1 ? 'Editar' : 'Inserir' }} Opção de Voto</div>
                </q-card-section>

                <q-separator />

                <q-card-section style="max-height: 50vh" class="scroll">
                    <div
          class="row q-col-gutter-sm">
                        <div class="col-12">
                            <q-input hide-bottom-space counter maxlength="150" outlined v-model="selectedItem.titulo"
                                label="Título" :rules="[val => !!val || '* Campo Obrigatório']" lazy-rules />
                        </div>
                        <div class="col-12">
                            <q-input hide-bottom-space counter maxlength="150" outlined v-model="selectedItem.subTitulo"
                                label="Sub Título" :rules="[val => !!val || '* Campo Obrigatório']" lazy-rules />
                        </div>
                        <div class="col-12">
                            <q-select hide-bottom-space outlined v-model="selectedItem.disputas" emit-value
                                option-label="descricao" map-options option-value="_id" use-chips multiple
                                :options="listaDisputas" label="Disputas" :rules="[val => !!val || '* Campo Obrigatório']" lazy-rules/>
                        </div>
                        <div class="col-12">
                        <q-field hide-bottom-space outlined stack-label label="Cor Padrão">
                              <template v-slot:control>
                                <div class="col-12 p-1 rounded-lg" :style="{ 'background-color': selectedItem.corPadrao, color: 'white' }"> {{ selectedItem.corPadrao }} </div>
                              </template>
                              <template v-slot:append>
                                <q-avatar class="cursor-pointer" rounded  size="30px" font-size="25px"   icon="colorize">
                                                     <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                    <q-color v-model="selectedItem.corPadrao" />
                                                </q-popup-proxy>               
                                </q-avatar>

                              </template>
                            

                          </q-field>
                        </div>
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" color="negative" v-close-popup />
                    <q-btn push glossy label="Salvar" type="submit" color="positive"/>
                </q-card-actions>
    </q-form>
            </q-card>
        </q-dialog>

    </div>
</template>

<script lang="ts" setup>

const { $geralService } = useNuxtApp();

const selectedItem = ref<any>(null);
const selectedItemIndex = ref(-1);

const props = defineProps({
    modelValue: {
        type: Array,
        default: [],
    },
    listaDisputas: {
        type: Array<any>,
        default: [],
    },
});

const pagination = ref({
    rowsPerPage: 0
})

const emit = defineEmits(["update:modelValue", "onExcluir"]);

const columns: any = [
    { name: 'imagemUrl', align: 'left', label: 'Imagem', field: 'imagemUrl', sortable: true },
    { name: 'titulo', align: 'left', label: 'Título', field: 'titulo', sortable: true },
    { name: 'subTitulo', align: 'left', label: 'Sub Título', field: 'subTitulo', sortable: true },
    { name: 'disputas', align: 'left', label: 'Disputas', field: 'disputas', sortable: true },
    { name: 'corPadrao', align: 'left', label: 'Cor Padrão', field: 'corPadrao', sortable: true },
    { name: 'cancelado', align: 'left', label: 'Desativado', field: 'cancelado', sortable: true },
    { name: "action", label: "Ação", align: "right", field: "", sortable: false }
];

const rows: any = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const fixed = ref(false);

const addRow = async () => {
    selectedItem.value = {
        _id: await $geralService.getId(),
        corPadrao: '#3355b5'
    };
    selectedItemIndex.value = -1;
    fixed.value = true;
};

const editRow = async (index: number) => {
    selectedItem.value = JSON.parse(JSON.stringify(rows.value[index]));
    selectedItemIndex.value = index;
    fixed.value = true;
};

const confirmRow = () => {
    if (selectedItemIndex.value == -1) {
        rows.value.push(selectedItem.value);
    } else {
        rows.value[selectedItemIndex.value] = selectedItem.value;
    }
    emit("update:modelValue", props.modelValue);
    fixed.value = false;
}

const removeRow = (index: number) => {
    emit("onExcluir", 'opcoesDeVoto', index);
};




</script>
<style scoped></style>