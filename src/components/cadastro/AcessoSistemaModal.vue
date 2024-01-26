<template>
  <div v-if="$v">
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
      <q-card>
        <!-- GO toolbar -->
        <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon name="badge" size="30px" />
          <q-toolbar-title>{{ inserir ? "Inserir - " : "Editar " }} Perfil de Acesso</q-toolbar-title>
          <!-- GO btnSave -->
          <q-btn push glossy :round="$q.screen.xs ? true : false" class="btn-scale mr-3" color="positive" aria-label="Salvar - " @click="save" :label="$q.screen.gt.xs ? 'Salvar' : undefined" icon="save"></q-btn>
          <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel" :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
        </q-toolbar>

        <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">
          <div class="q-ma-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-sm-6 col-md-6 col-12">
                <q-input type="text" hide-bottom-space outlined v-model="acessoSistema.descricao" label="Nome" :dense="dense" @blur="$v.descricao.$touch" :error="$v.descricao.$error" error-message="Campo obrigatório" />
              </div>
              <pre>{{ acessoSistema.funcoesSistema }}</pre>
              <div class="col-sm-6 col-md-6 col-12">
                <q-select hint="Digite o @ para filtrar por Grupo" hide-bottom-space outlined hide-selected v-model="acessoSistema.funcoesSistema" use-input @filter="filterFn" :options="funcoesSistemaFilter" label="Buscar Funções" :dense="dense" option-value="id" :emit-value="true" option-label="descricao" map-options @blur="$v.funcoesSistema.$touch" :error="$v.funcoesSistema.$error" error-message="Campo obrigatório" multiple stack-label>
                  <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                    <q-item v-bind="itemProps">
                      <div :class="getColorGrupo(opt.grupo.id)" class="mr-1 w-2 h-10 rounded-md"></div>

                      <q-item-section>
                        <q-item-section>
                          <q-item-label>
                            {{ opt.descricao }}
                          </q-item-label>
                          <q-item-label caption> @{{ opt.grupo.descricao }} </q-item-label>
                        </q-item-section>
                      </q-item-section>
                      <q-item-section side>
                        <q-toggle :model-value="selected" @update:model-value="toggleOption(opt)" />
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                  <template v-slot:append>
                    <q-btn size="sm" :round="funcoesSistema.length == funcoesSistemaFilter.length" glossy push class="mt-2 mr-4 btn-scale" v-if="acessoSistema.funcoesSistema.length < funcoesSistema.length" :color="funcoesSistema.length == funcoesSistemaFilter.length?'primary':'green'" icon="done_all" @click.stop.prevent="marcarTudo">
                      <q-tooltip>{{ funcoesSistema.length == funcoesSistemaFilter.length ? "Selecionar Tudo" : "Seleciona todo o resultado" }} </q-tooltip>
                    </q-btn>
                    <q-btn size="sm" :round="funcoesSistema.length == funcoesSistemaFilter.length" glossy push class="mt-2 btn-scale" v-if="acessoSistema.funcoesSistema.length > 0" :color="funcoesSistema.length == funcoesSistemaFilter.length ? 'negative' : 'purple'" icon="hide_source" @click.stop.prevent="desmarcarTudo">
                      <q-tooltip>
                        {{ funcoesSistema.length == funcoesSistemaFilter.length ? "Desmarca Tudo" : "Desmarca todo o resultado" }}
                      </q-tooltip>
                    </q-btn>
                  </template>
                </q-select>
              </div>
              <div class="col-12">
                <q-field outlined label="Funções Selecionadas" stack-label :error="$v.funcoesSistema.$error" error-message="Campo obrigatório">
                  <template v-slot:control>
                    <div class="self-center full-width no-outline pt-2" tabindex="0">
                      <div class="q-gutter-xs">
                        <q-chip
                          v-for="(item, index) in acessoSistema.funcoesSistema"
                          :key="index"
                          removable
                          @remove="
                            () => {
                              acessoSistema.funcoesSistema.splice(index, 1);
                            }
                          "
                          :class="getColorGrupo(funcoesSistema[item - 1].grupo.id)"
                          text-color="white"
                        >
                       
                       <span>{{ funcoesSistema[item - 1].descricao }} <q-badge outline>{{ funcoesSistema[item - 1].grupo.descricao }}</q-badge></span>
                       
                        </q-chip>
                      </div>
                    </div>
                  </template>
                </q-field>
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
import { required, email } from "@vuelidate/validators";
import constantes from "../../service/constantes";
import { useDialogPluginComponent, useQuasar } from 'quasar';

const props = defineProps({
  id: { type: String, default: null },
  copia: null,
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const geral = useGeral();
// GO data
const acessoSistema: any = ref({ descricao: "", funcoesSistema: [] });
const funcoesSistema: Array<any> = constantes.FUNCOES_SISTEMA;

for (let index = 0; index < funcoesSistema.length; index++) {
  const element = funcoesSistema[index];
  element.id = index + 1;
}
// console.log(funcoesSistema);
const funcoesSistemaFilter = ref(funcoesSistema);
const dense = ref(false);

const $q = useQuasar();

const getColorGrupo = (id: number) => {
  switch (id) {
    case 1:
      return "bg-red-700";
    case 2:
      return "bg-blue-700";
    case 3:
      return "bg-green-700";
    case 4:
      return "bg-violet-700";
    case 5:
      return "bg-orange-600";
    case 6:
      return "bg-teal-600";
    case 7:
      return "bg-fuchsia-600";
    default:
      break;
  }
};

// GO valida
const validations = {
  entidade: {
    required,
  },
  descricao: {
    required,
  },
  funcoesSistema: {
    required,
  }, 
};

const $v = useVuelidate(validations, acessoSistema);

const inserir = ref(true);

onBeforeMount(async () => {
  
   if (props.id) {
    const ret: any = await useCustomFetch("acessoSistema/" + props.id, "get", undefined, undefined);
    if (ret.valido) {
      acessoSistema.value = ret.data;
      if (props.copia) {
        acessoSistema.value.descricao = acessoSistema.value.descricao + " (Cópia)";
        acessoSistema.value._id = undefined;
        acessoSistema.value.__v = undefined;
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
    acessoSistema.value = {
      entidade: geral.entidade._id,
      funcoesSistema: [],
    };
    inserir.value = true;
  }
});

const marcarTudo = () => {
  funcoesSistemaFilter.value.forEach((element) => {
    let encontrou: boolean = false;

    for (let index = 0; index < acessoSistema.value.funcoesSistema.length; index++) {
      const element2 = acessoSistema.value.funcoesSistema[index];
      if (element2 === element.id) {
        encontrou = true;
        break;
      }
    }

    if (!encontrou) {
      acessoSistema.value.funcoesSistema.push(element.id);
    }
  });
};
const desmarcarTudo = () => {
  funcoesSistemaFilter.value.forEach((element) => {
    for (let index = 0; index < acessoSistema.value.funcoesSistema.length; index++) {
      const element2 = acessoSistema.value.funcoesSistema[index];
      if (element2 === element.id) {
        acessoSistema.value.funcoesSistema.splice(index, 1);
        break;
      }
    }
  });
};

const filterFn = (val: any, update: any) => {
  if (val === "") {
    update(() => {
      funcoesSistemaFilter.value = funcoesSistema;

      // here you have access to "ref" which
      // is the Vue reference of the QSelect
    });
    return;
  }

  update(() => {
    let needle = val.toLowerCase();

    if (needle.substring(0, 1) === "@") {
      if (needle.length > 1) {
        needle = needle.substring(1, needle.length);
        funcoesSistemaFilter.value = funcoesSistema.filter((v) => v.grupo.descricao.toLowerCase().indexOf(needle) > -1);
      } else {
        funcoesSistemaFilter.value = funcoesSistema;
      }
    } else {
      funcoesSistemaFilter.value = funcoesSistema.filter((v) => v.descricao.toLowerCase().indexOf(needle) > -1);
    }
  });
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

  let url = "acessoSistema";
  let tipo = "post";
  if (!inserir.value) {
    url += "/" + props.id;
    tipo = "put";
  }
  // const ret = await this.$geralService.comunicaAsync(url, tipo, this.acessoSistema, "salvar acessoSistema");
  const ret: any = await useCustomFetch(url, tipo, acessoSistema.value, undefined);
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

<style>
.titulo-nfe {
  margin-top: 20px;
  margin-bottom: 20px;
}

@media (max-width: 575px) {
  .margin-extra {
    margin-top: 20px;
  }
}

@media (min-width: 768px) {
  .titulo-nfe {
    padding-left: 15px;
  }
}

@media (min-width: 576px) {
  .titulo-nfe {
    padding-left: 10px;
  }
}
</style>
