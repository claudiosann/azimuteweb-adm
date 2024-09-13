<template>
    <div class="flex flex-row justify-center" >
        <q-table class="basis-full lg:basis-7/12"  title="Treats"  :rows="rows" :columns="columns" :pagination="pagination" row-key="name" >
        <template v-slot:top>
                    <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
                        :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                        <q-icon class="ml-3 p-1 " name="list"
                            size="30px" />
                        <q-toolbar-title><span class="mr-3 text-weight-medium">Disputas (Cargos)</span></q-toolbar-title>
                        <q-btn @click="addRow" class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir"
                             aria-label="Menu Sistema" icon="add">
                            <q-tooltip>Inserir Novo Registro</q-tooltip>
                        </q-btn>
                    </q-toolbar>

         </template>
          <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="descricao">
                            <q-input :readonly="!props.row.edit" dense type="text" maxlength="100" hide-bottom-space outlined v-model="props.row.descricao" :error="!props.row.descricao" label="Nome"/>
                        </q-td>
                        <q-td style="width: 50px;" key="quantidade">
                            <q-input :readonly="!props.row.edit" dense type="number" hide-bottom-space outlined :min="1" v-model="props.row.quantidade" label="Qtde Escolha" :error="!props.row.quantidade"/>
                        </q-td>
                        <q-td style="width: 50px;" key="quantidadeElegivel">
                            <q-input :readonly="!props.row.edit" dense type="number" hide-bottom-space outlined :min="1" v-model="props.row.quantidadeElegivel" label="Qtde Elegível" :error="!props.row.quantidadeElegivel"/>
                        </q-td>
                        <q-td style="width: 45px;" key="action">
                            <span>
                                <q-btn class="mr-2" @click="editRow(props.rowIndex)" btn-scale push round glossy
                                    :icon="props.row.edit ? 'check' : 'edit'">
                                </q-btn>
                                <q-btn @click="removeRow(props.rowIndex)" btn-scale push round glossy icon="delete">
                                </q-btn>

                            </span>

                            
                        </q-td>
                    </q-tr>
                </template>
        </q-table>

    </div>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
const $q = useQuasar();


const { $geralService } = useNuxtApp();

const props = defineProps({
    modelValue: {
        type: Array,
        default: [],
    },
});

const pagination = ref({
    rowsPerPage: 0
})

const emit = defineEmits(["update:modelValue", "onExcluir"]);

const columns: any = [
    { name: 'descricao', align: 'left', label: 'Descrição', field: 'descricao', sortable: true },
    { name: 'quantidade', align: 'right', label: 'Qtde Escolha', field: 'quantidade', sortable: true },
    { name: 'quantidadeElegivel', align: 'right', label: 'Qtde Elegível', field: 'quantidadeElegivel', sortable: true },
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

const editRow = (index: number) => {
    if(rows.value[index].descricao == '' || rows.value[index].quantidade == 0){
        $q.notify({
            color: 'negative',
            message: 'Preencha todos os campos!',
            icon: 'report_problem',
            position: 'top',
            timeout: 2000
        });
        return;
    }
    rows.value[index].edit = !rows.value[index].edit;
};

const addRow = async () => {
    rows.value.push({
         _id: await $geralService.getId(),
        descricao: '',
        quantidade: 1,
        quantidadeElegivel: 1,
        edit: true
    });
     emit("update:modelValue", props.modelValue);
};

const removeRow = (index: number) => {
     emit("onExcluir", 'disputas', index);
};  

</script>
<style scoped></style>