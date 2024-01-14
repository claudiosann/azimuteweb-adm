<template>
    <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
        <q-card :style="{ 'max-height': '100vh' }">
             <!-- GO toolbar -->
            <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
              <q-icon name="image" size="30px" />
              <q-toolbar-title>Upload de Imagem</q-toolbar-title>
              <!-- GO btnSave -->
              <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="onDialogCancel" :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
            </q-toolbar>
             <q-card-section :style="{ 'max-height': 'calc(100vh - 80   px)' }">
                <cropper :style="{ 'max-height': 'calc(100vh - 300px)' }"  ref="crop" :src="image.src" backgroundClass="alpha-bg" :stencil-props="{
                    aspectRatio: winit / hinit,
                }"
               
                   :canvas="{
                       height: hinit,
                       width: winit
                   }"
                
                @change="change" />
              
            </q-card-section>
            <!-- <div class="row">
                <div class="col-12 col-sm-8">
                                            <q-field outlined label="Zoom" :ref="'entidadeResponsavel'" stack-label>
                                                <template v-slot:control>
                                                    <div class="self-center full-width no-outline" tabindex="0">
                                                        <q-slider @change="onZoom" :min="0" :max="1" :step=".001" v-model="zoom" style="height:25px;" label snap />
                                                    </div>
                                                </template>
                                            </q-field>
                                        </div>
            </div> -->
              <div class="row gap-2 full-width flex justify-center">
                        <q-btn push h-11 color="brown" @click="flip(false, true)" label="Flip Y" />
                        <q-btn h-11 push color="brown" @click="flip(true, false)" label="Flip X" />
                        <q-btn h-11 push color="teal" @click="rotate(90)" label="Girar" />
                        <q-btn h-11 push color="amber" @click="zoom(0.5)" label="-" />
                        <q-btn h-11 push color="amber" @click="zoom(2)" label="+" />
                        <q-btn h-11 push color="purple" @click="file.click()" label="Upload">
                         <input
                            class="hidden"
                            type="file"
                            ref="file"
                            @change="uploadImage($event)"
                            accept="image/*"
                            />
                        </q-btn>
                        <q-btn h-11 push color="primary"
                            label="Confirmar" @click="confirmar" />
                        
                    </div>

        </q-card>
    </q-dialog>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useDialogPluginComponent } from 'quasar';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { saveAs } from 'file-saver';

const geral = useGeral();
const { $geralService } = useNuxtApp();
const props = defineProps({
    winit: { type: Number, default: 1200 },
    hinit: { type: Number, default: 630 }
});

const cropImg = ref('');
const file = ref();

const fileName = ref('');
const crop = ref(null);
const image = reactive({
    src:
        $geralService.getUrlS3(geral.entidade.logo),
    type: "image/jpg",
});



const $q = useQuasar();

defineEmits([
    ...useDialogPluginComponent.emits,
])
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const change = ({ coordinates, canvas }) => {
    console.log(coordinates);
    cropImg.value = canvas.toDataURL();
    // if (crop.value) {
    //     const { coordinates, imageSize } = crop.value;
    //     if (
    //         imageSize.width / imageSize.height >
    //         coordinates.width / coordinates.height
    //     ) {
    //         // Determine the position of slider bullet
    //         // It's 0 if the stencil has the maximum size and it's 1 if the has the minimum size
    //         zoom.value =
    //             (crop.value.imageSize.height - crop.value.coordinates.height) /
    //             (crop.value.imageSize.height - crop.value.sizeRestrictions.minHeight);
    //     } else {
    //         zoom.value =
    //             (crop.value.imageSize.width - crop.value.coordinates.width) /
    //             (crop.value.imageSize.width - crop.value.sizeRestrictions.minWidth);
    //     }
    // }
    // console.log(zoom.value);
}

const flip = (x, y) => {
    const { image } = crop.value.getResult();
    if (image.transforms.rotate % 180 !== 0) {
        crop.value.flip(!x, !y);cancel
    } else {
       crop.value.flip(x, y);
    }
}

const zoom = (fator) => {

        crop.value.zoom(
            fator
        );
    
}
  

const rotate = (angle) => {
    crop.value.rotate(angle);
}
const uploadImage = (event) => {
    /// Reference to the DOM input element
    const { files } = event.target;
    // Ensure that you have a file before attempting to read it
    if (files && files[0]) {
        // 1. Revoke the object URL, to allow the garbage collector to destroy the uploaded before file
        if (image.src) {
            URL.revokeObjectURL(image.src);
        }
        // 2. Create the blob link to the file to optimize performance:
        const blob = URL.createObjectURL(files[0]);

        // 3. Update the image. The type will be derived from the extension and it can lead to an incorrect result:
        image.src = blob;
        image.type = files[0].type;
        fileName.value = files[0].name;
    }
};

const confirmar = () => {
    const { coordinates, canvas, } = crop.value.getResult();
    canvas.toBlob((blob) => {
        saveAs(blob, fileName.value);
    }, image.type, 0.90);
     onDialogOK({ data: canvas.toDataURL(), fileName: fileName.value });
}

</script>

<style lang="scss">

.vue-advanced-cropper__stretcher {
     height: calc(100vh - 200px) !important;
}

.alpha-bg {
background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC")
}
</style>
