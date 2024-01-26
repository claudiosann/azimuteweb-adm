<template>
    <div class="container mx-auto p-1 sm:p-2">
        <div class="q-ma-sm">
            <div class="text-xl mb-2">Importar Notas Fiscais</div>
            <div class="row q-col-gutter-md">

                <div class="col-12">
                    <q-select outlined v-model="empresasSelecionadas" :emit-value="true" map-options
                        option-label="nomeFantasia" :option-value="(obj) => obj" :options="empresas" multiple use-chips
                        label="Empresas" >
                     <template v-slot:after>
              <q-btn round dense flat icon="done_all" @click="()=>{empresasSelecionadas = empresas}" >
                <q-tooltip>Selecionar Todas as Empresa</q-tooltip>
              </q-btn>
            </template>
                    </q-select>
                </div>
                <div class="col-12 col-md-3 ">
                    <q-select outlined v-model="ano" option-label="label" map-options emit-value :options="anos"
                        label="Ano" />
                </div>
                <div class="col-12 col-md-3 ">
                    <q-select outlined v-model="mes" option-label="label" map-options emit-value :options="meses"
                        label="Mês" />
                </div>

                <div class="col-12">
                    <q-btn color="primary" icon="download" label="Baixar Arquivo das Notas" @click="download" />

                </div>
                <div class="col-12" v-if="retornoGerado.length > 0">
                    <q-field outlined label="Resumo" stack-label>
                        <q-list>
                            <q-item v-for="(item, index) in retornoGerado" :key="index">
                                <q-item-section>
                                    <q-item-label>{{ item.empresa.nomeRazao }} ({{ item.empresa.cnpj }})</q-item-label>
                                    <q-item-label :class="{ 'text-green-600!': item.valido, 'text-red-600!': !item.valido }"
                                        caption lines="2">{{ item.valido ? 'Gerado com sucesso!' : 'Nehum arquivo encontrado!' }}</q-item-label>
                                </q-item-section>
                                <q-item-section side top v-if="item.valido">
                                    <q-item-label caption>Notas {{ item.quantidade }}</q-item-label>

                                </q-item-section>
                            </q-item>
                        </q-list>

                    </q-field>
                </div>

            </div>






        </div>
    </div>
</template>

<script setup>
import JSZip from 'jszip';
// import JSZipUtils from 'jszip-utils';
import { saveAs } from 'file-saver';
import { useQuasar, QSpinnerOval } from "quasar";

const $q = useQuasar();
const mes = ref('01');
const ano = ref('23');
const empresasSelecionadas = ref([]);

const { $geralService } = useNuxtApp()

const retornoGerado = ref([]);
const meses = [
    { label: "Janeiro", value: '01' },
    { label: "Fevereiro", value: '02' },
    { label: "Março", value: '03' },
    { label: "Abril", value: '04' },
    { label: "Maio", value: '05' },
    { label: "Junho", value: '06' },
    { label: "Julho", value: '07' },
    { label: "Agosto", value: '08' },
    { label: "Setembro", value: '09' },
    { label: "Outubro", value: '10' },
    { label: "Novembro", value: '11' },
    { label: "Dezembro", value: '12' }
];

const empresas = [
    { nomeRazao: "ABC alimentos", cnpj: '39903065000182', nomeFantasia: "Dina Pizza" },
    { nomeRazao: "DEF alimentos", cnpj: '27895321000158', nomeFantasia: "Panificadora" }
];


// lista dos últimos 5 anos com apenas os dois ultimos algarismos
const anos = [];
for (let index = 0; index < 5; index++) {
    const ano = new Date().getFullYear() - index;
    anos.push({ label: ano, value: ano.toString().substring(2, 4) });
}

const download = async () => {

// merge arrays


    $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: "white",
        spinnerSize: 60,
        message: "Fazendo o donwload... Aguarde!",
        messageColor: "white",
    });
    retornoGerado.value = [];

    for (let index2 = 0; index2 < empresasSelecionadas.value.length; index2++) {
        const empresa = empresasSelecionadas.value[index2];


        const caminho = `alpha/${empresa.cnpj}/notas/nfce/nfe_producao/${mes.value}20${ano.value}/`;
        let urls = [
        ];
        const ret = await useCustomFetch(
            "api/listObjectsS3",
            "post",
            {
                caminho: caminho,
                all: true
            },
            undefined
        );

        $q.loading.show({
            spinner: QSpinnerOval,
            spinnerColor: "white",
            spinnerSize: 60,
            message: "Fazendo o donwload... Aguarde!",
            messageColor: "white",
        });


        if (ret.valido && ret.data.Contents.length > 0) {
            urls = ret.data.Contents;
            const zip = new JSZip();

            for (let index = 0; index < urls.length; index++) {
                const fileName = urls[index].Key;


                $q.loading.show({
                    spinner: QSpinnerOval,
                    spinnerColor: "white",
                    spinnerSize: 60,
                    message: `${empresa.nomeRazao} baixando ${index + 1} de ${urls.length}... Aguarde!`,
                    messageColor: "white",
                });

                //const url = $geralService.configuracoes.BASE_S3 + caminho + fileName;
                const url = $geralService.configuracoes.BASE_S3 + fileName;
                const data = await $fetch(url, 'get', {});

                if (data) {
                    // // console.log(data);
                    // // console.log(url);
                    // loading a file and add it in a zip file
                    zip.file(fileName, data, { binary: true });
                    // // console.log((index+1) + ' - ' + urls.length);
                    if (index == urls.length - 1) {
                        // console.log('gerando zip');
                        zip.generateAsync({ type: 'blob' }).then(function (content) {
                            saveAs(content, `${empresa.cnpj}_${mes.value}_20${ano.value}.zip`);
                            retornoGerado.value.push({ empresa: empresa, valido: true, quantidade: urls.length });
                            // $q.notify({
                            //     color: "positive",
                            //     message: "Arquivo Gerado Com Sucesso!",
                            // });
                        });
                    }
                } else {
                    // console.log(data);
                }


            }
        } else {
            // console.log(ret.data);
            // $q.notify({
            //     color: "negative",
            //     message: "Nenhum arquivo encontrado!",
            // });
            retornoGerado.value.push({ empresa: empresa, valido: false, quantidade: 0 });
        }



        const getDataHoraAtual = () => {
            const data = new Date();
            const dataFormatada = data.getDate() + "-" + (data.getMonth() + 1) + "-" + data.getFullYear() + "_" + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
            return dataFormatada;
        }


        // zip.file("Hello.txt", "Hello World\n");
        // zip.generateAsync({ type: "blob" })
        //     .then(function (content) {
        //         // see FileSaver.js
        //         saveAs(content, "example.zip");
        //     });

    }
    $q.loading.hide();



}

</script>

<style></style>