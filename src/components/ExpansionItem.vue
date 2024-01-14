<template>
  <q-expansion-item
            v-bind="$attrs"
            :class="classDefault"
            class="rou"
            :header-class="classHeader"
            :group="group" v-model="expanded">
            <template v-slot:header>
                <q-item-section>
                    <div class="text-bold">
                        <span>
                        <q-icon v-if="icon" :name="icon" size="25px" class="mr-2"/> {{ titulo ? titulo : "(indefinido)" }} </span> 
                        <q-badge class="ml-1" align="top" v-if="erroPadrao" color="red" label="Incompleto" />
                    </div>
                </q-item-section>
            </template>
             <div :class="classContent">
                <slot></slot>
             </div>
             </q-expansion-item>

</template>

<script setup lang="ts">
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    erroPadrao: {
        type: Boolean,
        default: false,
    },
    spaced: {
        type: Boolean,
        default: true,
    },
    rounded: {
        type: Boolean,
        default: false,
    },
    roundedSize: {
        type: String,
        default: 'lg',
    },
    titulo: {
        type: String,
        default: '',
    },
     tailwindCor: {
        type: String,
        default: 'gray-500',
    },
    group: {
        type: String,
        default: 'grupoExpansao',
    },
    icon: {
        type: String,
        default: '',
    },
});
const emit = defineEmits(["update:modelValue"]);

const expanded: any = computed({
    get() {
        return props.modelValue ? true : false;
    },
    set(value) {
        emit("update:modelValue", value ? true : false);
    },
});

const classContent= computed(() => {
    return `q-pa-md bg-${props.tailwindCor} bg-opacity-10 ${props.rounded ? `rounded-lb-${props.roundedSize} rounded-rb-${props.roundedSize}`:''}`;
});
const classHeader = computed(() => {
    return (expanded.value ? `rounded-bl-none rounded-bl-none ${props.rounded ? `rounded-tl-${props.roundedSize} rounded-tr-${props.roundedSize}`: '' }  bg-${props.tailwindCor} bg-opacity-10!` : `${props.rounded?('rounded-'+props.roundedSize):''} bg-${props.tailwindCor} bg-opacity-20`) + (props.erroPadrao ? ' text-negative' : '');
});
const classDefault = computed(() => {
    return (props.rounded ? `rounded-${props.roundedSize}` : ``);
});

</script>

<style scoped lang="scss">
</style>
