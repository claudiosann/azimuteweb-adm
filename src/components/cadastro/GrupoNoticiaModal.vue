<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon name="fa-solid fa-newspaper" size="30px" />
          <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Grupo de Notícia</q-toolbar-title>
          <!-- GO btnSave -->
          <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive"
            aria-label="Salvarmargin-extra - " @click="save" :label="$q.screen.gt.xs ? 'Salvar' : undefined"
            icon="save"></q-btn>
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
            :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <div class="row q-ma-sm q-col-gutter-sm">
                  <div class="col-6">
                      <q-input hide-bottom-space outlined v-model="noticiaGrupo.descricao" label="Descrição" :dense="dense" @blur="$v.descricao.$touch" :error="$v.descricao.$error" error-message="Campo obrigatório" />
                  </div>
                  <div class="col-6">
                      <q-field hide-bottom-space outlined :dense="dense" @blur="$v.cor.$touch" :error="$v.cor.$error" error-message="Campo obrigatório">
                          <template v-slot:control>
                            <div class="col-12 p-2 rounded-lg" :style="{ 'background-color': noticiaGrupo.cor, color: invertColor(noticiaGrupo.cor) }"> {{ noticiaGrupo.cor }} </div>
                          </template>
                          <template v-slot:append>
                            <q-avatar class="cursor-pointer" :style="{ 'background-color': noticiaGrupo.cor, color: invertColor(noticiaGrupo.cor) }" rounded size="30px" font-size="25px"  icon="colorize">
                                                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                        <q-color v-model="noticiaGrupo.cor" />
                                    </q-popup-proxy>

                            </q-avatar>

                          </template>
                      </q-field>
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

const geral = useGeral();


const props = defineProps({
  id: { type: String, default: null },
  copia: null,
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// GO data
const noticiaGrupo: any = ref({ descricao: "", cor: "", entidade: geral.entidade._id });
const dense = ref(false);
const $q = useQuasar();


// GO valida
const validations = {
   descricao: {
    required
  },
  cor: {
    required
  },
  entidade: {
    required
  }
};

const $v = useVuelidate(validations, noticiaGrupo);

const inserir = ref(true);

onBeforeMount(async () => {
  if (props.id) {
    const ret: any = await useCustomFetch("noticiaGrupo/" + props.id, "get", undefined, undefined);
    if (ret.valido) {
      noticiaGrupo.value = ret.data;
      if (props.copia) {
        noticiaGrupo.value.descricao = noticiaGrupo.value.descricao + " (Cópia)";
        noticiaGrupo.value._id = undefined;
        noticiaGrupo.value.__v = undefined;
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

const invertColor = (hexTripletColor: any) => {
  if(!hexTripletColor) return '#7d7d7d';
        let color = hexTripletColor;
        color = color.substring(1); // remove #
        color = parseInt(color, 16); // convert to integer
        color = 0xFFFFFF ^ color; // invert three bytes
        color = color.toString(16); // convert to hex
        color = ("000000" + color).slice(-6); // pad with leading zeros
        color = "#" + color; // prepend #
        return color;
}

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

  let url = "noticiaGrupo";
  let tipo = "post";
  if (!inserir.value) {
    url += "/" + props.id;
    tipo = "put";
  }
  // const ret = await this.$geralService.comunicaAsync(url, tipo, this.noticiaGrupo, "salvar noticiaGrupo");
  const ret: any = await useCustomFetch(url, tipo, noticiaGrupo.value, undefined);
  if (ret.valido) {
    onDialogOK(ret.data);
    $q.notify({
      type: "positive",
      message: "Registro salvo com sucesso!",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "Falha ao salvar",
    });
  }
};
</script>

