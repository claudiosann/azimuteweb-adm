<template>
    <q-list :dark="false" class="rounded-borders">
        <span v-if="geral.funcoesAcessos">
            <q-expansion-item :dark="false" v-if="geral.funcoesAcessos.administrativoAcessar" class="menuItem"
                icon="show_chart" label="Administrativo" :content-inset-level="0.5">
                <template v-slot:header>
                    <q-item-section avatar>
                        <q-avatar rounded icon="show_chart" class="bg-gradient-to-r from-red-600 to-rose-400"
                            text-color="white" />
                    </q-item-section>
                    <q-item-section class="text-weight-bold">
                        Administrativo
                    </q-item-section>
                </template>

                <!-- <EssentialLink v-if="geral.pessoa._id = '5aff4d2f47667633c7ace227'" link="/api" color="bg-gradient-to-r from-cyan-500 to-pink-500" icon="api" title="API"
                    :caption="`Funções da Api`" /> -->
                <EssentialLink link="/cadastro/perfis-de-acessos" color="bg-gradient-to-l from-amber-500 to-amber-700"
                    icon="badge" title="Perfis de Acessos" :caption="`Funções de Acesso ao sistema`"
                    v-if="geral.funcoesAcessos.diretoriaAcessar" />
                <EssentialLink link="/cadastro/pessoas-filiadas" color="bg-gradient-to-l from-emerald-500 to-emerald-700"
                    icon="fas fa-id-card" title="Pessoas Filiadas"
                    :caption="`Pessoas filiadas ${(geral.entidade.tratamentoMasculino ? 'ao' : 'à')} ${geral.entidade.sigla}`"
                    v-if="geral.funcoesAcessos.filiacaoAcessar" />
                <EssentialLink link="/cadastro/pessoas" color="bg-gradient-to-l from-fuchsia-500 to-fuchsia-700"
                    icon="person" title="Pessoas"
                    :caption="`Cadastro Geral de Pessoas`"
                    v-if="geral.funcoesAcessos.pessoaAcessar" />
                <EssentialLink link="/cadastro/entidades" color="bg-gradient-to-l from-sky-500  to-sky-700" icon="home_work"
                    title="Entidades (Suporte)" :caption="`Entidades (Suporte)`"
                    v-if="geral.funcoesAcessos.entidadeAcessar" />
                <EssentialLink link="/cadastro/entidades-filiadas" color="bg-gradient-to-l from-lime-500 to-lime-700"
                    icon="group_work" title="Entidades Filiadas"
                    :caption="`Entidades filiadas ${(geral.entidade.tratamentoMasculino ? 'ao' : 'à')} ${geral.entidade.sigla}`"
                    v-if="geral.funcoesAcessos.entidadesFiliadasAcessar" />
                <EssentialLink link="/cadastro/filiacoes-entidades" color="bg-gradient-to-l from-indigo-500 to-indigo-700"
                    icon="join_left" title="Filiações em Entidades"
                    :caption="`Entidades em que ${(geral.entidade.tratamentoMasculino ? 'o' : 'a')} ${geral.entidade.sigla} é filiad${(geral.entidade.tratamentoMasculino ? 'o' : 'a')}.`"
                    v-if="geral.funcoesAcessos.filiacoesEntidadesAcessar" />
                <EssentialLink link="/cadastro/diretorias" color="bg-gradient-to-l from-teal-500 to-teal-700 "
                    icon="people_alt" title="Diretorias"
                    :caption="`Todas as diretorias ${(geral.entidade.tratamentoMasculino ? 'do' : 'da')} ${geral.entidade.sigla}`"
                    v-if="geral.funcoesAcessos.diretoriaAcessar" />
                <EssentialLink link="/arquivos" color="bg-gradient-to-l from-yellow-300 to-yellow-700 "
                    icon="folder" title="Arquivos"
                    :caption="`Gerenciador de Arquivos ${(geral.entidade.tratamentoMasculino ? 'do' : 'da')} ${geral.entidade.sigla}`"
                    v-if="geral.funcoesAcessos.arquivosAcessar" />
            </q-expansion-item>
            <q-expansion-item :dark="false" v-if="geral.funcoesAcessos.siteAcessar" class="menuItem"
                icon="important_devices" :content-inset-level="0.5">

                <template v-slot:header>
                    <q-item-section avatar>
                        <q-avatar rounded icon="important_devices" class="bg-gradient-to-l from-sky-500 to-sky-700"
                            text-color="white" />
                    </q-item-section>
                    <q-item-section class="text-weight-bold">
                        Marketing
                    </q-item-section>
                </template>

                <EssentialLink link="/cadastro/noticias" color="bg-gradient-to-r from-yellow-600 to-red-600"
                    icon="newspaper" title="Notícias" :caption="`Listagem de notícias diversas`"
                    v-if="geral.funcoesAcessos.noticiaAcessar" />
                <EssentialLink link="/cadastro/grupos-noticias" color="bg-gradient-to-r from-rose-700 to-pink-600"
                    icon="fa-solid fa-newspaper" title="Grupos de Notícias" :caption="`Agrupador de Notícias`"
                    v-if="geral.funcoesAcessos.noticiaGrupoAcessar" />
                <EssentialLink link="/cadastro/conteudos" color="bg-gradient-to-r from-cyan-500 to-blue-500" icon="article"
                    title="Conteúdos" :caption="`Listagem de conteúdos`" v-if="geral.funcoesAcessos.conteudoAcessar" />
                <EssentialLink link="/cadastro/destaques" color="bg-gradient-to-r from-indigo-500 to-pink-500" icon="star"
                    title="Destaques" :caption="`Listagem de destaques`" v-if="geral.funcoesAcessos.conteudoAcessar" />
                <EssentialLink link="/cadastro/parceiros" color="bg-gradient-to-r from-red-500 to-red-800"
                    icon="fas fa-handshake" title="Parceiros" :caption="`Listagem de parceiros`"
                    v-if="geral.funcoesAcessos.conteudoAcessar" />
                <EssentialLink link="/cadastro/entidades-sites" color="bg-gradient-to-r from-green-500 to-green-700"
                    icon="house_siding" title="Sites das Entidades" :caption="`Listagem de sites das entidades`"
                    v-if="geral.funcoesAcessos.conteudoAcessar" />
                <EssentialLink @click="editarEntidadeSite" link="/" color="bg-gradient-to-l from-yellow-500 to-yellow-700"
                    icon="settings" title="Configurações do Site"
                    :caption="`Configurações do Site ${(geral.entidade.tratamentoMasculino ? 'do' : 'da')} ${geral.entidade.sigla} `"
                    v-if="geral.funcoesAcessos.entidadeSiteConfiguracoes" />

            </q-expansion-item>
            <q-expansion-item :dark="false" v-if="geral.funcoesAcessos.tecnicoAcessar" class="menuItem"
                :content-inset-level="0.5">

                <template v-slot:header>
                    <q-item-section avatar>
                        <q-avatar rounded icon="sports" class="bg-gradient-to-r from-emerald-900 to-emerald-500"
                            text-color="white" />
                    </q-item-section>
                    <q-item-section class="text-weight-bold">
                        Técnico
                    </q-item-section>
                </template>
                <EssentialLink link="/cadastro/esportes" color="bg-gradient-to-l from-rose-500 to-rose-700" icon="pool"
                    title="Esportes" :caption="`Listagem de Esportes`" v-if="geral.funcoesAcessos.esporteAcessar" />
                <EssentialLink link="/cadastro/grupos-esportivos" icon="scatter_plot" title="Grupos Esportivos"
                    :caption="`listagem de grupos esportivos`" v-if="geral.funcoesAcessos.grupoEsportivoAcessar" />
                <EssentialLink link="/cadastro/modalidades-esportivas" icon="sports_kabaddi" title="Modalidade Esportiva"
                    :caption="`Listagem de modalidades esportivas`" color="bg-gradient-to-r from-yellow-600 to-red-600"
                    v-if="geral.funcoesAcessos.modalidadeEsportivaAcessar" />
                <EssentialLink link="/cadastro/modelos-categorias" icon="category" title="Modelo de Categorias"
                    :caption="`Listagem de modelos de categorias`" color="bg-gradient-to-r from-teal-500 to-teal-800"
                    v-if="geral.funcoesAcessos.modalidadeEsportivaAcessar" />
                <EssentialLink link="/cadastro/modelos-pontuacoes" icon="123" title="Modelo de Pontuação"
                    :caption="`Listagem de modelos de pontuação`" color="bg-gradient-to-r from-sky-500 to-sky-800"
                    v-if="geral.funcoesAcessos.modeloPontuacaoAcessar" />
                <EssentialLink link="/cadastro/campeonatos" icon="fas fa-trophy" title="Campeonatos"
                    :caption="`Listagem de campeonatos`" color="bg-gradient-to-r from-pink-400 to-pink-600"
                    v-if="geral.funcoesAcessos.campeonatoAcessar" />
                <EssentialLink link="/cadastro/eventos" icon="fas fa-calendar-alt" title="Eventos"
                    :caption="`Listagem de eventos`" color="bg-gradient-to-r from-lime-400 to-gray-600"
                    v-if="geral.funcoesAcessos.eventoAcessar" />
            </q-expansion-item>
            <q-expansion-item :dark="false" v-if="geral.funcoesAcessos.financeiroAcessar" class="menuItem"
                icon="monetization_on" label="Financeiro" :content-inset-level="0.5">
                <template v-slot:header>
                    <q-item-section avatar>
                        <q-avatar rounded icon="monetization_on" class="bg-gradient-to-l from-purple-500 to-violet-900"
                            text-color="white" />
                    </q-item-section>
                    <q-item-section class="text-weight-bold">
                        Financeiro
                    </q-item-section>
                </template>
                <EssentialLink link="/cadastro/financeiro/agendas" icon="calendar_month" title="Agenda Financeira"
                    :caption="`Compromissos financeiros`" color="bg-gradient-to-r from-indigo-700 to-sky-400"
                    v-if="geral.funcoesAcessos.financeiroAgendaAcessar" />
                <EssentialLink link="/cadastro/financeiro/movimentacoes" icon="swap_horiz" title="Movimentações"
                    :caption="`Fluxo financeiro`" color="bg-gradient-to-r from-purple-700 to-rose-400"
                    v-if="geral.funcoesAcessos.financeiroContaAcessar" />
                <EssentialLink link="/cadastro/financeiro/contas" icon="account_balance" title="Contas"
                    :caption="`Listagem de Contas`" color="bg-gradient-to-r from-orange-700 to-yellow-400"
                    v-if="geral.funcoesAcessos.financeiroContaAcessar" />
                <EssentialLink link="/cadastro/financeiro/plano-de-contas" icon="format_list_numbered"
                    title="Plano de Contas" :caption="`Plano de Contas`" color="bg-gradient-to-r from-teal-700 to-lime-400"
                    v-if="geral.funcoesAcessos.financeiroContaAcessar" />
                <EssentialLink link="/cadastro/financeiro/taxas" icon="attach_money" title="Taxas"
                    :caption="`Taxas`" color="bg-gradient-to-r from-rose-700 to-pink-400"
                    v-if="geral.funcoesAcessos.taxaAcessar" />
                <EssentialLink link="/inscricoes" icon="how_to_reg"
                    title="Inscrições Admin" :caption="`(Suporte)`" color="bg-gradient-to-r from-teal-700 to-cyan-400"
                    v-if="geral.pessoa._id == '5aff4d2f47667633c7ace227'" />
                <EssentialLink link="/recebiveis" icon="fork_right"
                    title="Recebíveis Gerados Admin" :caption="`(Suporte)`" color="bg-gradient-to-r from-violet-800 to-violet-400"
                    v-if="geral.funcoesAcessos.recebiveisAcessar" />
                <EssentialLink link="/repasses" icon="currency_exchange"
                    title="Repasses" :caption="`Valores repassados`" color="bg-gradient-to-r from-green-800 to-red-400"
                    v-if="geral.funcoesAcessos.repasseAcessar" />

            </q-expansion-item>
        </span>
        <q-separator />
    </q-list>
</template>

<script setup>
import EntidadeSiteModal from "./cadastro/EntidadeSiteModal.vue";
import { useQuasar, QSpinnerOval } from "quasar";

const $q = useQuasar();
const { $geralService } = useNuxtApp()
const geral = useGeral();
const route = useRoute();
// const usuarioC = useCookie("__oir");
// const tokenAzimuteweb = useCookie("__bew");
// const vinculo = useCookie("__olu");

const getUrlImagem = (caminho, tamanho) => {
    if (caminho === null) {
        return null;
    } else {
        return $geralService.getUrlS3Thumb(caminho, {
            height: (tamanho || 128)
        });
    }
};
const executando = ref(false);
const editarEntidadeSite = async () => {
    if (geral.funcoesAcessos.entidadeSiteConfiguracoes) {
        if (!executando.value) {
            $q.loading.show({
                spinner: QSpinnerOval,
                spinnerColor: "white",
                spinnerSize: 60,
                message: "Buscando Dados... Aguarde!",
                messageColor: "white",
            });
            executando.value = true;
            const ret = await useCustomFetch('entidadeSite/getPopulate', 'post', {
                filtro: {
                    entidade: geral.entidade._id
                },
                select: { dominio: 1 }
            }, null);
            $q.loading.hide();
            // console.log(ret);
            if (ret.valido) {
                // console.log(ret.data[0]._id);
                $q.dialog({
                    component: EntidadeSiteModal,
                    componentProps: {
                        id: ret.data.length === 0 ? undefined : ret.data[0]._id
                    }
                })
                    .onOk(async (ret) => {
                        executando.value = false;
                    })
                    .onCancel(() => {
                        executando.value = false;
                    });
            }
        }
    }
}

const irPara = (rota) => {
    if (route.path !== rota) {
        navigateTo(rota);
    }
}

</script>
