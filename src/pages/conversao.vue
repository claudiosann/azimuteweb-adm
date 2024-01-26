<template>
  <div class="container p-4">
    <div>Conversao de dados</div>

    <div v-if="!logado">
      <div v-if="!logado" class="grid grid-cols-12 gap-2">
        <q-input class="col-span-3" label="Login" v-model="pessoaAzimute.login" type="text" :rules="[(val) => !!val || 'Campo Obrigatório']" />
        <q-input class="col-span-3" label="Senha" v-model="pessoaAzimute.senha" :type="isPwd ? 'password' : 'text'" :rules="[(val) => !!val || 'Campo Obrigatório']">
          <template v-slot:append>
            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
          </template>
        </q-input>
      </div>
      <q-btn class="" v-if="pessoaAzimute.login && pessoaAzimute.senha" color="primary" icon="check" label="Login" @click="login" />
    </div>

    <div v-if="logado">
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-12">{{ pessoaAzimute.usuario.nome }} - {{ pessoaAzimute.usuario.numero }}</div>
      </div>
      <q-btn color="primary" icon="check" label="logout" @click="logout" />
      <!-- <q-btn color="primary" icon="check" label="Converter Entidades" @click="converterEntidades" /> -->
      <!-- <q-btn color="primary" icon="check" label="Converter Evento" @click="converterEvento" /> -->
      <q-btn color="primary" icon="check" label="Converter Evento" @click="ajustarTodosOsTelefones" />
      <!-- <q-btn color="primary" icon="check" label="getImagem evento 45 " @click="getImagem(12656)" /> -->
      <!-- <q-btn color="primary" icon="check" label="Converter Modelo" @click="conveterModeloCategoria" /> -->
      <!-- <q-btn color="primary" icon="check" label="Converter Pessoa" @click="converterPessoas" /> -->
      <!-- <q-btn color="primary" icon="check" label="AjustaCPF" @click="ajustaCPF()" /> -->
      <!-- <q-btn color="primary" icon="check" label="Converter Grupos de Notícias" @click="converterGrupoNoticias" /> -->
      <!-- <q-btn color="primary" icon="check" label="Converter Notícias" @click="converterNoticias" /> -->
      <!-- <q-btn color="primary" icon="check" label="Converter Conteudo" @click="converterConteudo" /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
// @ts-ignore
import md5 from "js-md5";
import PessoasFiliadas from "./cadastro/pessoas-filiadas.vue";
const logado = ref(false);
const $dayjs = useDayjs();
const pessoaAzimute = ref<any>({ login: "suporte", senha: "3411" });

const { $geralService } = useNuxtApp();
const isPwd = ref(true);
const $q = useQuasar();

const mapeamentoDificuldade: { [key: string]: number } = {
  N: 0,
  B: 1,
  A: 2,
  E: 3,
};

const ajustarTodosOsTelefones = async () => {
  const ret = await useCustomFetch('pessoa/getPopulate', 'post', { filtro: {}, select: { _id: 1, idAntigo: 1 } }, undefined);
  if (ret.valido) {
    for (let index = 0; index < ret.data.length; index++) {
      const pessoa = ret.data[index];
      pessoa.id = pessoa.idAntigo;
      // console.log(index);

      await ajustaTelefones(pessoa);
          const retGrava = await useCustomFetch('pessoa/' + pessoa._id, 'put', pessoa, undefined);  
      if (!retGrava.valido) {
                      // console.log(index);
            // console.log('Erro ao atualizar pessoa', pessoa);
            // console.log('Erro ao atualizar pessoa', retGrava);
            return;
          } 
        }    
  } else {
    // console.log('Erro ao buscar pessoas', ret);
  }
}
const ajustaTelefones = async (element: any) => {
  const formTeletone = {
    tabelas: [{ nome: "pessoa_telefone", nomeAs: "pessoa_telefone" }],
    campos: [],
    condicoes: [
      { campo: "pessoa_telefone.lixo", condicao: "<>", valor: true },
      { campo: "pessoa_telefone.pessoa_id", condicao: "=", valor: element.id },
    ],
  };
  const retTel = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formTeletone }, undefined);
  element.telefones = [];
  if (retTel.valido && retTel.data.json) {
    if (retTel.data.json.listaGenerica.length > 0) {
      for (let index = 0; index < retTel.data.json.listaGenerica.length; index++) {
        const elementTel = retTel.data.json.listaGenerica[index];
        const tel = $geralService.removeMascara(elementTel.telefone);
        if (tel && tel.length > 5) {
          element.telefones.push({
            tipo: ["Celular", "Residencial", "Comercial"].includes(elementTel.tipo) ? elementTel.tipo : "Celular",
            numero: tel,
            complemento: elementTel.complemento,
            principal: index == 0 ? true : false,
            whatsApp: element.tipo == "Celular" ? true : false,
          });
        }
      }
    }
    return true;
  }
  // console.log("erro telefones", retTel);
  return false;
};

const ajustaModalidades = (numeroEvento: number) => {
  const idModalidadeSprint = "64289eec667e59a0fe5e8a8c";
  const idModalidadePedestre = "642899b8beacbf61a8cbb29a";
  return [];
};

const converterEvento = async () => {
  const formSql = {
    tabelas: [{ nome: "evento", nomeAs: "evento" }],
    campos: [{ campo: "*" }],
    condicoes: [{ campo: "lixo", condicao: "<>", valor: true }],
    ordenacoes: [{ campo: "id desc" }],
  };

  const ret = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formSql }, undefined);
  if (ret.valido) {
    // console.log("ret", ret);
    const elementF = ret.data.json.listaGenerica;
    let retString = JSON.stringify(elementF);
    const retornoAjustado = JSON.parse(retString.replaceAll("{}", "null"));
    // console.log("retornoAjustado", retornoAjustado.length);

    //for (let index = 0; index < retornoAjustado.length; index++) {
    for (let index = 430; index < retornoAjustado.length; index++) {
    
      // console.log(index);
      const element = retornoAjustado[index];

      let entidadeResponsavel: any = { _id: "5d6934fc9b35767d7398c823", idAntigo: 1 };

      let encontrouEntidade = false;
      if (element.entidade_id) {
        const retEntidade = await useCustomFetch("entidade/getPopulate", "post", { filtro: { idAntigo: element.entidade_id }, select: { _id: 1, idAntigo: 1 } }, undefined);
        if (retEntidade.valido) {
          if (retEntidade.data.length > 0) {
            entidadeResponsavel = retEntidade.data[0];
            encontrouEntidade = true;
          }
        }
      }
      if (!encontrouEntidade) {
        const retEntidade = await useCustomFetch("entidade/getPopulate", "post", { filtro: { idAntigo: element.entidade_pai_id }, select: { _id: 1, idAntigo: 1 } }, undefined);
        if (retEntidade.valido) {
          if (retEntidade.data.length > 0) {
            entidadeResponsavel = retEntidade.data[0];
          }
        }
      }

      const etapaObj = ajustaEtapa(element.etapa);

      const evento = {
        entidadeResponsavel: entidadeResponsavel._id,
        modalidadesEsportivas: ajustaModalidades(element.id), // Orientação // Corrida de Aventura
        esportes: [], // Orientação // Corrida de Aventura
        tags: [],
        nome: element.descricao ? element.descricao : "Evento de Orientação " + element.id,
        rota: element.id.toString(),
        descritivo: etapaObj.descritivo ? etapaObj.descritivo : "-", //ex. Percurso Tradicional de Orientação Pedestre
        online: element.descricao.toUpperCase().includes("ONLINE") || element.descricao.toUpperCase().includes("VIRTUAL"),
        cancelado: false,
        adiado: false,
        canceladoMotivo: false,
        sigla: element.sigla ? element.sigla : $geralService.getIniciaisCompleto(element.descricao),
        ano: getAno(element.inicio),
        etapa: etapaObj.etapa,
        abrangencia: getAbrangenciaEvento(element.abrangencia),
        tipoEvento: "Participação",
        publicado: true,
        pontuaRankingNacional: false,
        pontuaRankingEstadual: false,
        endereco: getEnderecoEvento(element),
        inicio: element.inicio ? getISODate(element.inicio) : new Date().toISOString(),
        fim: element.fim ? getISODate(element.fim) : element.inicio ? getISODate(element.inicio) : new Date().toISOString(),
        imagem: await getImagem(element.id),
        numero: element.id,
        taxaAzimuteCerto: 6,
        taxaAzimuteCertoAbsorver: true, //Por padrão é cobrado do cliente a taxa Administrativa - Se verdadeiro a taxa é absorvida.
        administradores: [],
        grupoLinks: await getGruposLinks(element.id),
        contatos: [
          {
            nome: "Responsável",
            imagem: "",
            cargo: "Encarregado",
            telefone: "",
            email: element.contato ? element.contato : "",
          },
        ],
        videos: [],
        fotos: [],
        programacoes: [],
        conteudos: [],
        parceiros: [],
        hospedagens: [],
        pontosTuristicos: [],
        banners: [],
        lixo: false,
        created_at: element.inicio ? getISODate(element.inicio) : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const retGrava = await useCustomFetch("evento", "post", evento, undefined);
      if (retGrava.valido) {
        // // console.log("evento", evento.nome, "inserida com sucesso");
      } else {
        // console.log("Erro ao inserir evento", evento);
        // console.log("Erro ao inserir evento", element);
        return;
      }
    }
  } else {
    // console.log("Erro ao buscar evento", ret);
  }
};

const getGruposLinks = async (eventoNumero: number) => {
  const formSql = {
    tabelas: [{ nome: "evento_links", nomeAs: "evento_links" }],
    campos: [{ campo: "*" }],
    condicoes: [
      { campo: "lixo", condicao: "<>", valor: true },
      { campo: "evento_id", condicao: "=", valor: eventoNumero },
    ],
  };

  const gruposLink: any = [];

  const findGrupo = (tipo: number) => {
    for (let index = 0; index < gruposLink.length; index++) {
      if (gruposLink[index].tipo == tipo) {
        return gruposLink[index];
      }
    }
    return null;
  };

  const ret = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formSql }, undefined);
  if (ret.valido) {
    // // console.log("ret", ret);
    const elementF = ret.data.json.listaGenerica;
    let retString = JSON.stringify(elementF);
    const retornoAjustado = JSON.parse(retString.replaceAll("{}", "null"));
    // // console.log("retornoAjustado", retornoAjustado.length);

    for (let index = 0; index < retornoAjustado.length; index++) {
      // // console.log("executando o index", index);
      const element = retornoAjustado[index];
      if (element.link && element.descricao && element.evento_categorias_id) {
        let grupoLink: any = null;
        grupoLink = findGrupo(element.evento_categorias_id);
        // // console.log("indexGruposLink", grupoLink);

        const likEvento = ajustaLinkEvento(element.link);
        // // console.log("elemnt", element);
        if (likEvento == null) {
          // console.log("link invalido", element);
          return;
        }

        if (grupoLink !== null) {
          grupoLink.links.push({
            descricao: element.descricao,
            url: likEvento,
          });
        } else {
          const grupoLink: any = constGetNovoGrupo(element.evento_categorias_id);
          grupoLink.links.push({
            descricao: element.descricao,
            url: likEvento,
          });
          gruposLink.push(grupoLink);
        }
      }
    }
    return gruposLink;
  } else {
    // console.log("Erro ao liks do evento", ret);
    return;
  }
};

const constGetNovoGrupo = (tipo: number) => {
  const listDescricoes = [
    { descricao: "Documentos", icone: "fas fa-folder" },
    { descricao: "Resultados", icone: "fas fa-list-ol" },
    { descricao: "Listas de Partida", icone: "fas fa-list" },
    { descricao: "Fotos", icone: "fas fa-image" },
    { descricao: "Finanças", icone: "fas fa-folder" },
    { descricao: "Boletim", icone: "fas fa-folder" },
    { descricao: "Benefícios", icone: "fas fa-folder" },
    { descricao: "Vídeos", icone: "fas fa-video" },
    { descricao: "Importante", icone: "fas fa-folder" },
    { descricao: "SAOC", icone: "fas fa-folder" },
    { descricao: "INSCRIÇÕES", icone: "fas fa-folder" },
    { descricao: "Aluguel SIAC", icone: "fas fa-folder" },
    { descricao: "Informativos", icone: "fas fa-folder" },
    { descricao: "Treinamento", icone: "fas fa-folder" },
    { descricao: "Materiais", icone: "fas fa-folder" },
    { descricao: "Estatísticas do Evento", icone: "fas fa-chart-line" },
    { descricao: "Premiação", icone: "fas fa-trophy" },
    { descricao: "1ª ETAPA - FOG - 08/08/2020", icone: "fas fa-folder" },
    { descricao: "2ª ETAPA - FORJ - 29/08/2020", icone: "fas fa-folder" },
    { descricao: "3ª ETAPA - FPO/COC - 12/09/2020", icone: "fas fa-folder" },
    { descricao: "4ª ETAPA - FBO - 26/09/2020", icone: "fas fa-folder" },
    { descricao: "5ª ETAPA - FOSP - 10/10/2020", icone: "fas fa-folder" },
    { descricao: "RANKING", icone: "fas fa-trophy" },
    { descricao: "CERTIFICADOS", icone: "fas fa-award" },
    { descricao: "TIRE SUAS DÚVIDAS!", icone: "fas fa-question" },
    { descricao: "Regulamentos (Regulation)", icone: "fas fa-book" },
    { descricao: "Importante", icone: "fas fa-folder" },
    { descricao: "Anexos", icone: "fas fa-papperclip" },
  ];

//  // console.log("tipo", tipo);
  return {
    descricao: listDescricoes[tipo - 1].descricao,
    icone: listDescricoes[tipo - 1].icone,
    tipo: tipo,
    expanded: false,
    links: [],
  };
};

const getImagem = async (eventoId: number) => {
  // // console.log("CBO/site-antigo/Eventos/Banners/" + eventoId + ".jpg");
  const ret: any = await useCustomFetch(
    "api/listObjectsS3",
    "post",
    {
      caminho: "CBO/site-antigo/Eventos/Banners/" + eventoId + ".jpg",
    },
    undefined
  );

  if (ret.valido) {
    if (ret.data.Contents.length > 0) {
      // // console.log(ret.data.Contents[0].Key);
      return ret.data.Contents[0].Key;
    } else {
      // // console.log("CBO/site-antigo/Eventos/Banners/banner-padrao.png");
      return "CBO/site-antigo/Eventos/Banners/banner-padrao.png";
    }
  }
};

const getEnderecoEvento = (eventAntigo: any) => {
  const endereco: any = {
    pais: "Brasil",
    logradouro: "-",
    numero: 0,
    cep: "00000000",
    bairro: "-",
    cidade: "-",
    uf: "DF",
    complemento: "",
    proximidade: "",
    localizacao: {
      lat: -15.7990489,
      lng: -47.8607689,
    },
    cepValidado: false,
    googleValidado: false,
  };

  if (eventAntigo.pais) {
    endereco.pais = eventAntigo.pais;
  }

  if (eventAntigo.estado) {
    endereco.uf = getUf( eventAntigo.estado ?  eventAntigo.estado  : 0)
  }

  if (eventAntigo.cidade) {
    endereco.cidade = eventAntigo.cidade;
  }

  if (eventAntigo.endereco) {
    endereco.logradouro = eventAntigo.endereco;
  }

  if (eventAntigo.latitude) {
    endereco.localizacao.lat = eventAntigo.latitude;
  }

  if (eventAntigo.longitude) {
    endereco.localizacao.lng = eventAntigo.longitude;
  }

  return endereco;
};

const getAbrangenciaEvento = (abrangeciaId: number) => {
  switch (abrangeciaId) {
    case 57:
      return "Municipal";
    case 58:
      return "Estadual";
    case 59:
      return "Regional";
    case 60:
      return "Nacional";
    case 61:
      return "Mundial";
    default:
      return "Municipal";
  }
};

const ajustaEtapa = (etapaString: string) => {
  const etapas = ["Única", "Primeira", "Segunda", "Terceira", "Quarta", "Quinta", "Sexta", "Sétima", "Oitava"];

  const retEt = determinarEtapa(etapaString);

  return { etapa: etapas[retEt.numero], descritivo: retEt.descritivo };
};

const determinarEtapa = (etapaString: string): any => {
  // Remove espaços no início e no final
  const etapa = etapaString.trim();

  // Verifica se a etapa é única
  if (etapa.toLowerCase() === "única") {
    return { numero: 0 };
  }

  // Procura por números seguidos de 'ª' ou 'º' na string
  const numero = etapa.match(/(\d+)(?:ª|º)/i);
  if (numero) {
    return { numero: parseInt(numero[1]) };
  }

  // Procura por números romanos seguidos de espaço na string
  const romanos = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  for (let i = 0; i < romanos.length; i++) {
    if (etapa.startsWith(romanos[i] + " ")) {
      return { numero: i + 1 }; // Retorna o índice + 1, pois os índices começam em 0
    }
  }

  // Procura por números escritos por extenso na string
  const extenso = ["primeira", "segunda", "terceira", "quarta", "quinta", "sexta", "sétima", "oitava", "nona", "décima"];
  for (let i = 0; i < extenso.length; i++) {
    if (etapa.toLowerCase().startsWith(extenso[i])) {
      return { numero: i + 1 }; // Retorna o índice + 1, pois os índices começam em 0
    }
  }

  // Se não for possível identificar a etapa, retorna 0
  return { numero: 0, descritivo: etapa };
};

const conveterModeloCategoria = async () => {
  const formSql = {
    tabelas: [{ nome: "categoria_modelo", nomeAs: "categoria_modelo" }],
    campos: [{ campo: "*" }],
    condicoes: [{ campo: "lixo", condicao: "<>", valor: true }],
  };

  const ret = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formSql }, undefined);
  if (ret.valido) {
    // console.log("ret", ret);
    const elementF = ret.data.json.listaGenerica;
    let retString = JSON.stringify(elementF);
    const retornoAjustado = JSON.parse(retString.replaceAll("{}", "null"));
    // console.log("retornoAjustado", retornoAjustado.length);

    for (let index = 0; index < retornoAjustado.length; index++) {
      // console.log("executando o index", index);
      const element = retornoAjustado[index];

      const modeloCategoria: any = {
        _id: index == 1 ? "5f0e466efb3dde11e2394c3c" : index == 0 ? "5e13df559615c3438fdc9bae" : undefined,
        descricao: element.descricao,
        modalidadesEsportivas: ["642899b8beacbf61a8cbb29a", "64289eec667e59a0fe5e8a8c"],
        categorias: [],
        tipo: "Individual",
        idAntigo: element.id,
        lixo: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (!(await ajustaCategoriasAntigas(modeloCategoria))) {
        return;
      }

      const retGrava = await useCustomFetch("modeloCategoria", "post", modeloCategoria, undefined);
      if (retGrava.valido) {
        // console.log("modeloCategoria", modeloCategoria.nome, "inserida com sucesso");
      } else {
        // console.log("Erro ao inserir modeloCategoria", modeloCategoria);
        // console.log("Erro ao inserir modeloCategoria", element);
        return;
      }
    }
  } else {
    // console.log("Erro ao buscar modelo_categoria", ret);
  }
};

const converterConteudo = async () => {
  const retEntidades = await useCustomFetch("entidade/getPopulate", "post", { filtro: {}, select: { _id: 1, idAntigo: 1 } }, undefined);
  if (retEntidades.valido) {
    // console.log("iniciando");
    for (let index5 = 0; index5 < retEntidades.data.length; index5++) {
      const entidadeEl = retEntidades.data[index5];

      const formSql = {
        tabelas: [{ nome: "conteudo", nomeAs: "conteudo" }],
        campos: [{ campo: "*" }],
        condicoes: [
          { campo: "lixo", condicao: "<>", valor: true },
          { campo: "entidade_pai_id", condicao: "=", valor: entidadeEl.idAntigo },
        ],
      };

      const ret = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formSql }, undefined);
      if (ret.valido && ret.data.json) {
        // console.log("entidade", entidadeEl.idAntigo);
        const elementF = ret.data.json.listaGenerica;
        let retString = JSON.stringify(elementF);
        const retornoAjustado = JSON.parse(retString.replaceAll("{}", "null"));
        // // console.log("retornoAjustado", retornoAjustado.length);

        for (let index = 0; index < retornoAjustado.length; index++) {
          // console.log("executando o index", index);
          const element = retornoAjustado[index];

          // // console.log('imagem old', element.imagem);
          // // console.log('new imagem',ajustaLink(element.imagem));
          let htmlConteudo = " ";
          if (element.conteudo_html) {
            const links = findLinks(element.conteudo_html);
            htmlConteudo = element.conteudo_html;
            // // console.log("links", links);

            let novoHtml = false;
            if (htmlConteudo) {
              for (let index = 0; index < links.length; index++) {
                const oldLink = links[index];
                const newLink = getNewLink(oldLink);
                if (newLink) {
                  htmlConteudo = htmlConteudo.replace(oldLink, newLink);
                  // console.log("substituiu", oldLink, newLink);
                  novoHtml = true;
                }
              }
              if (novoHtml) {
                // // console.log("novo html", htmlConteudo);
                // // console.log("newLinks", newLinks);
              }
            }
          }
          const conteudo: any = {
            entidade: entidadeEl._id,
            titulo: element.titulo,
            subTitulo: element.sub_titulo,
            numero: element.id,
            rota: element.id.toString(),
            tags: element.tags ? element.tags.split(",") : [],
            conteudoHtml: htmlConteudo || "",
            albuns: [],
            imagem: element.imagem ? ajustaLink(element.imagem) : "",
            lixo: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const retGrava = await useCustomFetch("conteudo", "post", conteudo, undefined);
          if (retGrava.valido) {
            // console.log("conteudo", conteudo.numero, "inserida com sucesso");
          } else {
            // console.log("Erro ao inserir conteudo", conteudo);
            // console.log("Erro ao inserir conteudo", element);
            return;
          }
        }
      } else {
        // console.log("Erro ao buscar conteudo", ret);
        return;
      }
    }
    // // console.log("links", links);

    // const links:any = [];
    // const newLinks: any = [];
    // for (let index = 0; index < links.length; index++) {
    //   const element = links[index];
    //   newLinks.push({ oldlink: element, newLink: getNewLink(element) });
    // }
    // // console.log("newLinks", newLinks);
  } else {
    // console.log("Erro ao buscar entidades", retEntidades);
  }
};

const determinarDificuldade = (categoria: string, permiteNaofiliado: boolean): number => {
  if (permiteNaofiliado) {
    return 0;
  }
  const regex = /^([NABE]\s)|(\s[NABE])|(\d{2}[NABE])$/;
  const match = categoria.match(regex);
  if (match) {
    const ultimoCaractere = match[0].trim().slice(-1);
    return mapeamentoDificuldade[ultimoCaractere];
  }

  return 0; // Retorna 0 se não houver correspondência ou se a letra não for N, A, B ou E
};

const ajustaCategoriasAntigas = async (modelo: any) => {
  const formSql = {
    tabelas: [{ nome: "categoria", nomeAs: "categoria" }],
    campos: [{ campo: "*" }],
    condicoes: [
      { campo: "lixo", condicao: "<>", valor: true },
      { campo: "categoria_modelo_id", condicao: "=", valor: modelo.idAntigo },
    ],
  };

  const ret = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formSql }, undefined);
  if (ret.valido) {
    try {
      const elementF = ret.data.json.listaGenerica;
      let retString = JSON.stringify(elementF);
      const retornoAjustado = JSON.parse(retString.replaceAll("{}", "null"));
      modelo.categorias = [];
      for (let index = 0; index < retornoAjustado.length; index++) {
        const element = retornoAjustado[index];

        modelo.categorias.push({
          descricao: element.descricao,
          tipo: getTipo(element),
          idadeMinima: element.idade_minima,
          idadeMaxima: element.idade_maxima,
          maximoParticipantes: element.maximo_participantes ? element.maximo_participantes : 1,
          minimoParticipantes: element.minimo_participantes ? element.minimo_participantes : 1,
          minimoFeminino: element.minimo_feminino ? element.minimo_feminino : 0,
          minimoMasculino: element.minimo_masculino ? element.minimo_masculino : 0,
          maximoFeminino: element.maximo_feminino ? element.maximo_feminino : 0,
          maximoMasculino: element.maximo_masculino ? element.maximo_masculino : 0,
          nivelDificuldade: determinarDificuldade(element.descricao, element.permite_nao_filiado == 1),
          idAntigo: element.id,
          lixo: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      // console.log(error);
      // console.log("Erro ao configurar categoria", ret);
      return false;
    }
    return true;
  } else {
    // console.log("Erro ao buscar categoria", ret);
    return false;
  }
};

// ['Masculino', 'Feminino', 'Misto']
const getTipo = (categoria: any) => {
  if (categoria.maximo_participantes == 1 && categoria.minimo_participantes == 1) {
    if (categoria.minimo_feminino > 0 && !categoria.minimo_masculino && !categoria.maximo_masculino) {
      return "Feminino";
    } else if (categoria.minimo_masculino > 0 && !categoria.minimo_feminino && !categoria.maximo_feminino) {
      return "Masculino";
    } else {
      return "Misto";
    }
  }
};

const converterNoticias = async () => {
  const retEntidades = await useCustomFetch("entidade/getPopulate", "post", { filtro: {}, select: { _id: 1, idAntigo: 1 } }, undefined);
  if (retEntidades.valido) {
    // console.log("iniciando");
    for (let index5 = 1; index5 < retEntidades.data.length; index5++) {
      const entidadeEl = retEntidades.data[index5];

      const formSql = {
        tabelas: [{ nome: "noticia", nomeAs: "noticia" }],
        campos: [{ campo: "*" }],
        condicoes: [
          { campo: "lixo", condicao: "<>", valor: true },
          { campo: "entidade_pai_id", condicao: "=", valor: entidadeEl.idAntigo },
        ],
      };

      const ret = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formSql }, undefined);
      if (ret.valido && ret.data.json) {
        // console.log("entidade", entidadeEl.idAntigo);
        const elementF = ret.data.json.listaGenerica;
        let retString = JSON.stringify(elementF);
        const retornoAjustado = JSON.parse(retString.replaceAll("{}", "null"));
        // // console.log("retornoAjustado", retornoAjustado.length);

        for (let index = 0; index < retornoAjustado.length; index++) {
          // console.log("executando o index", index);
          const element = retornoAjustado[index];

          // // console.log('imagem old', element.imagem);
          // // console.log('new imagem',ajustaLink(element.imagem));

          const links = findLinks(element.html_noticia);
          let htmlNoticia = element.html_noticia;
          // // console.log("links", links);

          const newLinks: any = [];
          let novoHtml = false;
          if (htmlNoticia) {
            for (let index = 0; index < links.length; index++) {
              const oldLink = links[index];
              const newLink = getNewLink(oldLink);
              if (newLink) {
                htmlNoticia = htmlNoticia.replace(oldLink, newLink);
                // console.log("substituiu", oldLink, newLink);
                novoHtml = true;
              }
            }
            if (novoHtml) {
              // // console.log("novo html", htmlNoticia);
              // // console.log("newLinks", newLinks);
            }
          }

          const grupoNoticia = await findNoticiaGrupo(element.noticia_grupo_id);
          if (grupoNoticia == null) {
            // console.log("Erro ao buscar grupo de noticia", element);
            return;
          }
          const noticia: any = {
            entidade: entidadeEl._id,
            titulo: element.titulo,
            subTitulo: element.sub_titulo,
            evento: null,
            eventoNumero: element.evento_id,
            noticiaGrupo: grupoNoticia,
            numero: element.id,
            publicacao: element.publicacao ? getISODate(element.publicacao) : new Date().toISOString(),
            remocaoAutomatica: element.remocao_automatica ? getISODate(element.remocao_automatica) : null,
            rota: element.id.toString(),
            tags: element.tags ? element.tags.split(",") : [],
            htmlNoticia: htmlNoticia || "",
            albuns: [],
            imagem: ajustaLink(element.imagem),
            mostrar: {
              outrosSite: true,
              stjd: element.stjd || false,
              siteEvento: element.mostrar_site_evento || false,
            },
            lixo: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const retGrava = await useCustomFetch("noticia", "post", noticia, undefined);
          if (retGrava.valido) {
            // console.log("noticia", noticia.numero, "inserida com sucesso");
          } else {
            // console.log("Erro ao inserir noticia", noticia);
            // console.log("Erro ao inserir noticia", element);
            return;
          }
        }
      } else {
        // console.log("Erro ao buscar noticia", ret);
        return;
      }
    }
    // // console.log("links", links);

    // const links:any = [];
    // const newLinks: any = [];
    // for (let index = 0; index < links.length; index++) {
    //   const element = links[index];
    //   newLinks.push({ oldlink: element, newLink: getNewLink(element) });
    // }
    // // console.log("newLinks", newLinks);
  } else {
    // console.log("Erro ao buscar entidades", retEntidades);
  }
};

const findLinks = (valor: string) => {
  // console.log("valor", valor);
  const regex = /(<a href|src)="([^"]*)/g;
  const matches = [...valor.matchAll(regex)];
  return matches.map((match) => match[0]);
};

const findNoticiaGrupo = async (idAntigo: number) => {
  const ret = await useCustomFetch("noticiaGrupo/getPopulate", "post", { filtro: { idAntigo }, select: { _id: 1 } }, undefined);
  if (ret.valido && ret.data.length > 0) {
    return ret.data[0]._id;
  }
  return null;
};

const inicioLink = "https://azimuteweb.s3.sa-east-1.amazonaws.com";

const getNewLink = (input: string) => {
  // // console.log("input", input);
  const regex = /((href|src)=")([^"]*)(\/gerenciador)/;
  const match = input.match(regex);
  // // console.log("match", match);

  if (match) {
    return getNewSigla(input.replace(regex, `$1${inicioLink}$4`));
  } else {
    return null;
  }
  return null;
};

const ajustaLink = (input: string) => {
  // // console.log("input", input);
  const regex = /[^]*(gerenciador)/;

  const match = input.match(regex);
  // // console.log("match", match);

  if (match) {
    return getNewSiglaAjuste(input.replace(regex, `$1`));
  } else {
    return null;
  }
  return null;
};

const ajustaLinkEvento = (input: string) => {
  // // console.log("input", input);
  const regex = /[^]*(gerenciador)/;

  const match = input.match(regex);
  // // console.log("match", match);

  if (match) {
    return 'https://azimuteweb.s3.sa-east-1.amazonaws.com/'+getNewSiglaAjuste(input.replace(regex, `$1`));
  } else {
    return input;
  }
  return null;
};

const getNewSigla = (input: any) => {
  // // console.log("input", input);
  const regex = /\/gerenciador\/([^\/]*)/;
  const match = input.match(regex);
  // // console.log("match", match);
  const ret = match ? match[1] : null;
  // // console.log("ret", ret);
  if (ret) {
    switch (ret) {
      case "BAVECO":
      case "CBO":
      case "COARI":
      case "COARJ":
      case "COC":
      case "CODIV":
      case "COESA":
      case "COGA":
      case "COLB":
      case "CONA":
      case "COSEC":
      case "FBO":
      case "FECORI":
      case "FEOPE":
      case "FGO":
      case "FLORA":
      case "FMO":
      case "FODF":
      case "FOG":
      case "FOMS":
      case "FOP":
      case "FORJ":
      case "FORN":
      case "FOSP":
      case "FPO":
      case "ORIESC": {
        // // console.log("caiu no ret", ret);
        return input.replace(`/gerenciador/${ret}/`, `/${ret}/site-antigo/`);
      }

      default:
    }
  }
  return input;
};
const getNewSiglaAjuste = (input: any) => {
  // // console.log("input", input);
  const regex = /gerenciador\/([^\/]*)/;
  const match = input.match(regex);
  // // console.log("match", match);
  const ret = match ? match[1] : null;
  // // console.log("ret", ret);
  if (ret) {
    switch (ret) {
      case "BAVECO":
      case "CBO":
      case "COARI":
      case "COARJ":
      case "COC":
      case "CODIV":
      case "COESA":
      case "COGA":
      case "COLB":
      case "CONA":
      case "COSEC":
      case "FBO":
      case "FECORI":
      case "FEOPE":
      case "FGO":
      case "FLORA":
      case "FMO":
      case "FODF":
      case "FOG":
      case "FOMS":
      case "FOP":
      case "FORJ":
      case "FORN":
      case "FOSP":
      case "FPO":
      case "ORIESC": {
        // // console.log("caiu no ret", ret);
        return input.replace(`gerenciador/${ret}/`, `${ret}/site-antigo/`);
      }

      default:
    }
  }
  return input;
};

const converterGrupoNoticias = async () => {
  const retEntidades = await useCustomFetch("entidade/getPopulate", "post", { filtro: {}, select: { _id: 1, idAntigo: 1 } }, undefined);
  if (retEntidades.valido && retEntidades.data.length > 0) {
    // console.log("11");
    for (let index = 0; index < retEntidades.data.length; index++) {
      const entidadeEl = retEntidades.data[index];
      // console.log("22");

      const formSql = {
        tabelas: [{ nome: "noticia_grupo", nomeAs: "noticia_grupo" }],
        campos: [{ campo: "*" }],
        condicoes: [
          { campo: "lixo", condicao: "<>", valor: true },
          { campo: "entidade_pai_id", condicao: "=", valor: entidadeEl.idAntigo },
        ],
      };

      const ret = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formSql }, undefined);
      if (ret.valido && ret.data.json) {
        // console.log("ret", ret);

        const elementF = ret.data.json.listaGenerica;
        let retString = JSON.stringify(elementF);
        const retornoAjustado = JSON.parse(retString.replaceAll("{}", "null"));
        // console.log("retornoAjustado", retornoAjustado.length);

        for (let index = 0; index < retornoAjustado.length; index++) {
          // for (let index = 0; index < 50; index++) {
          // console.log("executando o index", index);
          const element = retornoAjustado[index];

          const noticiagrupo: any = {
            entidade: entidadeEl._id,
            idAntigo: element.id,
            descricao: element.descricao,
            cor: element.color,
            lixo: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const retGrava = await useCustomFetch("noticiagrupo", "post", noticiagrupo, undefined);
          if (retGrava.valido) {
            // console.log("noticiagrupo", noticiagrupo.descricao, "inserida com sucesso");
          } else {
            // console.log("Erro ao inserir noticiagrupo", noticiagrupo);
            // console.log("Erro ao inserir noticiagrupo", element);
            return;
          }
        }
      } else {
        // console.log("Erro ao buscar noticiagrupo", ret);
        return;
      }
    }
  } else {
    // console.log("Erro ao buscar entidades", retEntidades);
  }
};

const converterPessoas = async () => {
  const $scope: any = ref({});
  $scope.formSql = {};
  $scope.formSql.tabelas = [
    {
      nome: "pessoa_usuario",
      nomeAs: "pessoa_usuario",
    },
    {
      nome: "pessoa",
      nomeAs: "pessoa",
      ligacao: "INNER JOIN",
      nomeAsTabelaLigacao: "pessoa_usuario",
      camposLigacao: [{ campo: "id", campoLigacao: "id" }],
    },
    {
      nome: "pessoa_fisica",
      nomeAs: "pessoa_fisica",
      ligacao: "INNER JOIN",
      nomeAsTabelaLigacao: "pessoa_usuario",
      camposLigacao: [{ campo: "id", campoLigacao: "id" }],
    },
    {
      nome: "categoria",
      nomeAs: "categoria",
      ligacao: "LEFT JOIN",
      nomeAsTabelaLigacao: "pessoa_fisica",
      camposLigacao: [{ campo: "id", campoLigacao: "categoria_id" }],
    },
    {
      nome: "filiacao_atleta",
      nomeAs: "filiacao_atleta",
      ligacao: "INNER JOIN",
      nomeAsTabelaLigacao: "pessoa_usuario",
      camposLigacao: [{ campo: "pessoa_fisica_id", campoLigacao: "id" }],
    },
  ];

  $scope.formSql.campos = [{ campo: "pessoa_usuario.*" }, { campo: "pessoa.*" }, { campo: "pessoa_fisica.*" }, { campo: "filiacao_atleta.*" }, { campo: "categoria.descricao", campoAs: "categoria" }];

  $scope.formSql.condicoes = [{ campo: "pessoa_usuario.lixo", condicao: "<>", valor: true }];

  //somente correção para estavam sem categoria
  $scope.formSql.ordenacoes = [{ campo: "pessoa_fisica.categoria_id" }];
  $scope.formSql.limitInicio = 0;
  $scope.formSql.limitFim = 118;

  const ret = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: $scope.formSql }, undefined);
  if (ret.valido && ret.data.json) {
    // console.log("ret", ret);

    const elementF = ret.data.json.listaGenerica;

    //somente correção para estavam sem categoria
    if (elementF.length != 118) {
      // console.log("retornoAjustadoresultado inesperado", elementF);
      return;
    }

    let retString = JSON.stringify(elementF);
    const retornoAjustado = JSON.parse(retString.replaceAll("{}", "null"));
    // console.log("retornoAjustado", retornoAjustado.length);

    for (let index = 0; index < retornoAjustado.length; index++) {
      // for (let index = 0; index < 50; index++) {
      // console.log("executando o index", index);
      const element = retornoAjustado[index];

      if (!((await ajustaEndereco(element)) && (await ajustaEnderecosEletronicos(element)) && (await ajustaTelefones(element)))) {
        // Se der erro para
        return;
      }

      const pessoa: any = getNewPessoa();

      pessoa._id = element.cpf == "000403767962" ? "5aff4d2f47667633c7ace227" : await $geralService.getId();
      pessoa.nome = element.nome;
      pessoa.apelido = element.apelido;
      pessoa.idAntigo = element.pessoa_fisica_id;
      pessoa.senha = element.senha;
      pessoa.login = element.login;
      pessoa.email = element.email ? element.email : `email@${element.numero}`;
      pessoa.cpf = getCPF(element.cpf, element.pessoa_fisica_id);
      pessoa.tipoOutroDocumento = element.tipo_outro_documento ? getTipoOutroDucumento(element.tipo_outro_documento) : null;
      pessoa.outroDocumento = element.outro_documento;
      pessoa.nomeDaMae = element.nome_mae;
      pessoa.nacionalidade = element.pais;
      pessoa.nascimento = getISODate(element.nascimento);
      pessoa.sexo = element.sexo == 28 ? "Masculino" : "Feminino";
      pessoa.falecido = element.tipo_situacao == 114;
      pessoa.endereco = element.endereco;
      pessoa.telefones = element.telefones;
      pessoa.enderecosEletronicos = element.enderecosEletronicos;
      pessoa.categorias = getCategorias(element.categoria, element.numero);
      pessoa.equipamentos = getEquipamento(element.sicard);
      pessoa.created_at = element.data_cadastro ? getISODate(element.data_cadastro) : new Date().toISOString();
      pessoa.update_at = new Date().toISOString();

      const retG = await useCustomFetch("pessoa", "post", pessoa, undefined);
      if (retG.valido) {
        // console.log("pessoa", pessoa.nome, "inserida com sucesso");

        if (!(await ajustaFiliacoes(element, pessoa))) {
          return;
        } else {
          await ajustaFiliacoesSecundarias(element, pessoa._id);
        }
      } else {
        // console.log("Erro ao inserir pessoa", pessoa);
        // console.log("Erro ao inserir pessoa", element);
        return;
      }
    }
  } else {
    // console.log("Erro ao buscar pessoas", ret);
  }
};

const getTipoOutroDucumento = (tipo: number) => {
  if (tipo == 52) {
    return "Certidão de Nascimento";
  } else if (tipo == 53) {
    return "Passaporte";
  } else if (tipo == 54) {
    return "Carteira de Motorista";
  } else if (tipo == 55) {
    return "Documento Militar";
  } else if (tipo == 56) {
    return "Outros";
  }
};

const listaIdSemcpf = ref<any>([]);

const getCPF = (cpf: any, idAntigo: number) => {
  if (cpf) {
    if (cpf.length == 11) {
      return cpf;
    }
  }

  // numero randomico maior que 1000000 e menor que 9999999
  const numero = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

  const numeroRam2 = Math.floor(Math.random() * (999 - 100 + 1)) + 100;

  const strRamdom = numero.toString() + numeroRam2.toString();

  const palavraRandomica3letras = Math.random().toString(36).substring(2, 5);

  listaIdSemcpf.value.push(idAntigo);

  return completaComZero("z4" + strRamdom + palavraRandomica3letras, 11);
};

const completaComZero = (valor: string, tamanho: number) => {
  while (valor.length < tamanho) {
    valor = "0" + valor;
  }
  return valor;
};

const converterEntidades = async () => {
  const $scope: any = ref({});
  $scope.formSql = {};
  $scope.formSql.tabelas = [
    {
      nome: "pessoa",
      nomeAs: "pessoa",
    },
    {
      nome: "pessoa_juridica",
      nomeAs: "pessoa_juridica",
      ligacao: "INNER JOIN",
      nomeAsTabelaLigacao: "pessoa",
      camposLigacao: [{ campo: "id", campoLigacao: "id" }],
    },
    {
      nome: "entidade",
      nomeAs: "entidade",
      ligacao: "INNER JOIN",
      nomeAsTabelaLigacao: "pessoa_juridica",
      camposLigacao: [{ campo: "id", campoLigacao: "id" }],
    },
    {
      nome: "lista",
      nomeAs: "lista",
      ligacao: "INNER JOIN",
      nomeAsTabelaLigacao: "entidade",
      camposLigacao: [{ campo: "id", campoLigacao: "tipo_entidade" }],
    },
  ];

  // $scope.formSql.campos = [{ "campo": "pessoa.id" }, { "campo": "pessoa.nome" }, { "campo": "entidade.uf" } , { "campo": "entidade.id", "campoAs": "entidade_id" }, { "campo": "entidade.sigla" }, { "campo": "entidade.sequencial" }, { "campo": "lista.id", "campoAs": "lista_id" }, { "campo": "lista.descricao", "campoAs": "lista_descritivo" }];
  $scope.formSql.campos = [{ campo: "pessoa_juridica.*" }, { campo: "entidade.*" }, { campo: "lista.descricao", campoAs: "tipo" }, { campo: "pessoa.*" }];
  $scope.formSql.condicoes = [{ campo: "entidade.lixo", condicao: "<>", valor: true }];

  const ret = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: $scope.formSql }, undefined);
  if (ret.valido && ret.data.json) {
    // console.log("ret", ret);

    for (let index = 0; index < ret.data.json.listaGenerica.length; index++) {
      // console.log("executando o index", index);
      const element = ret.data.json.listaGenerica[index];

      if (!((await ajustaEndereco(element)) && (await ajustaEnderecosEletronicos(element)) && (await ajustaTelefones(element)))) {
        // Se der erro para
        return;
      }

      const entidade: any = getNewEntidade();

      entidade._id = index == 0 ? "5d6934fc9b35767d7398c823" : undefined;
      entidade.nomeRazao = element.nome;
      entidade.nomeFantasia = element.sigla;
      entidade.sigla = element.sigla;
      entidade.tipo = element.tipo_entidade == 93 ? "Federação" : element.tipo;
      entidade.idAntigo = element.id;
      entidade.artigo69 = element.artigo69;

      entidade.logo = "";
      entidade.created_at = element.data_cadastro ? getISODate(element.data_cadastro) : new Date().toISOString();
      entidade.update_at = new Date().toISOString();
      entidade.abrangencia = getAbragencia(entidade.tipo);
      entidade.cnpj = element.cnpj ? $geralService.removeMascara(element.cnpj) : null;
      entidade.inicioAtividade = element.data_cadastro ? getISODate(element.inicio_atividade) : null;
      entidade.sequencial = element.sequencial;
      entidade.tratamentoMasculino = getTratamento(entidade.tipo);
      entidade.endereco = element.endereco;
      entidade.telefones = element.telefones;
      entidade.enderecosEletronicos = element.enderecosEletronicos;

      const retG = await useCustomFetch("entidade", "post", entidade, undefined);
      if (retG.valido) {
        const retGravaP = await useCustomFetch("acessoSistema", "post", newPerfil(retG.data._id), undefined);
        const retVinculo = await useCustomFetch("vinculo", "post", newVinculo(retG.data._id, retGravaP.data._id), undefined);
        // console.log("entidade", entidade.nome, "inserida com sucesso");
      } else {
        // console.log("Erro ao inserir entidade", entidade);
        // console.log("Erro ao inserir entidade", element);
        return;
      }
    }
  }
};

const newPerfil = (entidadeId: string) => {
  return {
    entidade: entidadeId,
    descricao: "Acesso Geral",
    lixo: false,
    funcoesSistema: [82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122],
    created_at: "2024-01-12T03:27:29.000+0000",
    updated_at: "2024-01-12T03:27:29.000+0000",
    __v: 0,
  };
};

const newVinculo = (entidadeId: string, acesso: string) => {
  return {
    entidade: entidadeId,
    pessoa: "5aff4d2f47667633c7ace227",
    dataInicio: "2024-01-01T03:00:00.000+0000",
    data_fim: "2048-12-13T12:41:04.000+0000",
    ativo: true,
    lixo: false,
    created_at: "2019-01-09T15:17:30.000+0000",
    updated_at: "2024-01-12T03:43:51.000+0000",
    __v: 10,
    tipoLigacao: "Suporte",
    cargo: "Suporte",
    atribuicoes: [],
    divulgarContatosNoSite: false,
    aceiteEmpresa: false,
    aceitePessoa: false,
    acessosSistema: [acesso],
    funcoesExtras: [],
    funcoesRestritivas: [],
    aceiteEntidade: false,
    suporte: true,
    dataFim: null,
  };
};

const ajustaEndereco = async (element: any) => {
  const formEndereco = {
    tabelas: [{ nome: "pessoa_endereco", nomeAs: "pe" }],
    campos: [],
    condicoes: [
      { campo: "pe.lixo", condicao: "<>", valor: true },
      { campo: "pe.pessoa_id", condicao: "=", valor: element.id },
    ],
  };
  const retEnd = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formEndereco }, undefined);
  if (retEnd.valido && retEnd.data.json) {
    if (retEnd.data.json.listaGenerica.length > 0) {
      const elementF = retEnd.data.json.listaGenerica[0];
      let retString = JSON.stringify(elementF);
      const end = JSON.parse(retString.replaceAll("{}", "null"));

      element.endereco = {
        pais: "Brasil",
        logradouro: end.logradouro ? end.logradouro : "Rua",
        numero: end.numero ? end.numero : 0,
        cep: end.cep ? end.cep : "00000000",
        bairro: end.bairro ? end.bairro : "Bairro",
        cidade: end.cidade ? end.cidade : "Cidade",
        uf: getUf(element.uf ? element.uf : end.uf ? end.uf : 0),
        cepValidado: false,
        googleValidado: false,
      };
    } else {
      if (element.uf) {
        element.endereco = getEnderecoQualquerPorUF(getUf(element.uf));
      } else {
        element.endereco = getEnderecoQualquerPorUF("DF");
      }
    }
    return true;
  } else {
    // console.log("Errro retEnd", retEnd);
  }
  return false;
};
const ajustaEnderecosEletronicos = async (element: any) => {
  const formEndereco = {
    tabelas: [{ nome: "pessoa_endereco_eletronico", nomeAs: "pee" }],
    campos: [],
    condicoes: [
      { campo: "pee.lixo", condicao: "<>", valor: true },
      { campo: "pee.pessoa_id", condicao: "=", valor: element.id },
    ],
  };
  const retEndEl = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formEndereco }, undefined);
  element.enderecosEletronicos = [];
  if (retEndEl.valido && retEndEl.data.json) {
    if (retEndEl.data.json.listaGenerica.length > 0) {
      for (let index = 0; index < retEndEl.data.json.listaGenerica.length; index++) {
        const elementEndEl = retEndEl.data.json.listaGenerica[index];
        element.enderecosEletronicos.push({
          tipo: ["E-mail", "Site", "Social"].includes(elementEndEl.tipo) ? elementEndEl.tipo : "E-mail",
          endereco: elementEndEl.endereco,
          complemento: elementEndEl.complemento,
          principal: index == 0 ? true : false,
        });
      }
    }
    return true;
  }
  // console.log("Errro retEndEl", retEndEl);
  return false;
};

const getUf = (id: number) => {
  if (id > 27) {
    return "EX";
  }
  const estados = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO", "EX"];
  return estados[id - 1];
};

const getEnderecoQualquerPorUF = (uf: string) => {
  const listaEnderecosTodosEstados = [
    {
      uf: "AC",
      logradouro: "Rua",
      numero: "0",
      cep: "69900000",
      bairro: "Centro",
      cidade: "Rio Branco",
      pais: "Brasil",
      localizacao: {
        lat: -9.97499,
        lng: -67.8243,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "AL",
      logradouro: "Rua",
      numero: "0",
      cep: "57000000",
      bairro: "Centro",
      cidade: "Maceió",
      pais: "Brasil",
      localizacao: {
        lat: -9.66625,
        lng: -35.7351,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "AM",
      logradouro: "Rua",
      numero: "0",
      cep: "69000000",
      bairro: "Centro",
      cidade: "Manaus",
      pais: "Brasil",
      localizacao: {
        lat: -3.11866,
        lng: -60.0212,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "AP",
      logradouro: "Rua",
      numero: "0",
      cep: "68900000",
      bairro: "Centro",
      cidade: "Macapá",
      pais: "Brasil",
      localizacao: {
        lat: 0.035577,
        lng: -51.0706,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "BA",
      logradouro: "Rua",
      numero: "0",
      cep: "40000000",
      bairro: "Centro",
      cidade: "Salvador",
      pais: "Brasil",
      localizacao: {
        lat: -12.9718,
        lng: -38.5011,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "CE",
      logradouro: "Rua",
      numero: "0",
      cep: "60000000",
      bairro: "Centro",
      cidade: "Fortaleza",
      pais: "Brasil",
      localizacao: {
        lat: -3.73186,
        lng: -38.5267,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "DF",
      logradouro: "Rua",
      numero: "0",
      cep: "70000000",
      bairro: "Centro",
      cidade: "Brasília",
      pais: "Brasil",
      localizacao: {
        lat: -15.7795,
        lng: -47.9297,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "ES",
      logradouro: "Rua",
      numero: "0",
      cep: "29000000",
      bairro: "Centro",
      cidade: "Vitória",
      pais: "Brasil",
      localizacao: {
        lat: -20.3155,
        lng: -40.3128,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "GO",
      logradouro: "Rua",
      numero: "0",
      cep: "74000000",
      bairro: "Centro",
      cidade: "Goiânia",
      pais: "Brasil",
      localizacao: {
        lat: -16.6864,
        lng: -49.2643,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "MA",
      logradouro: "Rua",
      numero: "0",
      cep: "65000000",
      bairro: "Centro",
      cidade: "São Luís",
      pais: "Brasil",
      localizacao: {
        lat: -2.53874,
        lng: -44.2829,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "MG",
      logradouro: "Rua",
      numero: "0",
      cep: "30000000",
      bairro: "Centro",
      cidade: "Belo Horizonte",
      pais: "Brasil",
      localizacao: {
        lat: -19.9167,
        lng: -43.9345,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "MS",
      logradouro: "Rua",
      numero: "0",
      cep: "79000000",
      bairro: "Centro",
      cidade: "Campo Grande",
      pais: "Brasil",
      localizacao: {
        lat: -20.4428,
        lng: -54.6464,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "MT",
      logradouro: "Rua",
      numero: "0",
      cep: "78000000",
      bairro: "Centro",
      cidade: "Cuiabá",
      pais: "Brasil",
      localizacao: {
        lat: -15.601,
        lng: -56.0974,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "PA",
      logradouro: "Rua",
      numero: "0",
      cep: "66000000",
      bairro: "Centro",
      cidade: "Belém",
      pais: "Brasil",
      localizacao: {
        lat: -1.4554,
        lng: -48.4898,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "PB",
      logradouro: "Rua",
      numero: "0",
      cep: "58000000",
      bairro: "Centro",
      cidade: "João Pessoa",
      pais: "Brasil",
      localizacao: {
        lat: -7.11509,
        lng: -34.8641,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "PE",
      logradouro: "Rua",
      numero: "0",
      cep: "50000000",
      bairro: "Centro",
      cidade: "Recife",
      pais: "Brasil",
      localizacao: {
        lat: -8.04666,
        lng: -34.8771,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "PI",
      logradouro: "Rua",
      numero: "0",
      cep: "64000000",
      bairro: "Centro",
      cidade: "Teresina",
      pais: "Brasil",
      localizacao: {
        lat: -5.08921,
        lng: -42.8016,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "PR",
      logradouro: "Rua",
      numero: "0",
      cep: "80000000",
      bairro: "Centro",
      cidade: "Curitiba",
      pais: "Brasil",
      localizacao: {
        lat: -25.4195,
        lng: -49.2646,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "RJ",
      logradouro: "Rua",
      numero: "0",
      cep: "20000000",
      bairro: "Centro",
      cidade: "Rio de Janeiro",
      pais: "Brasil",
      localizacao: {
        lat: -22.9083,
        lng: -43.1971,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "RN",
      logradouro: "Rua",
      numero: "0",
      cep: "59000000",
      bairro: "Centro",
      cidade: "Natal",
      pais: "Brasil",
      localizacao: {
        lat: -5.79357,
        lng: -35.1986,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "RO",
      logradouro: "Rua",
      numero: "0",
      cep: "76800000",
      bairro: "Centro",
      cidade: "Porto Velho",
      pais: "Brasil",
      localizacao: {
        lat: -8.76077,
        lng: -63.8999,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "RR",
      logradouro: "Rua",
      numero: "0",
      cep: "69300000",
      bairro: "Centro",
      cidade: "Boa Vista",
      pais: "Brasil",
      localizacao: {
        lat: 2.82384,
        lng: -60.6753,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "RS",
      logradouro: "Rua",
      numero: "0",
      cep: "90000000",
      bairro: "Centro",
      cidade: "Porto Alegre",
      pais: "Brasil",
      localizacao: {
        lat: -30.0318,
        lng: -51.2065,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "SC",
      logradouro: "Rua",
      numero: "0",
      cep: "88000000",
      bairro: "Centro",
      cidade: "Florianópolis",
      pais: "Brasil",
      localizacao: {
        lat: -27.5945,
        lng: -48.5477,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "SE",
      logradouro: "Rua",
      numero: "0",
      cep: "49000000",
      bairro: "Centro",
      cidade: "Aracaju",
      pais: "Brasil",
      localizacao: {
        lat: -10.9091,
        lng: -37.0677,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "SP",
      logradouro: "Rua",
      numero: "0",
      cep: "01000000",
      bairro: "Centro",
      cidade: "São Paulo",
      pais: "Brasil",
      localizacao: {
        lat: -23.5505,
        lng: -46.6333,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "TO",
      logradouro: "Rua",
      numero: "0",
      cep: "77000000",
      bairro: "Centro",
      cidade: "Palmas",
      pais: "Brasil",
      localizacao: {
        lat: -10.1689,
        lng: -48.3317,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    {
      uf: "EX",
      logradouro: "Rua",
      numero: "0",
      cep: "70000000",
      bairro: "Centro",
      cidade: "Brasília",
      pais: "Brasil",
      localizacao: {
        lat: -15.7795,
        lng: -47.9297,
      },
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
  ];
  return listaEnderecosTodosEstados.find((e) => e.uf == uf);
};

const getAbragencia = (tipo: string) => {
  if (tipo == "Confederação") {
    return "Nacional";
  } else if (tipo == "Federação") {
    return "Estadual";
  } else {
    return "Local";
  }
};
const getTratamento = (tipo: string) => {
  if (tipo == "Confederação") {
    return false;
  } else if (tipo == "Federação") {
    return false;
  } else {
    return true;
  }
};

const getISODate = (data: string) => {
  try {
    if (data) {
      let dateParts: any = data.split("/");
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]).toISOString();
    }
  } catch (error) {
    // console.log("Erro ao converter data", data);
  }
  return null;
};
const getAno = (data: string) => {
  try {
    if (data) {
      let dateParts: any = data.split("/");
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]).getFullYear();
    }
  } catch (error) {
    return 2024;
  }
  return 2024;
};

const getNewEntidade = () => {
  return {
    nomeRazao: null,
    nomeFantasia: null,
    sigla: null,
    tipo: null,
    ativo: true,
    taxaAzimuteCerto: 6,
    artigo69: false,
    logo: null,
    diretoria: [],
    filiacoes: [],
    telefones: [],
    enderecosEletronicos: [],
    lixo: false,
    created_at: null,
    updated_at: null,
    __v: 0,
    diretorias: [],
    esportes: ["64288d64beacbf61a8cbb230"],
    modalidadesEsportivas: ["642899b8beacbf61a8cbb29a", "64289eec667e59a0fe5e8a8c", "64289f42667e59a0fe5e8a93", "64289f7a667e59a0fe5e8a9a"],
    site: {
      dominio: null,
      ativo: false, // Quer dizer que a entidade tem um site próprio vinculado a azimuteweb.
      azimuteWeb: false, // Quer dizer que a entidade tem um site próprio vinculado a azimuteweb.
      dominioValidado: false, // Quer dizer que a entidade tem um site próprio vinculado a azimuteweb.
      dominioOrientacaoEsp: false,
    },
    filiacaoPessoa: {
      permite: true,
      taxas: [],
      filiacoesObrigatorias: [],
      documentosObrigatorios: [],
    },
    abrangencia: null,
    cnpj: null,
    inicioAtividade: null,
    endereco: {
      pais: "Brasil",
      logradouro: null,
      numero: null,
      cep: null,
      bairro: null,
      cidade: null,
      uf: null,
      cepValidado: false,
      googleValidado: false,
      lixo: false,
    },
    tratamentoMasculino: false,
    financeiroContaPrincipal: null,
    taxasEventosRendimento: [],
  };
};

const getCategorias = (cat: string, numero: number) => {
  if (cat) {
    return [{ esporte: "64288d64beacbf61a8cbb230", categoria: cat }];
  } else {
    return [];
  }
};

const getNivelDificuldade = (cat: any, numero: number) => {
  if (!cat) {
    if (numero < 20000) {
      return 2;
    }
    return 0;
  }
  if (cat.endsWith("N")) {
    return 0;
  } else if (cat.endsWith("B")) {
    return 1;
  } else if (cat.endsWith("A")) {
    return 2;
  } else if (cat.endsWith("E")) {
    return 3;
  } else {
    return 1;
  }
};

const getEquipamento = (sicard: any) => {
  if (sicard) {
    return [{ esporte: "64288d64beacbf61a8cbb230", nome: "Si-Card", identificacao: sicard }];
  } else {
    return [];
  }
};
const ajustaFiliacoes = async (elemento: any, newPessoaId: any) => {
  // console.log("ajustaFiliacoes");
  let temporario = false;
  switch (elemento.aprovacao) {
    case null: {
    }
    case 127: {
    }
    case 173: {
      return true;
    }
    case 122: {
      temporario = true;
    }
    default: {
      let status = "Ativa";

      let dataRegistro = elemento.data_registro ? getISODate(elemento.data_registro) : null;

      // verificar se a data de registro é maior que 4 meses
      if (dataRegistro && temporario) {
        const dataAtual = new Date();
        const dataRegistroDate = new Date(dataRegistro);
        const diferenca = dataAtual.getTime() - dataRegistroDate.getTime();
        const diferencaDias = diferenca / (1000 * 3600 * 24);
        if (diferencaDias > 120) {
          status = "Expirou";
        }
      }

      if (status == "Expirou") {
        // Não faz nada
        return true;
      }

      if (elemento.aprovacao == 125) {
        status = "Em Análise";
      } else {
        status = "Ativa";
      }

      const cboId = "5d6934fc9b35767d7398c823";
      const newFiliacaoPessoaCBO = getNewFiliacaoPessoa(cboId, newPessoaId, elemento, "Nacional", temporario, status);
      const retGravaCBO = await useCustomFetch("filiacaoPessoa", "post", newFiliacaoPessoaCBO, undefined);
      let retIdCBO: any = null;
      if (!retGravaCBO.valido) {
        // console.log("Erro ao inserir filiação CBO", retGravaCBO);
        return false;
      } else {
        retIdCBO = retGravaCBO.data._id;
      }

      let retIdClube: any = null;
      if (elemento.clube_id) {
        const retClube = await useCustomFetch("entidade/getPopulate", "post", { filtro: { idAntigo: elemento.clube_id }, select: { _id: 1 } }, undefined);
        if (retClube.valido && retClube.data.length > 0) {
          if (elemento.aprovacao == 123 || elemento.aprovacao == 124 || elemento.aprovacao == 125) {
            status = "Em Análise";
          } else {
            status = "Ativa";
          }
          const newFiliacaoPessoaClube = getNewFiliacaoPessoa(retClube.data[0]._id, newPessoaId, elemento, "Local", temporario, status);
          const retGravaClube = await useCustomFetch("filiacaoPessoa", "post", newFiliacaoPessoaClube, undefined);

          if (!retGravaClube.valido) {
            // console.log("Erro ao inserir filiação CLube", retGravaClube);
            await useCustomFetch("filiacaoPessoa/delete", "post", { _id: retIdCBO, definitivo: true }, undefined);
            await useCustomFetch("pessoa/delete", "post", { _id: newPessoaId, definitivo: true }, undefined);
            return false;
          } else {
            retIdClube = retGravaClube.data._id;
          }
        } else {
          // console.log("Erro ao buscar clube", elemento.federacao_id);
          // console.log("Erro ao buscar clube", retClube);
          return false;
        }
      } else {
        // console.log("não tem clube");
      }
      if (elemento.federacao_id) {
        const retFederacao = await useCustomFetch("entidade/getPopulate", "post", { filtro: { idAntigo: elemento.federacao_id }, select: { _id: 1 } }, undefined);
        if (retFederacao.valido && retFederacao.data.length > 0) {
          if (elemento.aprovacao == 124 || elemento.aprovacao == 125) {
            status = "Em Análise";
          } else {
            status = "Ativa";
          }
          const newFiliacaoPessoaFederacao = getNewFiliacaoPessoa(retFederacao.data[0]._id, newPessoaId, elemento, "Estadual", temporario, status);
          const retGravaFederacao = await useCustomFetch("filiacaoPessoa", "post", newFiliacaoPessoaFederacao, undefined);
          if (!retGravaFederacao.valido) {
            // console.log("Erro ao inserir filiação Federacao", retGravaFederacao);
            await useCustomFetch("filiacaoPessoa/delete", "post", { _id: retIdCBO, definitivo: true }, undefined);
            await useCustomFetch("filiacaoPessoa/delete", "post", { _id: retIdClube, definitivo: true }, undefined);
            await useCustomFetch("pessoa/delete", "post", { _id: newPessoaId, definitivo: true }, undefined);
            return false;
          }
        } else {
          // console.log("Erro ao buscar federacao", elemento.federacao_id);
          // console.log("Erro ao buscar federacao", retFederacao);
          return false;
        }
      } else {
        // console.log("não tem federação");
      }
      return true;
    }
  }
};

const ajustaFiliacoesSecundarias = async (elemento: any, newPessoaId: string) => {
  const formFAS = {
    tabelas: [{ nome: "filiacao_atleta_secundaria", nomeAs: "fas" }],
    campos: [],
    condicoes: [
      { campo: "fas.lixo", condicao: "<>", valor: true },
      { campo: "fas.pessoa_fisica_id", condicao: "=", valor: elemento.pessoa_fisica_id },
    ],
  };
  const retFas = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formFAS }, undefined);

  if (retFas.valido && retFas.data.json) {
    if (retFas.data.json.listaGenerica.length > 0) {
      for (let index = 0; index < retFas.data.json.listaGenerica.length; index++) {
        const e = retFas.data.json.listaGenerica[index];
        let status = "Ativa";
        if (e.confirmacao_federacao == 0) {
          status = "Em Análise";
        }

        const retFederacao = await useCustomFetch("entidade/getPopulate", "post", { filtro: { idAntigo: e.federacao_id }, select: { _id: 1 } }, undefined);

        const newFiliacaoPessoaFederacao = getNewFiliacaoPessoa(retFederacao.data[0]._id, newPessoaId, elemento, "Estadual", false, status);
        const retGravaFederacao = await useCustomFetch("filiacaoPessoa", "post", newFiliacaoPessoaFederacao, undefined);
        if (!retGravaFederacao.valido) {
          // console.log("Erro ao inserir filiação Federacao", newFiliacaoPessoaFederacao);
          return false;
        } else {
          if (e.confirmacao_clube) {
            status = "Ativa";
          } else {
            status = "Em Análise";
          }

          const retClube = await useCustomFetch("entidade/getPopulate", "post", { filtro: { idAntigo: e.clube_id }, select: { _id: 1 } }, undefined);
          const newFiliacaoPessoaClube = getNewFiliacaoPessoa(retClube.data[0]._id, newPessoaId, elemento, "Local", false, status);
          const retGravaClube = await useCustomFetch("filiacaoPessoa", "post", newFiliacaoPessoaClube, undefined);
          if (!retGravaClube.valido) {
            // console.log("Erro ao inserir filiação Clube", newFiliacaoPessoaClube);
            return false;
          }
        }
      }
    }
    return true;
  } else {
    // console.log("Erro ao buscar filiações secundárias", retFas);
    return false;
  }

  return false;
};

const getNewFiliacaoPessoa = (entidadeId: string, newPessoaId: string, elemento: any, abrangencia: string, temporario: boolean, st: string) => {
  let nivelDificuldade = getNivelDificuldade(elemento.categoria, elemento.numero);
  if (nivelDificuldade == 0) {
    nivelDificuldade = elemento.numero < 20000 ? 3 : 2;
  }

  return {
    entidade: entidadeId,
    esporte: "64288d64beacbf61a8cbb230",
    nivelDificuldade: nivelDificuldade,
    pessoa: newPessoaId,
    numero: elemento.numero,
    temporaria: temporario, // Indica que a filiação é temporária
    abrangencia: abrangencia,
    dataFiliacao: elemento.data_registro ? getISODate(elemento.data_registro) : null, // Data em que foi aprovada a filiação
    dataPedido: elemento.data_registro ? getISODate(elemento.data_registro) : null, // Data em que foi solicitada a filiação
    dataAtividade: null, // Data do início da atividade se o atleta for desativado e depois reativado esta data será alterada//
    status: st,
    historico: [],
    lixo: false,
    created_at: null,
    updated_at: new Date().toISOString(),
  };
};

const getNewPessoa = () => {
  return {
    nome: null,
    apelido: null,
    senha: null,
    login: null,
    email: null,
    cpf: null,
    outroDocumento: null,
    tipoOutroDocumento: null,
    nomeDaMae: null,
    nacionalidade: null,
    falecido: false,
    nascimento: null,
    sexo: null,
    atualizacaoDados: null,
    dependentes: [],
    categorias: [], // importante vai ficar com a categoria do atleta.
    equipamentos: [], // importante vai ficar com o sicard do atleta.
    endereco: null,
    telefones: [],
    enderecosEletronicos: [],
    aceiteDados: false,
    aceiteImagem: false,
    lixo: false,
    created_at: null,
    updated_at: new Date().toISOString(),
  };
};

const logout = () => {
  logado.value = false;
  pessoaAzimute.value = { login: "suporte", senha: "3411" };
};

const login = async () => {
  // verificar login e senha

  const url = "https://www.cbo.org.br/azimuteweb_ws/webresources/loginWs/login";

  let ret: any = null;
  try {
    ret = await $fetch(url, {
      method: "post",
      body: { login: pessoaAzimute.value.login, senha: md5(pessoaAzimute.value.senha) },
    });
  } catch (error) {}

  if (ret) {
    if (ret.valido) {
      // console.log(ret);
      pessoaAzimute.value.usuario = ret.json.login;
      logado.value = true;
    } else {
      $q.notify({
        message: "Login ou senha inválidos!",
        type: "negative",
        position: "top",
        timeout: 2000,
      });
    }
    // pessoaAzimute.value.usuario = ret;
    // logado.value = true;
  } else {
    $q.notify({
      message: "Falha na comunicação ou link quebrado!",
      type: "negative",
      position: "top",
      timeout: 2000,
    });
  }
};

const ajustaCPF = async () => {
  const ret = await useCustomFetch("pessoa/getPopulate", "post", { filtro: { idAntigo: { $gt: 14461 } }, select: { cpf: 1, idAntigo: 1 } }, undefined);
  listaIdSemcpf.value = [];
  for (let index = 0; index < ret.data.length; index++) {
    const element = ret.data[index];
    const formPessoa = {
      tabelas: [{ nome: "pessoa_fisica", nomeAs: "p" }],
      campos: [{ campo: "p.cpf" }, { campo: "p.lixo" }],
      condicoes: [
        { campo: "p.id", condicao: "=", valor: element.idAntigo },
        { campo: "p.lixo", condicao: "<>", valor: true },
      ],
    };
    const retPes = await useCustomFetch("convercao", "post", { usuario: pessoaAzimute.value.usuario.id, rota: "genericWs/getListGenerico", token: pessoaAzimute.value.usuario.token, data: formPessoa }, undefined);
    if (retPes.valido && retPes.data.json) {
      if (retPes.data.json.listaGenerica.length > 0) {
        const elementF = retPes.data.json.listaGenerica[0];
        let newPessoa = { cpf: getCPF(elementF.cpf, element.idAntigo) };
        if (element.cpf !== newPessoa.cpf) {
          const retGrava = await useCustomFetch("pessoa/" + element._id, "put", newPessoa, undefined);
          if (!retGrava.valido) {
            // console.log("Erro ao gravar pessoa", retGrava);
            return;
          }
        }
      }
    }

    const restodadivisao = index % 50;
    if (restodadivisao == 0) {
      // console.log("executou: ", index);
    }
  }
  // console.log(listaIdSemcpf.value);
};
</script>
<style scoped lang="scss"></style>
