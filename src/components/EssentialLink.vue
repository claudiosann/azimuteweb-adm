<script setup lang="ts">
export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
  color?: string;
  target?: string;
}

withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  color: 'bg-gradient-to-r from-blue-400 to-blue-700 ',
  link: '#',
  icon: '',
});

</script>
<template>

  <q-item class="pl-2!" v-bind="$attrs" clickable tag="NuxtLink" :target="target" :href="target?link:undefined" :to="(!target)?link:undefined">
    <q-item-section v-if="icon" avatar class="pr-none!" style="min-width: 45px !important;">
      <q-avatar rounded size="35px" font-size="25px" :class="color" text-color="white" :icon="icon" />

    </q-item-section>

    <q-item-section>
      <q-item-label class="text-weight-medium">{{ title }}</q-item-label>
      <q-item-label class="text-caption">
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
  
</template>
