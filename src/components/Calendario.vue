<template>
  <div  :style="{ color: `${cor}` }">
    <svg
      :height="tamanho"
      :width="tamanho"
      viewBox="0 0 128 128"
      version="1.1"
      id="svg836"
    >
      <defs id="defs840" />
      <g id="g834" transform="translate(128.64,-0.64)">
        <path
          id="path1"
          transform="matrix(-4,0,0,4,0,5.4000015)"
          fill="currentColor"
          d="m 3.7999878,2.6999965 h 2.4000244 v 3.4000011 c 0,1 0.7999878,1.9000015 1.7999878,1.9000015 1,0 1.9000244,-0.800003 1.9000244,-1.9000015 V 2.6999965 H 22 v 3.4000011 c 0,1 0.799988,1.9000015 1.900024,1.9000015 1,0 1.899964,-0.800003 1.899964,-1.9000015 V 2.6999965 h 2.400024 C 30.299988,2.6999965 32,4.4000011 32,6.4999991 V 25.499997 C 32,27.600003 30.299988,29.3 28.200012,29.3 H 3.7999878 C 1.7000122,29.3 0,27.600003 0,25.499997 V 6.4999991 C 0,4.4000011 1.7000122,2.6999965 3.7999878,2.6999965 Z M 23.900024,0 c 0.5,-7.3009687e-8 0.899964,0.40000142 0.899964,0.90000154 V 5.4999991 c 0,0.5 -0.399964,0.9000015 -0.899964,0.9000015 C 23.400024,6.4000006 23,5.9999991 23,5.4999991 V 0.90000154 C 22.900024,0.40000142 23.400024,-7.3009687e-8 23.900024,0 Z M 8,0 C 8.5,-7.3009687e-8 8.9000244,0.40000142 8.9000244,0.90000154 V 5.4999991 C 8.9000244,5.9999991 8.5,6.4000006 8,6.4000006 7.4000244,6.4999991 7,6.0999976 7,5.5999976 V 0.90000154 C 7,0.40000142 7.4000244,-7.3009687e-8 8,0 Z"
        />
         <text
          xmlSpace="preserve"
          class="mes"
          x="-92.53023"
          y="60.786362"
          id="text21830"
        >
       
            {{getMes()}}
       
        </text>
        <text
          xmlSpace="preserve"
          class="dia"
          x="-95.202932"
          y="109.27296"
          id="text2872"
        >

            {{getDia()}}
   
        </text>
       
      </g>
    </svg>
  </div>
</template>

<script setup>
const { $geralService } = useNuxtApp()

const getDia = () => {
  return $geralService.getDia(props.isoData)
}
const getMes = () => {
return $geralService.mesExtenso(props.isoData).toLocaleUpperCase()
}
const props = defineProps({
isoData: String,
tamanho: String,
cor: String,
})
</script>

<style lang="scss" scoped>
.dia {
font-style: normal;
font-weight: 600;
font-size: 54px;
line-height: 1.25;
font-family: sans-serif;
fill: white;
fill-opacity: 1;
stroke: none;
stroke-width: 1.099;
}

.mes {
font-style: normal;
font-weight: normal;
font-size: 28px;
line-height: 1.25;
font-family: sans-serif;
fill: white;
fill-opacity: 1;
stroke: none;
stroke-width: 0.897141;
}
</style>