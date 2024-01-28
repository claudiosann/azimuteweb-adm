<template>
    <div class="row items-center justify-evenly h-full">
        <div class="grid justify-center">
            <q-card class="q-ma-md !rounded-xl">
                <q-card-section>
                    <div class="row text-h5 text-gray-600 dark:text-gray-200">{{ modal ? 'Revalidar Login' : 'Login' }}</div>
                    
                    
                    <div class="row justify-center text-lg text-gray-600 dark:text-gray-200">Plataforma</div>
                    <div class="row justify-center">
                        <div class="row"><img style="max-height: 50px" src="https://azimuteweb.s3.sa-east-1.amazonaws.com/nova_logo.svg" class="image mb-2xl" /></div>
                    </div>
                    <div style="width: 100%; max-width: 360px" class="row justify-center">
                        <q-input outlined class="full-width q-mb-md" input-class="rounded-md" v-model="v$.login.$model"
                            label="Login" error-message="Login é obrigatório" placeholder="e-mail ou cpf (somente números)" :error="v$.login.$invalid" />
                        <q-input ref="passInput" outlined class="full-width" :type="isPwd ? 'password' : 'text'"
                            v-model="v$.senha.$model" label="Senha" error-message="Senha é obrigatória"
                            :error="v$.senha.$invalid">
                            <template v-slot:append>
                                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                    @click="mostrarSenha()" />
                            </template>
                        </q-input>
                        <div class="row text- full-width flex justify-end q-mb-md">
                            <q-btn push rounded-md h-11 class="" style="margin-top: 20px" color="light-blue" icon="login"
                                :label="modal ? 'Revalidar Login' : 'Fazer Login'" @click="logar()"></q-btn>
                        </div>
                        <div v-if="!modal" class="row full-width flex justify-between">
                            <q-btn class="btAlpha" flat color="blue" @click="navigateTo('/esqueciMinhaSenha')"
                                label="Esqueci Minha Senha"></q-btn>
                            <q-btn class="btAlpha" flat color="blue" @click="navigateTo('/cadastro')"
                                label="Novo Cadastro"></q-btn>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </div>
</template>

<script setup>
import { email, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { useQuasar } from "quasar";
import SeletorAcesso from "./SeletorAcesso.vue";
import md5 from "js-md5";

const props = defineProps({
    caminho: null,
    mensagemNoLogin: null,
    modal: false,
    entidadeId: null
});

const emit = defineEmits(['onOk']);

// const seletorAcesso = SeletorAcesso;
const $q = useQuasar();

const geral = useGeral();
const isPwd = ref(true);
const passInput = ref(null);

const state = reactive({ senha: "", login: "" });
const rules = { login: { required }, senha: { required } };
const v$ = useVuelidate(rules, state, { $scope: false });
const { $geralService } = useNuxtApp();
const yul = $geralService.configuracoes._urj;
const runTimeConfig = useRuntimeConfig();
onMounted(() => {
    // // console.log('EntidadeId', props.entidadeId);
    if (props.messageNoLogin) {
        setTimeout(() => {
            $q.notify({
                position: "top-right",
                icon: "info",
                color: "info",
                message: "É necessário fazer login antes de continuar!",
                timeout: 5000,
            });
        }, 300);
    }
});

const mostrarSenha = () => {
    if (isPwd.value) {
        isPwd.value = false;
        setTimeout(() => {
            isPwd.value = true;
        }, 3000);
    } else {
        isPwd.value = true;
    }
    try {
        passInput.value.$el.focus();
        window.getSelection().selectAllChildren(passInput.value.$el);
        window.getSelection().collapseToEnd();
    } catch (error) { }
};

const logar = async () => {
    $q.loading.show({
        message: "Validando informações... Aguarde!",
    });

    try {
        const newData = JSON.parse(JSON.stringify(state));
        newData.senha = md5(newData.senha);
        // // console.log(newData.senha);

        const ret = await $fetch(`${runTimeConfig.public.baseUrl}login`, {
            method: "post",
            body: newData,
        });

        if (ret && ret.valido == false) {
            $q.loading.hide();
            $q.notify({
                position: "top-right",
                type: "negative",
                message: ret.data.message ? ret.data.message : "Usuário ou senha está incoreto!",
                timeout: 5000,
            });
            return;
        } else if (ret && ret.valido == true) {
            const tokenAzimuteweb = useCookie("__bew");
            const tkMaster = useCookie("__ret");
            const usuarioC = useCookie("__oir");

            tokenAzimuteweb.value = encode(ret.data.token, yul);
            tkMaster.value = encode(ret.data.tkMaster, yul);
            usuarioC.value = encode(JSON.stringify(ret.data.usuario), yul);
            await geral.setPessoa(ret.data.usuario);
            geral.setToken(tokenAzimuteweb.value);
            geral.decrementExpiracao(
                parseJwt(ret.data.token).exp);
            geral.decrementExpiracaoMaster(
                parseJwt(ret.data.tkMaster).exp);
            await verificaVinculos();
            return;
        }
    } catch (error) {
    }
    $q.loading.hide();
    $q.notify({
        position: "top-right",
        type: "negative",
        message: "Falha de comunicação!",
        timeout: 5000,
    });
};

const verificaVinculos = async (caminho1) => {
    const ret2 = await useCustomFetch("vinculo/getPopulate", "post", {
        filtro: {
            pessoa: geral.pessoa._id,
            lixo: false,
            ativo: true,
        },
        select: { entidade: 1, funcoesExtras: 1, funcoesRestritivas: 1, acessosSistema: 1, tipoLigacao: 1 },
        populateObj: ['acessosSistema',
        { path: "entidade", select: { nomeRazao: 1, nomeFantasia: 1, sigla: 1, logo: 1, tipo: 1, esportes: 1, tratamentoMasculino: 1 }, populate: { path: "esportes", select: { descricao: 1 } } },
        ],
    });

    if (ret2.valido) {
        if (ret2.data.length === 1) {
            await confirmaEntidade(ret2.data[0], true, caminho1);
        } else if (ret2.data.length > 1) {
            $q.dialog({
                component: SeletorAcesso,
                persistent: true,
                componentProps: { dark: true, listaVinculo: ret2.data, caminho: caminho1 },
            })
                .onOk(async (data) => {
                    await confirmaEntidade(data, true, caminho1);
                })
                .onCancel(() => { });
            $q.loading.hide();
            return true;
        } else {
            geral.reset();
            $q.loading.hide();
            $q.notify({
                color: "negative",
                message: "Você não tem acesso a este sistema!",
                icon: "warning",
            });
        }
    } else {
        // console.log(ret2);
        geral.reset();
        $q.loading.hide();
        $q.notify({
            color: "negative",
            message: ret2.data.message,
            icon: "warning",
        });
    }
    $q.loading.hide();
    return false;
};

const confirmaEntidade = async (vinculo, fecharLoading, caminho) => {
    const afterLoging = useCookie("afterLogin");
    const usuarioC = useCookie("__oir");
    const vinculoC = useCookie("__olu");

    const pessoa = JSON.parse(JSON.stringify(geral.pessoa));
    pessoa.vinculo = vinculo;
    vinculoC.value = encode(JSON.stringify(vinculo), yul);
    await geral.setPessoa(pessoa)
    geral.setEntidade(pessoa.vinculo.entidade);
    geral.setFuncoesSistema(vinculo);
    $q.loading.hide();
    if (props.modal) { 
        if (props.entidadeId == pessoa.vinculo.entidade._id) {
             emit('onOk', true);
        } else {
            setTimeout(() => {
                emit('onOk', true);
            }, 300);
            navigateTo("/");
        }
    } else {
        if (afterLoging.value && afterLoging.value != '/login') {
            let rota = afterLoging.value;
            afterLoging.value = null;
            navigateTo(rota);
        } else {
            navigateTo("/");
        }
    } 

    // if (caminho) {
    //   router.push(caminho);
    // }
};
</script>

<style></style>