<template>
  <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
    <q-card :style="{ 'max-height': '100vh' }">
      <!-- GO toolbar -->
      <q-toolbar :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
        <q-icon name="image" size="30px" />
        <q-toolbar-title>Seletor de Imagem</q-toolbar-title>
        <!-- GO btnSave -->
        <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="onDialogCancel" :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
      </q-toolbar>
      <div v-if="image.src" :style="{ 'max-height': 'calc(100vh - 80   px)' }">
        <!-- <cropper  :style="{ 'max-height': 'calc(100vh - 300px)' }"  ref="crop" :src="image.src" backgroundClass="alpha-bg" :stencil-props="{
                    aspectRatio: 1200 / 630,
                }"
                @change="change" /> -->

        <vue-cropper class="img-container" ref="cropper" :aspect-ratio="winit / hinit" :src="image.src" :modal="true" :movable="true" dragMode="move" :center="true" preview=".preview" />
      </div>

      <div class="row gap-2 full-width flex justify-center mt-2">
        <q-btn v-if="image.src" push h-11 color="brown" @click="flipY" label="Flip Y" />
        <q-btn v-if="image.src" h-11 push color="brown" @click="flipX" label="Flip X" />
        <q-btn v-if="image.src" h-11 push color="teal" @click="rotate(90)" label="Girar" />
        <q-btn v-if="image.src" h-11 push color="amber" @click="zoom(-0.01)" label="-" />
        <q-btn v-if="image.src" h-11 push color="amber" @click="zoom(0.01)" label="+" />
        <q-btn h-11 push color="purple" @click="file.click()" label="Escolher">
          <input class="hidden" type="file" ref="file" @change="setImage($event)" accept="image/*" />
        </q-btn>
        <q-btn v-if="image.src" h-11 ref="botaoEscolher" push color="primary" label="Confirmar" @click="confirmar()" />
        <q-avatar @click="setHex" class="cursor-pointer preview2" rounded :style="{ background: hex == '#ffffff00' ? undefined : hex }" size="30px" font-size="25px" text-color="white" icon="colorize">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-color v-model="hex" />
          </q-popup-proxy>
        </q-avatar>
      </div>
      <div class="row gap-2 full-width flex justify-center">
        <div class="preview2">
          <section class="preview-area">
            <div :style="{ background: hex }" class="preview"></div>
          </section>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useDialogPluginComponent } from "quasar";
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";
import { saveAs } from "file-saver";

const props = defineProps({
  winit: { type: Number, default: 1200 },
  hinit: { type: Number, default: 630 },
});

// const img = ref('https://images.unsplash.com/photo-1600984575359-310ae7b6bdf2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=80');
const file = ref();
const cropImg = ref("");
const hex = ref("#ffffff00");
const cropper = ref(null);
const image = reactive({
  // src:"https://images.unsplash.com/photo-1619737307100-55b82496fcda?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
  src: "",
  type: "image/jpg",
});

const $q = useQuasar();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const cropImage = () => {
  // get image data for post processing, e.g. upload or setting image src
  this.cropImg = cropper.value.getCroppedCanvas().toDataURL();
};
const setHex = () => {
   hex.value = hex.value == "#ffffff00" ? "#ffffffff" : hex.value;
};

const data = ref(null);
const sliderVal = ref(1);
const fileName = ref("");

const fx = ref(1);
const fy = ref(1);

const zoomTo = (value) => {
  cropper.value.zoomTo(value);
};

onMounted(() => {
  setTimeout(() => {
    file.value.click();
  }, 500);

  // console.log(props.winit);
  // console.log(props.hinit);
});

const flipX = () => {
  // console.log(cropper.value);
  fx.value = fx.value ? -fx.value : -1;
  cropper.value.scaleX(fx.value);
};
const flipY = () => {
  fy.value = fy.value ? -fy.value : -1;
  cropper.value.scaleY(fy.value);
};

const getCropBoxData = () => {
  data.value = JSON.stringify(cropper.value.getCropBoxData(), null, 4);
};
const getData = () => {
  data.value = JSON.stringify(cropper.value.getData(), null, 4);
};

const move = (offsetX, offsetY) => {
  cropper.value.move(offsetX, offsetY);
};

const reset = () => {
  cropper.value.reset();
};
const rotate = (deg) => {
  cropper.value.rotate(deg);
};

const setCropBoxData = () => {
  if (!data.value) return;
  cropper.value.setCropBoxData(JSON.parse(data.value));
};

const setData = () => {
  if (!data.value) return;
  cropper.value.setData(JSON.parse(data.value));
};

const setImage = (e) => {
  const file = e.target.files[0];

  if (file.type.indexOf("image/") === -1) {
    alert("Please select an image file");
    return;
  }

  if (typeof FileReader === "function") {
    const reader = new FileReader();

    reader.onload = (event) => {
      image.src = event.target.result;
      // rebuild cropperjs with the updated source
      try {
        cropper.value.replace(event.target.result);
      } catch (error) {}
    };

    reader.readAsDataURL(file);
    fx.value = 1;
    fy.value = 1;
    fileName.value = file.name;
  } else {
    alert("Sorry, FileReader API not supported");
  }
};

const showFileChooser = () => {
  file.click();
};

const zoom = (percent) => {
  cropper.value.relativeZoom(percent);
};

const dataURLtoBlob = (dataurl) => {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime,
  });
};

const confirmar = () => {
  cropper.value.getCroppedCanvas({ width: props.winit, height: props.hinit, fillColor: hex.value }).toBlob(
    (blob) => {
      // saveAs(blob, fileName.value);
      onDialogOK({ data: blob, fileName: fileName.value });
    },
    image.type,
    0.9
  );
};
</script>

<style lang="scss">
// .cropper-container {
//   width: 100% !important;
//   height: calc(80vh - 200px) !important;
// }

.preview-area {
  width: -1px;
}

.preview-area p {
  font-size: 1.25rem;
  margin: 0;
  margin-bottom: 1rem;
}

.preview-area p:last-of-type {
  margin-top: 1rem;
}

.preview {
  margin: 10px;
  width: 200px;
  height: 200px;
  overflow: hidden;
}
.preview2 {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC");
}

.img-container {
  max-height: 400px;
  min-height: 200px;
}

.img-container,
.img-preview {
  text-align: center;
  width: 100%;
}

.alpha-bg {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC");
}
</style>
