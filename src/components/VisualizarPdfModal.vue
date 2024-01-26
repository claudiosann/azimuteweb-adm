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
                                    <span v-if="pages > 1">
                                        <q-btn icon="navigate_before" class="btn-scale mr-2" outline
                                            @click="page = page > 1 ? page - 1 : page">
                                        </q-btn>
                                        <span>{{ page }} / {{ pages }}</span>
                                        <q-btn icon="navigate_next" class="btn-scale ml-2" outline
                                            @click="page = page < pages ? page + 1 : page">
                                        </q-btn>
                                    </span>
                                    <span>
                                        <q-btn icon="zoom_out" class="btn-scale mr-2" outline @click="fitParentWidth(true)">

                                        </q-btn>
                                        <span>{{ getPercentual() }}%</span>
                                        <q-btn icon="zoom_in" class="btn-scale ml-2" outline @click="fitParentWidth()">

                                        </q-btn>
                                    </span>
                                    <!-- <span>
                                        <q-btn icon="zoom_out" class="btn-scale mr-2" outline
                                            @click="scale = scale > 0.25 ? scale - 0.25 : scale">

                                        </q-btn>
                                        <span>{{ scale * 100 }}%</span>
                                        <q-btn icon="zoom_in" class="btn-scale ml-2" outline
                                            @click="scale = scale < 3 ? scale + 0.25 : scale">

                                        </q-btn>
                                    </span> -->
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
                    <div class="bg-gray-500 border-red-500 p-1 flex mx-auto justify-items-center"
                        :style="`width: ${parentWidth}px`">
                        <VuePDF ref="vuePDFRef" :pdf="pdf" :page="page"  watermark-text="Válido somente na plataforma Azimute Certo" :scale="scale" fit-parent annotation-layer
                            :text-layer="text_layer" />
                    </div>
                </div>
                <!-- <div class="">
                    <div class="bg-gray-500 border-red-500 p-1"
                        >
                        <VuePDF ref="vuePDFRef" :pdf="pdf" :page="page" :scale="scale" annotation-layer
                            :text-layer="text_layer" />
                    </div>
                </div> -->
            </div>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';


const props = defineProps({
    caminho: null,
});

const page = ref(1)
const scale = ref(1)
const fator = 150;
const fatorUsado = ref(0)
const { pdf, pages } = usePDF(props.caminho)
const $q = useQuasar();
const text_layer = ref(true);
const vuePDFRef = ref<any>(null);
const inicio = ref($q.screen.width - 20)
const parentWidth = ref($q.screen.width - 20)

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const getPercentual = () => {
    let ret = fatorUsado.value / fator;
    return 100 + (ret * 15);
}

function fitParentWidth(negativo?: boolean) {
    let reload = false;
    // console.log('teste');

    if (negativo && fatorUsado.value >= (fator * -3)) {
        if ((parentWidth.value - fator) > 150) {
            fatorUsado.value -= fator;
            reload = true;
        }
    } else if (!negativo && fatorUsado.value <= (fator * 4)) {
        fatorUsado.value += fator;
        reload = true;
    }

    if (reload) {
        parentWidth.value = ($q.screen.width - 20) + fatorUsado.value
        if (vuePDFRef.value) {
            vuePDFRef.value.reload()
        }

    }

}


onMounted(async () => {
    // console.log(pdf);
});

const cancel = async () => {
    onDialogCancel();
    return;
};


</script>

