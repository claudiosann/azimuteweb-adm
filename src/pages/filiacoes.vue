<template>
  <div class="p-1 sm:p-4">
    <q-grid v-if="rows" :data="rows" :columns="columns" :columns_filter="true" row-key="name" color="secondary" :pagination="initialPagination" rows-per-page-label="Registros por página:">
      <template v-slot:top>
        <q-toolbar class="p-none rounded-tl-lg rounded-tr-lg" :glossy="true" :class="$q.dark.isActive ? 'text-grey-2 bg-gray-8' : 'bg-grey-2 text-gray-9'">
          <q-icon class="ml-3 p-1 rounded text-white bg-gradient-to-r from-red-700 to-blue-400" name="fas fa-id-card" size="30px" />
          <q-toolbar-title><span class="mr-3 text-weight-medium">Filiações</span></q-toolbar-title>
          <q-btn class="btn-scale m-2 pr-4 pl-2" color="primary" push glossy round label="Gerar Valores" @click="gerarRateio">
            <q-tooltip>Gerar Arranjo</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-expansion-item class="w-full" expand-separator icon="fas fa-filter" label="Filtro">
          <div class="row q-ma-sm q-col-gutter-sm">
            <div class="col-md-3 col-sm-4 col-12">
              <CinputDate tipo="datetime" outlined v-model="filtro.inicio" label="Início" :dense="true" />
            </div>
            <div class="col-md-3 col-sm-4 col-12">
              <CinputDate tipo="datetime" outlined v-model="filtro.fim" label="Fim" :dense="true" />
            </div>
            <div class="col-md-3 col-sm-4 col-12">
              <q-select outlined dense v-model="filtro.status" :options="['Iniciada', 'Aguardando Pagamento', 'Em Análise', 'Concluída', 'Cancelada', null]" label="Status" />
            </div>
            <div class="col-md-3 col-sm-4 col-12">
              <q-select outlined dense v-model="filtro.tipo" :options="['Normal', 'Temporária', null]" label="Tipo" />
            </div>
            <div class="col-md-3 col-sm-4 col-12">
              <q-select outlined dense v-model="filtro.estagioRateio" :options="['Iniciado', 'Finalizado', null]" label="Rateio" />
            </div>
            <div class="col-12">
              <q-btn color="primary" icon="check" label="Aplicar Filtro" @click="getList" />
            </div>
            <div class="col-12">
              <q-btn v-if="rows.length > 0 && filtro.numero" color="primary" icon="check" label="Exportar" @click="exportCSV" />
            </div>
          </div>
        </q-expansion-item>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="sequencial"> {{ props.row.sequencial }}</q-td>
          <q-td key="numeroFiliacao"> {{ props.row.numeroFiliacao }}</q-td>

          <q-td key="pessoa.nome">
            <q-item class="!px-0">
              <q-item-section class="!pr-0" style="min-width: 50px" v-if="props.row.pessoa.foto" top avatar>
                <q-img class="rounded-borders" style="width: 45px" :ratio="32 / 32" :src="getUrlImagemThumb(props.row.pessoa.foto)"></q-img>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ props.row.pessoa.nome }} </q-item-label>
                <q-item-label><q-badge class="ml-2" v-if="props.row.temporaria" color="red">Filiação Temporária</q-badge> </q-item-label>
              </q-item-section>
            </q-item>
          </q-td>
          <q-td key="created_at">{{ props.row.pagamento ? $geralService.getDataHoraFormatada(props.row.pagamento.created_at) : "Sem Pagamento" }}</q-td>
          <q-td key="pagamento.tipo">{{ props.row.pagamento.tipo }}</q-td>
          <q-td key="valorTotal">{{ $geralService.numeroParaMoeda(props.row.valorTotal) }}</q-td>
          <q-td key="status">
            <q-badge :color="getCorStatus(props.row.status)">{{ props.row.status }}</q-badge></q-td
          >
          <q-td key="action">
            <q-btn btn-scale push round glossy icon="more_vert">
              <q-menu>
                <q-list separator link>
                  <q-item>
                    <div class="row content-center"><span class="font-bold mr-1">Funções</span> {{ props.row.descricao }}</div>
                  </q-item>
                  <q-item v-if="geral.funcoesAcessos.consumivelInserir" clickable @click="editRow(props.rowIndex, props.row._id, true)" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="amber-7" text-color="white" icon="edit" />
                    </q-item-section>
                    <q-item-section avatar> Editar </q-item-section>
                  </q-item>
                  <!-- <q-item clickable @click="deleteRow(props.rowIndex, props.row)" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="red-7" text-color="white" icon="fas fa-trash" />
                    </q-item-section>
                    <q-item-section avatar> Excluir </q-item-section>
                  </q-item> -->
                  <q-item clickable @click="confirmaPagamentoPIX(props.row)" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="amber-7" text-color="white" icon="search" />
                    </q-item-section>
                    <q-item-section avatar> Confirma Pagamento </q-item-section>
                  </q-item>
                  <q-item clickable @click="verificaPagamentoPIX(props.row)" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="amber-7" text-color="white" icon="search" />
                    </q-item-section>
                    <q-item-section avatar> Consultar Pagamento </q-item-section>
                  </q-item>
                  <q-item clickable @click="verificaSeTemTef(props.row)" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar rounded-xl color="blue-7" text-color="white" icon="search" />
                    </q-item-section>
                    <q-item-section avatar> Ver TEF </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-grid>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "suporte",
});

import { useQuasar, QSpinnerOval } from "quasar";
import InscricaoModal from "../components/cadastro/InscricaoModal.vue";

const filtro = ref({
  status: null,
});

const getCorStatus = (status) => {
  switch (status) {
    case "Iniciada":
      return "accent";
    case "Aguardando Pagamento":
      return "info";
    case "Em Análise":
      return "warning";
    case "Concluída":
      return "positive";
    default:
      return "negative";
  }
};

const { $geralService } = useNuxtApp();
const $q = useQuasar();
const geral = useGeral();
const inserir = ref(false);
const idSelecionado = ref({});
const indexSelecionado = ref(-1);
const rows = ref([]);
const initialPagination = ref({
  page: 1,
  rowsPerPage: 10,
});
const columns = ref([
  {
    name: "sequencial",
    required: true,
    label: "Sequêncial",
    align: "left",
    field: "sequencial",
    sortable: true,
  },
  {
    name: "numeroFiliacao",
    required: true,
    label: "Nº Filiação",
    align: "left",
    field: "numeroFiliacao",
    sortable: true,
  },
  {
    name: "pessoa.nome",
    required: true,
    label: "Nome Responsável",
    align: "left",
    field: "pessoa.nome",
    sortable: true,
  },
  {
    name: "created_at",
    required: true,
    label: "Data e Hora",
    align: "left",
    field: "created_at",
    sortable: true,
  },
  {
    name: "papamento.tipo",
    required: true,
    label: "Tipo",
    align: "left",
    field: "pagamento.tipo",
    sortable: true,
  },
  {
    name: "valorTotal",
    required: true,
    label: "Valor",
    align: "left",
    field: "valorTotal",
    sortable: true,
  },
  {
    name: "status",
    required: true,
    label: "Status",
    align: "left",
    field: "status",
    sortable: true,
  },
  {
    name: "action",
    label: "Ação",
    align: "left",
    field: "",
    sortable: false,
  },
]);

const getUrlImagemThumb = (caminho) => {
  return $geralService.getUrlS3Thumb(caminho, {
    height: 128,
  });
};

const gravaFiliacao = async (descricaoHistorico, filiacaoPessoaLancamento) => {
  let retorno = false;
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Buscando Dados... Aguarde!",
    messageColor: "white",
  });

  try {
    let url = "filiacaoPessoaLancamento";
    let tipo = "post";
    if (descricaoHistorico) {
      filiacaoPessoaLancamento.historico.push({
        created_at: new Date().toISOString(),
        status: filiacaoPessoaLancamento.status,
        origemFiliadora: false,
        descricao: descricaoHistorico,
        pessoa: geral.pessoa._id,
      });
    }
    const newfiliacao = JSON.parse(JSON.stringify(filiacaoPessoaLancamento));

    url += "/" + newfiliacao._id;
    tipo = "put";

    const ret = await useCustomFetch(url, tipo, newfiliacao, undefined);
    if (ret.valido) {
      inserir.value = false;
      // // console.log("testem");
      retorno = true;
      if (tipo == "post") {
        filiacaoPessoaLancamento._id = ret.data._id;
      }
      // // console.log("gravou filiação");
    } else {
      // // console.log("teste");
      // // console.log(ret);
      $q.notify({
        color: "negative",
        message: "Não é possível continuar, Falha ao salvar filiação!",
      });
    }
    $q.loading.hide();
  } catch (error) {
    $q.loading.hide();
    console.log(error);
  }
  return retorno;
};

const verificaPagamentoPIX = async (inscricao) => {
  console.log(inscricao);
  try {
    const ret = await useCustomFetch(`consultarCobrancaPIX/${"pagamentoaz" + inscricao.pagamento._id}`, "GET", undefined, undefined);
    console.log(ret);
    if (ret.valido && ret.data && ret.data.status == "CONCLUIDA") {
      getList();
      $q.notify({
        color: "positive",
        message: "Pagamento Recebido",
      });
    } else {
      $q.notify({
        color: "negative",
        message: "Pagamento não recebido",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const confirmaPagamentoPIX = async (filiacaoPessoaLancamento) => {
  console.log(geral.entidade);
  console.log(filiacaoPessoaLancamento);
  if (filiacaoPessoaLancamento.status == "Iniciada") {
    try {
      const ret = await useCustomFetch(`verificaPagamentoPIX/${filiacaoPessoaLancamento.pagamento._id}`, undefined, undefined);
      if (ret.valido) {
        if (ret.data.status == "CONCLUIDA") {
          filiacaoPessoaLancamento.pagamento.status = "Recebido";
          validaPagamento({ valido: true, data: filiacaoPessoaLancamento.pagamento }, filiacaoPessoaLancamento);
        }
      } else {
        // // console.log(ret);
      }
    } catch (error) {
      // // console.log(error);
    }
  }
};

const validaPagamento = async (ret, filiacaoPessoaLancamento) => {
  // // console.log(ret);
  if (ret.semPagamento || ret.valido) {
    filiacaoPessoaLancamento.status = "Em Análise";

    if (!filiacaoPessoaLancamento.numeroFiliacao) {
      const ret2 = await useCustomFetch("getNovoNumeroFiliacao", "post", { esporte: geral.entidade.esportes[0]._id, temporario: filiacaoPessoaLancamento.temporaria }, undefined);
      filiacaoPessoaLancamento.numeroFiliacao = ret2.data.numero;
    }

    let retGrava = false;
    if (!ret.semPagamento) {
      // // console.log("Tem pAg");
      filiacaoPessoaLancamento.pagamento = ret.data._id;
      retGrava = (await gravaFiliacao("Confimado o pagamento das taxas em " + ret.data.tipo + " e alterado o Status para (Em Análise).", filiacaoPessoaLancamento));
    } else {
      // // console.log("N Tem pAg");
      retGrava = (await gravaFiliacao("Alterado o Status para (Em Análise).", filiacaoPessoaLancamento));
    }

    if (retGrava) {
      filiacaoPessoaLancamento.pagamento = ret.data;

      let newHistorico = [];

      // clona o historico da processo de filiação para o historico da filiação pessoa
      for (let index = 0; index < filiacaoPessoaLancamento.historico.length; index++) {
        const element = filiacaoPessoaLancamento.historico[index];
        let newElement = JSON.parse(JSON.stringify(element));
        newElement._id = undefined;
        newHistorico.push(newElement);
      }

      for (let index = 0; index < filiacaoPessoaLancamento.entidades.length; index++) {
        const entidade = filiacaoPessoaLancamento.entidades[index];
        const filiacaoPessoa = {
          filiacaoPessoaLancamento: filiacaoPessoaLancamento._id,
          pagamento: ret.semPagamento ? undefined : ret.data._id,
          entidade: entidade._id,
          abrangencia: entidade.abrangencia,
          esporte: geral.entidade.esportes[0]._id,
          pessoa: filiacaoPessoaLancamento.pessoa,
          temporaria: filiacaoPessoaLancamento.temporaria,
          numero: filiacaoPessoaLancamento.numeroFiliacao,
          dataPedido: new Date().toISOString(), // Data em que foi solicitada a filiação
          dataExpiracao: filiacaoPessoaLancamento.temporaria ? getDataMais4Meses() : undefined, // Data de expiração da filiação
          status: "Em Análise",
          historico: newHistorico,
        };

        const ret3 = await useCustomFetch("filiacaoPessoa", "post", filiacaoPessoa, undefined);
        if (!ret3.valido) {
          $q.notify({
            color: "negative",
            message: "Falha ao criar filiação pessoa para a entidade " + entidade.sigla + ".",
          });
        } else {
          filiacaoPessoaLancamento.filiacoesGeradas.push(ret3.data._id);
        }
      }
      retGrava = (await gravaFiliacao(undefined, filiacaoPessoaLancamento));
      await getFiliacaoPessoa();

      $q.notify({
        color: "positive",
        message: !ret.semPagamento ? "Pagamento realizado com sucesso!" : "Filiação enviada com sucesso!",
      });
    } else {
      filiacaoPessoaLancamento.pagamento = ret.data;
      $q.notify({
        color: "negative",
        message: "Falha ao atualizar processo de filiação!",
      });
    }
  } else {
    $q.notify({
      color: "negative",
      message: "Falha ao realizar pagamento!",
    });
  }
};

const verificaSeTemTef = async (filiacao) => {
  try {
    const ret = await useCustomFetch(`tef/getPopulate`, "post", { filtro: { identificador: filiacao._id } }, undefined);
    console.log(ret);
    if (ret.valido && ret.data.length > 0) {
      $q.notify({
        color: "positive",
        message: "Tem TEF",
      });
    } else {
      $q.notify({
        color: "negative",
        message: "Não tem TEF",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getList = async () => {
  $q.loading.show({
    spinner: QSpinnerOval,
    spinnerColor: "white",
    spinnerSize: 60,
    message: "Buscando Dados... Aguarde!",
    messageColor: "white",
  });

  try {
    const ret = await useCustomFetch(
      "filiacaoPessoaLancamento/getPopulate",
      "post",
      {
        filtro: {
          lixo: false,
          status: filtro.value.status || undefined,
          created_at:
            filtro.value.inicio || filtro.value.fim
              ? {
                  $gte: filtro.value.inicio ? new Date(filtro.value.inicio) : undefined,
                  $lte: filtro.value.fim ? new Date(filtro.value.fim) : undefined,
                }
              : undefined,
        },
        populateObj: [
          {
            path: "pessoa",
            select: { nome: 1, foto: 1 },
          },
          { path: "entidades", populate: ["filiacaoPessoa.taxaFiliacao", "filiacaoPessoa.taxaFiliacaoTemporaria"] },
          {
            path: "pagamento",
            pupulate: {
              path: "pagamento",
              select: { tipo: 1, tef: 1 },
            },
          },
        ],
      },
      undefined
    );
    // // console.log('Leu o Banco de dados.');
    if (ret.valido) {
      rows.value = ret.data;
      $q.loading.hide();
    } else {
      rows.value = [];
      $q.loading.hide();
      $q.notify({
        color: "negative",
        message: ret.data && ret.data.message ? ret.data.message : "Falha ao obter a lista de acessos!",
      });
    }
  } catch (error) {
    $q.loading.hide();
  }
};

const exportCSV = async () => {
  let CSV = "";
  for (let index = 0; index < columns.value.length; index++) {
    const col = columns.value[index];
    if (col.field && col.name != "foto") CSV += col.label + ";";
  }

  CSV += "Inscritos;";

  CSV += "\r\n";
  for (let index = 0; index < rows.value.length; index++) {
    const row = rows.value[index];
    CSV += row._id + ";" + row.pessoa.nome + ";" + $geralService.getDataHoraFormatada(row.created_at) + ";" + row.pagamento.tipo + ";" + $geralService.numeroParaMoeda(row.totalBruto) + ";" + row.status + ";" + row.inscritos.length;
    CSV += "\r\n";
  }

  let fileName = "inscricoes_ate_" + filtro.value.numero + $geralService.getDataHoraFormatada(new Date()).replaceAll(" ", "-").replaceAll(":", "-");
  let uri = "data:text/csv;charset=utf-8," + escape(CSV);
  let link = document.createElement("a");
  link.href = uri;
  // @ts-ignore
  link.style = "visibility:hidden";
  link.download = fileName + ".csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return { valido: true, data: { message: "CSV gerado com sucesso!" } };
};

const gerarRateio = async () => {
  await getList();
  // let listaInscricoes = [];
  for (let index = 0; index < rows.value.length; index++) {
    const fili = rows.value[index];
    if (fili.estagioRateio == "Finalizado") {
      console.log("Inscrição com o rateio já finalizado");
      continue;
    }
    if (fili.status == "Em Análise" || fili.status == "Concluída" || fili.status == "Aguardando Pagamento") {
      console.log("Arranjo gerado com sucesso");

      let totalArranjoEntidades = 0;
      let listaTotalArranjos = [];
      for (const key in arranjoEntidades) {
        if (Object.hasOwnProperty.call(arranjoEntidades, key)) {
          const element = arranjoEntidades[key];
          totalArranjoEntidades += element.valor;
          listaTotalArranjos.push(element);
        }
      }

      if (i.evento.taxaAzimuteCertoAbsorver) {
        let valor = $geralService.arredonda(i.subtotal - (i.subtotal * i.evento.taxaAzimuteCerto) / 100);
        if ($geralService.arredonda(totalArranjoEntidades) != valor) {
          console.log("Falha ao gerar arranjo de pagamento");
          console.log(i);
          return;
        }
      } else {
        if ($geralService.arredonda(totalArranjoEntidades) != i.subtotal) {
          console.log("Falha ao gerar arranjo de pagamento");
          console.log(i);
          return;
        }
      }

      if (validador.saldo != 0) {
        console.log("Falha ao gerar arranjo de pagamento");
        console.log(i);
        return;
      } else {
        const retCons = await useCustomFetch("pagamentoRateio/getPopulate", "post", { filtro: { pagamento: i.pagamento._id }, select: { _id: 1 } }, undefined);
        if (retCons.valido) {
          if (retCons.data.length > 0) {
            console.log("Erro Pagamento de rateio já gerado");
            return;
          }
        } else {
          console.log("Falha ao consultar pagamento de rateio");
          console.log(retCons);
          return;
        }

        // console.log(i);
        i.estagioRateio = "Iniciado";
        const ret = await useCustomFetch("inscricao/" + i._id, "put", i, undefined);
        if (ret.valido) {
          console.log("Inscrição atualizada com sucesso");

          for (let index = 0; index < listaTotalArranjos.length; index++) {
            const element = listaTotalArranjos[index];

            const ret2 = await useCustomFetch("pagamentoRateio", "post", getObjetoRateio(i, element), undefined);
            if (ret2.valido) {
              console.log("Pagamento de rateio gerado com sucesso");
            } else {
              console.log("Falha ao gerar pagamento de rateio");
              console.log(ret2);
              return;
            }
          }

          const ret3 = await useCustomFetch("pagamento/" + fili.pagamento._id, "put", getObjetoUpdatePagamento(fili, listaTotalArranjos), undefined);

          if (ret3.valido) {
            console.log("Pagamento atualizado com sucesso");
            i.estagioRateio = "Iniciado";
            const ret4 = await useCustomFetch("filiacaoPessoaLancamento/" + i._id, "put", { estagioRateio: "Finalizado" }, undefined);
            if (ret4.valido) {
              console.log("Inscrição atualizada com sucesso e geradados os reteios com sucesso");
            } else {
              console.log("Falha ao atualizar inscrição");
              console.log(ret4);
              return;
            }
          } else {
            console.log("Falha ao atualizar pagamento");
            console.log(ret3);
            return;
          }

          // console.log(i);
          // // Só vai fazer a primera para teste mesmo depois tem que tirar
          // return;
        } else {
          console.log("Falha ao atualizar inscrição");
          console.log(ret);
          return;
        }
      }
    }
  }
  // console.log(listaInscricoes);
};

const getObjetoRateio = (i, arranjo) => {
  let dtLiberado = i.created_at;
  let dtPrevisao = i.created_at;
  let lb = true;
  let st = "Liberado";
  if (i.pagamento.tipo != "PIX") {
    let dataInscricaoMais30dias = new Date(i.created_at);
    dataInscricaoMais30dias.setDate(dataInscricaoMais30dias.getDate() + 30);
    dtLiberado = undefined;
    dtPrevisao = dataInscricaoMais30dias;
    st = "Pendente";
    lb = false;
  }

  return {
    entidade: arranjo.entidade,
    financeiroConta: arranjo.financeiroConta,
    identificador: i._id,
    pagamento: i.pagamento._id,
    tipo: "Inscrição",
    evento: i.evento._id,
    valor: arranjo.valor,
    liberado: lb, // Confirma que gerou saldo para a conta da entidade
    dataLiberado: dtLiberado, // Data em que o valor foi liberado
    dataPrevisao: dtPrevisao, // Data aproximada em que o valor estará disponível
    status: st,
  };
};
const getObjetoUpdatePagamento = (i, listaArranjo) => {
  let dtLiberado = i.created_at;
  let dtPrevisao = i.created_at;
  let lb = true;
  if (i.pagamento.tipo != "PIX") {
    let dataInscricaoMais30dias = new Date(i.created_at);
    dataInscricaoMais30dias.setDate(dataInscricaoMais30dias.getDate() + 30);
    dtLiberado = undefined;
    dtPrevisao = dataInscricaoMais30dias;
  }
  return { evento: i.evento._id, arranjoPagamento: listaArranjo, somaDoRateioValidada: true, dataPrevisao: dtPrevisao, dataLiberado: dtLiberado, liberado: lb };
};

const verificaCadUnico = (item) => {
  for (let index = 0; index < item.descontos.length; index++) {
    if (item.descontos[index].cadUnico) {
      item.cadUnico = true;
      return true;
    }
  }
  return false;
};

const gerarArranjoConsumivel = (item, inscricao, validador, arranjoEntidades) => {
  console.log("dividindo valores");
  if (item.valorTotal <= 0 || item.equipamentoProprio) {
    return [];
  }

  let saldo = item.valorTotal;

  if (inscricao.evento.taxaAzimuteCertoAbsorver) {
    // saldo - 6%
    saldo = saldo - $geralService.arredonda((saldo * inscricao.evento.taxaAzimuteCerto) / 100);
  }

  const arranjoCalculado = [];

  // Deduzir os valores fixos independente de qualquer coisa
  for (let index2 = 0; index2 < item.consumivel.arranjoPagamento.length; index2++) {
    const arranjo = item.consumivel.arranjoPagamento[index2];
    if (arranjo.tipo == "Valor") {
      if (saldo > arranjo.valor) {
        addValorArranjoEntidade(arranjoEntidades, arranjo, arranjo.valor);

        arranjoCalculado.push({
          entidade: arranjo.entidade._id,
          financeiroConta: arranjo.financeiroConta,
          valor: arranjo.valor,
        });
        saldo -= arranjo.valor;
      } else {
        arranjoCalculado.push({
          entidade: arranjo.entidade._id,
          financeiroConta: arranjo.financeiroConta,
          faltouSaldo: true,
          valor: 0,
        });
      }
    }
  }

  if (item.cadUnico) {
    // Se cadUnico retorna todo o saldo para o responsável
    //Procura a entidade responsável e coloca o saldo restante
    for (let index2 = 0; index2 < item.consumivel.arranjoPagamento.length; index2++) {
      const arranjo = item.consumivel.arranjoPagamento[index2];
      if (arranjo.tipo == "Percentual" && arranjo.entidade._id == inscricao.evento.entidadeResponsavel._id) {
        addValorArranjoEntidade(arranjoEntidades, arranjo, saldo);
        arranjoCalculado.push({
          entidade: arranjo.entidade._id,
          financeiroConta: arranjo.financeiroConta,
          valor: $geralService.arredonda(saldo),
        });
        validador.saldo -= item.valorTotal;
        item.arranjoPagamento = arranjoCalculado;
        return true;
      }
    }
    // não achou a entidade responsável nos arranjos;
    return false;
  }

  // Deduzir os valores percentuais das outras entidades que não são a responsável
  for (let index2 = 0; index2 < item.consumivel.arranjoPagamento.length; index2++) {
    const arranjo = item.consumivel.arranjoPagamento[index2];
    if (arranjo.tipo == "Percentual" && arranjo.entidade._id != inscricao.evento.entidadeResponsavel._id) {
      let novoValor = $geralService.arredonda((arranjo.valor / 100) * item.valorTotal);
      if (!item.cadUnico) {
        addValorArranjoEntidade(arranjoEntidades, arranjo, novoValor);
        arranjoCalculado.push({
          entidade: arranjo.entidade._id,
          financeiroConta: arranjo.financeiroConta,
          valor: novoValor,
        });
        saldo -= novoValor;
      }
    }
  }

  if (saldo == 0) {
    validador.saldo -= item.valorTotal;
    item.arranjoPagamento = arranjoCalculado;
    return true;
  }

  if (saldo < 0) {
    console.log("distrubuição dos valores falhou");
    return false;
  }

  //Procura a entidade responsável e coloca o saldo restante
  for (let index2 = 0; index2 < item.consumivel.arranjoPagamento.length; index2++) {
    const arranjo = item.consumivel.arranjoPagamento[index2];
    if (arranjo.tipo == "Percentual" && arranjo.entidade._id == inscricao.evento.entidadeResponsavel._id) {
      addValorArranjoEntidade(arranjoEntidades, arranjo, saldo);
      arranjoCalculado.push({
        entidade: arranjo.entidade._id,
        financeiroConta: arranjo.financeiroConta,
        valor: $geralService.arredonda(saldo),
      });
      validador.saldo -= item.valorTotal;
      item.arranjoPagamento = arranjoCalculado;
      return true;
    }
  }
  return false;
};

const addValorArranjoEntidade = (arranjoEntidades, arranjo, vlr) => {
  if (arranjoEntidades[arranjo.entidade._id]) {
    arranjoEntidades[arranjo.entidade._id].valor += $geralService.arredonda(vlr);
  } else {
    arranjoEntidades[arranjo.entidade._id] = { entidade: arranjo.entidade._id, valor: $geralService.arredonda(vlr), financeiroConta: arranjo.financeiroConta };
  }
};

const deleteRow = async (index, inscricao) => {
  if (geral.pessoa._id === "5aff4d2f47667633c7ace227" && inscricao.status != "Finalizada") {
    $q.dialog({
      title: "Excluir",
      message: "Deseja realmente excluir o registro?",
      cancel: true,
      persistent: true,
    })
      .onOk(async () => {
        $q.loading.show({
          spinner: QSpinnerOval,
          spinnerColor: "white",
          spinnerSize: 60,
          message: "Excluindo Registro... Aguarde!",
          messageColor: "white",
        });
        try {
          // primeiro excluir o pagamento
          // console.log(inscricao.pagamento._id )
          // console.log(inscricao._id )

          const ret = await useCustomFetch("pagamento/delete", "post", { _id: inscricao.pagamento._id }, undefined);
          if (ret.valido) {
            const ret2 = await useCustomFetch("inscricao/delete", "post", { _id: inscricao._id }, undefined);
            if (ret2.valido) {
              rows.value.splice(index, 1);
              $q.loading.hide();
              $q.notify({
                color: "positive",
                message: "Registro excluído com sucesso!",
              });
              getList();
            } else {
              console.log(ret2);
              $q.loading.hide();
              $q.notify({
                color: "negative",
                message: ret.data && ret.data.message ? ret.data.message : "Falha ao excluir o registro!",
              });
            }
          } else {
            $q.loading.hide();
            $q.notify({
              color: "negative",
              message: ret.data && ret.data.message ? ret.data.message : "Falha ao excluir o registro!",
            });
          }
        } catch (error) {
          $q.loading.hide();
        }
      })
      .onCancel(() => {});
  }
};

const editRow = (index, id, copy) => {
  if (geral.funcoesAcessos.consumivelEditar) {
    openModal(index, id, copy);
  }
};

const openModal = (index, id, copy) => {
  idSelecionado.value = id;
  indexSelecionado.value = index;

  $q.dialog({
    component: InscricaoModal,
    persistent: true,
    componentProps: {
      id: idSelecionado.value,
    },
  })
    .onOk(async (data) => {
      confirmSave(data);
    })
    .onCancel(() => {});
};

const confirmSave = (obj) => {
  if (inserir.value) {
    rows.value.push(obj);
    $q.loading.hide();
  } else {
    getList();
  }
  indexSelecionado.value = -1;
};
</script>

<style scoped>
.truncate {
  width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
