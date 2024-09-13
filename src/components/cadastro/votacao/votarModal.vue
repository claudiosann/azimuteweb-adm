<template>
    <div>
        <q-dialog :persistent="true" :maximized="true" ref="dialogRef" @hide="onDialogHide">
            <q-card v-if="votacao" >
                <!-- GO toolbar -->
                <q-toolbar :glossy="true" :class="$q.dark.isActive ? ' bg-gray-8' : 'bg-grey-2 '">
                    <img style="height: 40px;" :src="getUrlImagem(votacao.imagemUrl)">

                    <q-toolbar-title class="font-semibold caption">
                        <q-item class="pl-0">
                            <q-item-section>
                                <q-item-label>Votar</q-item-label>
                                <q-item-label caption lines="2">{{ geral.pessoa.numero }} - {{ peso }}</q-item-label>
                            </q-item-section>
                        </q-item>

                    </q-toolbar-title>
                    <!-- GO btnSave -->
                  
                    <q-btn :round="$q.screen.xs ? true : false" glossy push class="btn-scale" @click="cancel"
                        :label="$q.screen.gt.xs ? 'Cancelar' : undefined" color="red" icon="close" />
                </q-toolbar>

                <q-card-section :style="{ 'max-height': 'calc(100vh - 50px)' }" class="scroll container mx-auto">


                    <div class="grid justify-items-start">
                        <div>
                            <span
                                class="bg-gradient-to-r from-green-600 via-lime-500 to-cyan-400 bg-clip-text text-4xl font-extrabold tracking-tighter text-transparent sm:text-2xl lg:text-3xl">{{
                                    votacao.titulo
                                }}
                            </span>
                        </div>
                        <div class="text-lg">{{ votacao.subTitulo }}</div>
                        <q-stepper header-class="text-lg" class="q-pt-sm" flat v-model="etapa" vertical color="primary"
                            animated>
                            <q-step v-for="(disputa, index) in disputas" :key="index" :name="index"
                                :title="`${disputa.descricao} ${disputa.selecionados.length} de ${disputa.quantidade}`" :done="etapa > index"
                                :caption="disputa.selecionados.map((x: any) => x.titulo).join(', ')"
                                :icon="'counter' + (index + 1)">

                                <!-- <q-select autofocus dense outlined multiple use-chips map-options option-label="titulo" option-value="_id" emit-value  v-model="disputa.selecionados" :max-values="disputa.quantidade"
                                                                    :options="disputa.opcoesDeVoto" label="Opções" /> -->

                                <q-list separator>
                                    <div v-for="(opcao, index2) in disputa.opcoesDeVoto" :key="index2">
                                    <q-card class="mr-4 mb-3 scale-105 rounded-lg" v-if="opcao.selecionado || (!opcao.selecionado && (disputa.quantidade > disputa.selecionados.length))">
                                        <q-checkbox size="lg"
                                            v-model="opcao.selecionado"
                                            @update:model-value="() => { changeVotacao(index) }">
                                            <q-item>
                                                <q-item-section v-if="opcao.corPadrao" top avatar>
                                                    <q-avatar
                                                        :style="{ background: opcao.corPadrao ? opcao.corPadrao : undefined }"
                                                        text-color="white">{{ $geralService.getIniciais(opcao.titulo)
                                                        }}</q-avatar>
                                                </q-item-section>
                                                <q-item-section>
                                                    <q-item-label class="text-lg">{{ opcao.titulo }} </q-item-label>
                                                    <q-item-label caption lines="2" class="text-md">{{ opcao.subTitulo }}
                                                    </q-item-label>
                                                </q-item-section>
                                            </q-item>

                                        </q-checkbox>
                                         
                                    </q-card>
                                    </div>
                                </q-list>


                                <!-- <pre>{{ disputa.selecionados }}</pre> -->

                                <q-stepper-navigation pt-4>
                                    <q-btn v-if="index > 0" flat class="btn-scale mr-4" @click="etapa--" color="negative"
                                        label="Voltar" />
                                    <q-btn glossy push class="btn-scale" v-if="disputa.quantidade === disputa.selecionados.length && peso > 0"
                                        @click="continuar" :color="votacao.disputas.length === (index + 1) ? 'positive':'primary'"
                                        :label="votacao.disputas.length === (index + 1) ? 'Concluir Voto' : 'Continuar'" />
                                </q-stepper-navigation>
                            </q-step>
                        </q-stepper>
                    </div>

                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { useDialogPluginComponent, useQuasar, QSpinnerOval } from 'quasar';


const props = defineProps({
    id: { type: String, default: null },
    votacaoId: null
});

const votacao = ref<any>(null);
const etapa = ref(0);

const escolhas = ref([]);

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const disputas = computed(() => {
    return votacao.value.disputas.map((x: any) => {
        x.selecionados = [];
        x.opcoesDeVoto = votacao.value.opcoesDeVoto.filter((y: any) => {
            return y.disputas.includes(x._id);
        }).map((z: any) => {
            z.selecionado = false;
            return z;
        });

        return x;
    });
});


const changeVotacao = (index: number) => {
    disputas.value[index].selecionados = [];
    for (let i = 0; i < disputas.value[index].opcoesDeVoto.length; i++) {
        const element = disputas.value[index].opcoesDeVoto[i];
        if (element.selecionado) {
            disputas.value[index].selecionados.push(element);
        }
    }
}

const peso = ref(0);

onBeforeMount(async () => {
     const ret = await useCustomFetch("votacao/getPopulate", "post", { filtro: {_id: props.votacaoId}, select: { votos: 0 } }, undefined);
// console.log(ret);
    if (ret.valido && ret.data.length === 1) {
        votacao.value = ret.data[0];

        let continuar = false;
        if (votacao.value.votantes.length === 0) {
            peso.value = 1;
            continuar = true;
        } else {
            votacao.value.votantes.forEach((x: any) => {
                if (x.pessoa === geral.pessoa._id) {
                    peso.value = x.peso;
                    continuar = true;
                    return;
                }
            });
        }
        if (!continuar) {
            $q.notify({
                color: 'negative',
                message: 'Você não está habilitado para votar nesta eleição!',
                icon: 'report_problem',
                position: 'top',
                timeout: 4000,
                actions: [{ icon: 'close', color: 'white' }]
            })
            setTimeout(() => {
                cancel();
            }, 200);

        }
    } else {
        $q.notify({
            color: 'negative',
            message: 'Falha ao carregar votação!',
            icon: 'report_problem',
            position: 'top',
            timeout: 4000,
            actions: [{ icon: 'close', color: 'white' }]
        })
    }
});


const geral = useGeral();
const dense = ref(false);
const $q = useQuasar();
const { $geralService } = useNuxtApp();

const getUrlImagem = (caminho: any) => {
    return $geralService.getUrlS3(caminho);
}
const continuar = () => {
    if (etapa.value < disputas.value.length - 1) {
        etapa.value++;
    } else { 
        votar();
    }
}
 const getOpcaoVotoTituloPorId = (id: string) => {
        for (let index = 0; index < disputas.value.length; index++) {
            const disputa = disputas.value[index];
            for (let index2 = 0; index2 < disputa.opcoesDeVoto.length; index2++) {
                const opcao = disputa.opcoesDeVoto[index2];
                if (opcao._id === id) {
                    return opcao.titulo;
                }
            }
        }
        return undefined;
}
    
const votar = async () => {
       $q.loading.show({
        spinner: QSpinnerOval,
        spinnerColor: 'white',
        spinnerSize: 60,
        message: 'Enviando Votação...Aguarde!',
        messageColor: 'white'
    });

    let votos: any = [];

    for (let index = 0; index < disputas.value.length; index++) {
        const disputa = disputas.value[index];
        disputa.selecionados.forEach((opcao: any) => {
                votos.push({
                    pessoaId: geral.pessoa.pessoa._id,
                    pessoaNome: votacao.value.votacaoAberta ? geral.pessoa.nome : undefined,
                    pessoaNumero: votacao.value.votacaoAberta ? geral.pessoa.numero: undefined,
                    opcoesDeVotoId: opcao._id,
                    opcaoVotoTitulo: votacao.value.votacaoAberta ? getOpcaoVotoTituloPorId(opcao._id): undefined,
                    peso: peso.value,
                    disputaId: disputa._id,
                    disputaDescricao: votacao.value.votacaoAberta ? disputa.descricao: undefined
                });
                return true;
        });
    }

   

    const ret = await useCustomFetch('addVoto', 'post', {
        votos: votos,
        _id: votacao.value._id
    }, undefined);


    if (ret.valido) {
        // Notificar
        $q.notify({
            color: 'positive',
            message: 'Votação computada com sucesso!',
            icon: 'check_circle',
            position: 'top',
            timeout: 4000,
            actions: [{ icon: 'close', color: 'white' }]
        })

        onDialogOK(true);
        
    } else {
        // Notificar
        $q.notify({
            color: 'negative',
            message: 'Votação não computada!',
            caption: ret.data.message ? ret.data.message : 'Falha ao enviar votação!',
            icon: 'report_problem',
            position: 'top',
            timeout: 4000,
            actions: [{ icon: 'close', color: 'white' }]
        })
    }
        $q.loading.hide();
}

const cancel = async () => {
    onDialogCancel();
    // $q.notify({
    //     position: "top",
    //     type: "info",
    //     textColor: "white",
    //     message: "Votação cancelada!",
    // });
    return;
};
// TO save
// TO save
const save = async () => {
 
};

</script>

<style lang="scss">
.q-stepper--vertical .q-stepper__title {
    line-height: 22px;
}

.q-stepper__title {
    font-size: 20px;
    line-height: 20px;
    letter-spacing: 0.1px;
}

.q-stepper__caption {
    font-size: 14px;
    line-height: 16px;
}</style>
