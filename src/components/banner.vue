<template>
  <div :class="`m-2 rounded-lg shadow ${direction} ${from} ${to} ${padding}`">
    <div class="bg-white dark:!bg-gray-800 flex justify-between w-full h-full rounded-md p-2">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  from: { type: String, default: "from-yellow-300" },
  to: { type: String, default: "to-green-500" },
  direction: { type: String, default: "bg-gradient-to-br" },
  padding: { type: String, default: "pa-2" },
})


</script>
