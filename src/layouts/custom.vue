<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" style="height: calc(100vh);">
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useDark } from "@vueuse/core";
import { useQuasar } from "quasar";

const $q = useQuasar();

const isDark = useDark({
  selector: "html",
  attribute: "class",
  valueDark: "dark",
  valueLight: "light",
});

onMounted(() => {
  $q.dark.set(isDark.value);
});
</script>
