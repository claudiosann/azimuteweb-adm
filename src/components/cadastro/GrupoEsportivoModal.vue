<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon name="scatter_plot" size="30px" />
          <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Grupo Esportivo</q-toolbar-title>
          <!-- GO btnSave -->
          <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
            aria-label="Salvarmargin-extra - " @click="save" :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
            :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <div class="q-ma-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input type="text" hide-bottom-space outlined v-model="grupoEsportivo.descricao" label="Nome"
                  :dense="dense" @blur="$v.descricao.$touch" :error="$v.descricao.$error"
                  error-message="Campo obrigatório" />
              </div>
              <div class="col-12">
                <q-input type="textarea" hide-bottom-space outlined v-model="grupoEsportivo.caracteristica" label="Característica"
                  :dense="dense" @blur="$v.caracteristica.$touch" :error="$v.caracteristica.$error"
                  error-message="Campo obrigatório" />
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
import { required } from "@vuelidate/validators";
import { useDialogPluginComponent, useQuasar } from 'quasar';

const props = defineProps({
  id: { type: String, default: null },
  copia: null,
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const grupoEsportivo: any = ref({ descricao: "", caracteristica: "" });
const dense = ref(false);
const $q = useQuasar();


// GO valida
const validations = {
  descricao: {
    required,
  },
  caracteristica: {
    required,
  },
};

const $v = useVuelidate(validations, grupoEsportivo);

const inserir = ref(true);

onBeforeMount(async () => {

  if (props.id) {
    const ret: any = await useCustomFetch("grupoEsportivo/" + props.id, "get", undefined, undefined);
    if (ret.valido) {
      grupoEsportivo.value = ret.data;
      if (props.copia) {
        grupoEsportivo.value.descricao = grupoEsportivo.value.descricao + " (Cópia)";
        grupoEsportivo.value._id = undefined;
        grupoEsportivo.value.__v = undefined;
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
    grupoEsportivo.value = {
    };
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

  let url = "grupoEsportivo";
  let tipo = "post";
  if (!inserir.value) {
    url += "/" + props.id;
    tipo = "put";
  }
  // const ret = await this.$geralService.comunicaAsync(url, tipo, this.grupoEsportivo, "salvar grupoEsportivo");
  const ret: any = await useCustomFetch(url, tipo, grupoEsportivo.value, undefined);
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

