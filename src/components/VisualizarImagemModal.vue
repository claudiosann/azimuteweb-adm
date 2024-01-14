<template>
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
        <q-card>
            <!-- GO toolbar -->
            <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">

                <q-toolbar-title>
                    <q-item>
                        <q-item-section>
                            <q-item-label caption>
                                <div class="flex justify-center gap-1 md:gap-8">
                                   {{ getNomeKey(caminho) }}
                                </div>
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-toolbar-title>
                <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                    :label="$q.screen.gt.xs ? 'Voltar' : undefined" color="red" icon="close" />
            </q-toolbar>
            <div :style="{ 'max-height': 'calc(100vh - 52px)', }" class="scroll">
                <div class="">
                    <img :src="caminho" class="w-full" />
                </div>
            </div>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>

import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';


const props = defineProps({
    caminho: null,
});

const $q = useQuasar();


const getNomeKey = (caminho: string) => {
    const array = caminho.split('/');
    return array[array.length - 1];
}

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();


onMounted(async () => {
    
});

const cancel = async () => {
    onDialogCancel();
    return;
};


</script>

