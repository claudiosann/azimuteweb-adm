<template>
    <div class="flex flex-row justify-center">
        <q-table class="basis-full lg:basis-8/12" title="Treats" :rows="rows" :columns="columns" :pagination="pagination"
            row-key="name">
            <template v-slot:top>
                <q-toolbar class="p-none rounded-tl-lg  rounded-tr-lg" :glossy="true"
                    :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
                    <q-icon class="ml-3 p-1 " name="group" size="30px" />
                    <q-toolbar-title><span class="mr-3 text-weight-medium">Administradores</span>
                        <q-btn class="btn-scale m-2" push glossy round size="sm"
                            aria-label="Menu Sistema" icon="question_mark">
                            <q-popup-proxy>
            <q-banner>
              <template v-slot:avatar>
                <q-icon name="info" color="primary" />
              </template>
             Quem pode alterar ou auditar a votação.
            </q-banner>
          </q-popup-proxy>

                            
                        </q-btn></q-toolbar-title>
                    <q-btn @click="addRow" class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Inserir"
                        aria-label="Menu Sistema" icon="add">
                        <q-tooltip>Inserir Novo Registro</q-tooltip>
                    </q-btn>
                </q-toolbar>

            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                     <q-td key="pessoa.nome">
                        <q-field outlined label="Pessoa" hide-bottom-space :ref="'pessoas' + props.rowIndex + '.pessoa'" stack-label :dense="false" :error="!props.row.pessoa">
                                  <!-- <template v-if="vinculo.pessoa && vinculo.pessoa.foto" v-slot:prepend>
                                                                    <q-avatar size="50px">
                                                                        <q-img :src="getUrlImagemThumb(vinculo.pessoa.foto, 128)"></q-img>
                                                                    </q-avatar>
                                                                </template> -->
                                  <template v-slot:control>
                                    <div class="self-center full-width no-outline" tabindex="0">
                                      <span v-if="props.row.pessoa">{{ `${props.row.pessoa.nome}${props.row.pessoa.nome !== props.row.pessoa.apelido ? ` (${props.row.pessoa.apelido})` : ""}` }}</span>
                                    </div>
                                  </template>
                                  <template v-slot:append>
                                    <q-btn
                                    :disabled="!props.row.edit"
                                      color="primary"
                                      @click="localizarPessoa(props.rowIndex)"
                                      icon="search"
                                      round
                                    >
                                      <q-tooltip>Localizar Pessoa</q-tooltip>
                                    </q-btn>
                                  </template>
                                </q-field>

                    </q-td>
                    <q-td style="width: 120px;" key="funcaoVotacao">
                        <q-select :readonly="!props.row.edit" dense outlined multiple use-chips map-options option-label="descricao"  v-model="props.row.funcaoVotacao"
                            :options="listaFuncoes" label="Função" />
                        
                    </q-td>
                    <q-td style="width: 92px;" key="action">
                        <span v-if="props.rowIndex !== 0">
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
import BuscarPessoa from "@/components/BuscarPessoa.vue";
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
});

const listaFuncoes = [
    { id: 1, descricao: 'Consultar' },
    { id: 2, descricao: 'Editar' },
    { id: 3, descricao: 'Auditar' },
];

const emit = defineEmits(["update:modelValue", "onExcluir"]);

const ultimaBusca = ref(0);



const confirmSelecaoAdm = (pessoa: any, index: number) => {
    if (pessoa) {
        rows.value[index].pessoa = pessoa;
   }
};
const localizarPessoa = (index: number) => {
  $q.dialog({
    component: BuscarPessoa,
    persistent: true,
    componentProps: {},
  })
    .onOk(async (data) => {
      confirmSelecaoAdm(data, index);
    })
    .onCancel(() => {});
};


const columns: any = [
    { name: 'pessoa.nome', align: 'left', label: 'Nome', field: 'pessoa.nome', sortable: true },
    { name: 'funcaoVotacao', align: 'left', label: 'Função', field: 'funcaoVotacao', sortable: true },
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

const addRow = async () => {
    ultimaBusca.value = 0;
    rows.value.push({
        _id: await $geralService.getId(),
        pessoa: null,
        edit: true,
         funcaoVotacao: [{ id: 1, descricao: 'Consultar' }],
    });
    emit("update:modelValue", props.modelValue);
    localizarPessoa(rows.value.length - 1);
};

const removeRow = (index: number) => {
    emit("onExcluir", 'administradores', index);
};

const editRow = (index: number) => {
     if (!rows.value[index].pessoa || rows.value[index].peso<1) {
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
    ultimaBusca.value = 0;
};

</script>
<style scoped></style>