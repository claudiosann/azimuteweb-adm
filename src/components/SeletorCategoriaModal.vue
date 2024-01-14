<template>
    <q-dialog :persistent="true" ref="dialogRef" @hide="onDialogHide">
        <q-card style="min-width: 300px">
            <q-toolbar class="pr-1" :class="$q.dark.isActive ? 'text-grey-2 bg-black-8' : 'bg-grey-2 text-grey-9'">
                <q-toolbar-title><span class="text-weight-bold"></span> Selecionar Categorias</q-toolbar-title>
                <q-btn
              color="positive"
              aria-label="Confirmar - "
              style="margin-right: 15px;"
              @click="confirm"
              round glossy push class="btn-scale"
              icon="check"
            >
            <q-tooltip >
              Confirmar Seleção
            </q-tooltip>
          </q-btn>
                <q-btn round glossy push class="btn-scale" @click="cancel" color="red" icon="close" >
                   <q-tooltip >
                Cancelar
              </q-tooltip>
                </q-btn>
            </q-toolbar>

            <q-card-section>
               <q-field class="q-mb-sm" outlined stack-label label="Selecionadas">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">
                  <q-chip
                    v-for="(cat, index4) in getSelecionadas"
                    :key="index4"
                    removable
                    @remove="cat.selecionada = false"
                    color="primary"
                    text-color="white"
                  >{{ cat.descricao }}</q-chip>
                </div>
              </template>
            </q-field>
            <q-input
              class="q-mb-md"
              outlined
              autofocus
              hint="Digite para filtrar"
              label="Filtro"
              v-model="filtro"
            >
            </q-input>
            <q-list
              class="rounded-borders"
              separator
              bordered
              v-if="getFiltradas.length > 0"
              highlight
              inset-separator
            >
            <q-item-label
                                    :dense="true"
                                    header
                                    style="padding: 5px;"
                                  >
                                    Categorias (Clique para marcar / desmarcar)
                                  </q-item-label>
              <q-item
                :class="{ 'az-selecionado': categoria.selecionada }"
                clickable
                v-ripple
                @click="categoria.selecionada = !categoria.selecionada"
                v-for="categoria in getFiltradas"
                :key="categoria._id"
              >
                <q-item-section>
                  <q-item-label lines="1">{{ categoria.descricao }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div style="margin-top:5px;" v-if="getFiltradas.length === 0">Nenhum Resultado.</div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>

import { useQuasar } from "quasar";
import { useDialogPluginComponent } from 'quasar';

const props = defineProps({
     modeloCategoria: null,
    sexo: null,
    idade: null
});

const { $geralService } = useNuxtApp();
const $q = useQuasar();

const filtro = ref('');

defineEmits([
    ...useDialogPluginComponent.emits
])


const listaCategorias = ref([]);

onBeforeMount(async () => {
    listaCategorias.value = props.modeloCategoria.categorias.map((obj) => {
        return { descricao: obj.descricao, selecionada: false };
    });
});

const getFiltradas = computed(() => {
    return props.modeloCategoria
        ? listaCategorias.value.filter((obj) =>
            obj.descricao.includes(filtro.value)
        )
        : [];
});

const getSelecionadas = computed(() => {
    return props.modeloCategoria && listaCategorias.value
        ? listaCategorias.value.filter((obj) => obj.selecionada)
        : [];

});

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();


const cancel = async () => {
    onDialogCancel();
    return;
};

// GO confirm
const confirm = () => {
    onDialogOK(getSelecionadas.value);
};


</script>


