// export const useEntidade = () => useState('entidade', () => [])
// export const useSchema = () => useState('schema', () => "dark")

import CryptoJS from "crypto-js";

export function encode(value: string, secretKey: string): string {
  const key = CryptoJS.PBKDF2(secretKey, secretKey, {
    keySize: 256 / 32,
  });
  const iv = CryptoJS.PBKDF2(secretKey, secretKey, {
    keySize: 128 / 32,
  });

  return CryptoJS.AES.encrypt(value, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();

  // return CryptoJS.AES.encrypt(value, secretKey).toString();
  // if (process.client) {
  //   return window.btoa(unescape(encodeURIComponent(value))).replaceAll('Z','h1gHlP')
  // } else {
  //   return Buffer.from(value, 'ascii').toString('base64').replaceAll('Z','h1gHlP')
  // }
}

export function decode(value: string, secretKey: string): string {
  const key = CryptoJS.PBKDF2(secretKey, secretKey, {
    keySize: 256 / 32,
  });
  const iv = CryptoJS.PBKDF2(secretKey, secretKey, {
    keySize: 128 / 32,
  });

  return CryptoJS.AES.decrypt(value, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
  // return CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
  // if (process.client) {
  //     return decodeURIComponent(escape(window.atob(value.replaceAll('h1gHlP','Z'))))
  // } else {
  //   return Buffer.from(value.replaceAll('h1gHlP','Z'), 'base64').toString('ascii')
  // }
}

export function parseJwt(value: string): any {
  try {
    return JSON.parse(atob(value.split(".")[1]));
  } catch (e) {
    return null;
  }
}

export function validaToken(value: string, key: string): boolean {
  const decodedJwt = parseJwt(decode(value, key));
  if (decodedJwt.exp < Date.now()) {
    return false;
  } else {
    return true;
  }
}

export const revalidateToken = async (
  encToken: string,
  encTokenMaster: string,
  key: string,
  userId: string
) => {
  if (encToken && encTokenMaster) {
    const geral: any = useGeral();
    // O token curto está valido
    if (validaToken(encToken, key)) {
      if (geral.tokens.expiracaoMaster <= 0) {
        geral.decrementExpiracao(
          parseJwt(decode(encToken, key)).exp );
        geral.decrementExpiracaoMaster(
          parseJwt(decode(encTokenMaster, key)).exp);
      }

      return true;
    } else {
      // O token curto expirou
      if (validaToken(encTokenMaster, key)) {
        // console.log("O token curto expirou e será relavidado!");
        // O token curto não está valido e ira revalidar o token curto
        
        const runTimeConfig = useRuntimeConfig();
        
        const ret: any = await $fetch(
          `${runTimeConfig.public.baseUrl}revalidate`,
          {
            method: "post",
            body: { id: userId },
            headers: {
              "x-access-token": encTokenMaster,
            },
          }
        );

        if (ret.valido) {
          const tokenAzimuteweb = useCookie("__bew", { default: () => "" });
          const tkMaster = useCookie("__ret", { default: () => "" });
          tkMaster.value = encode(ret.data.tkMaster, key);
          tokenAzimuteweb.value = encode(
            ret.data.token,
            key
          );
          geral.setToken(tokenAzimuteweb.value);

          geral.decrementExpiracao(
            parseJwt(ret.data.token).exp);
          geral.decrementExpiracaoMaster(
            parseJwt(ret.data.tkMaster).exp);
          // console.log("Token curto revalidado com sucesso!");
          return true;
        } else {
          // TODO mostrar mensagens
          return false;
        }
      } else {
        // console.log("O Token longo exprirou!");
      }
    }
  } else {
    // console.log('esta vazio');
  }
  return false;
};

export const getCSV = (enquete: any) => {
  let CSV = "";
  CSV += "Enquete Id;" + enquete._id + "\r\n";
  CSV += "Início;" + enquete.inicio + "\r\n";
  CSV += "Fim;" + enquete.fim + "\r\n";
  CSV += "\r\n";
  CSV += "Opções de Voto \r\n";

  for (let i = 0; i < enquete.opcoesDeVoto.length; i++) {
    CSV += enquete.opcoesDeVoto[i]._id + "\r\n";
  }

  let fileName = "enquete_" + enquete._id;
  let uri = "data:text/csv;charset=utf-8," + escape(CSV);
  let link = document.createElement("a");
  link.href = uri;
  // @ts-ignore
  link.style = "visibility:hidden";
  link.download = fileName + ".csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getCSVCompletoVotacaoAberta = async (enquete: any) => {
  const { $geralService } = useNuxtApp();
  let CSV = "";
  CSV += "Eleição Id;" + enquete._id + "\r\n";
  CSV += "Eleição Título;" + enquete.titulo + "\r\n";
  CSV += "Início;" + $geralService.getDataHoraFormatada(enquete.inicio) + "\r\n";
  CSV += "Fim;" + $geralService.getDataHoraFormatada(enquete.fim) + "\r\n";
  for (let i = 0; i < enquete.disputas.length; i++) {
    CSV += "\r\n";
    const disputa = enquete.disputas[i];
    CSV += "Disputa;" + disputa.descricao + "\r\n";
    CSV += "\r\n";
    CSV += "Opções de Voto \r\n";

    // shuffle(enquete.opcoesDeVoto);
    // enquete.opcoesDeVoto = enquete.opcoesDeVoto
    //   .map((a: any) => ({ sort: Math.random(), value: a }))
    //   .sort((a: any, b: any) => a.sort - b.sort)
    //   .map((a: any) => a.value);

    for (let j = 0; j < enquete.opcoesDeVoto.length; j++) {
      const opcaoVoto = enquete.opcoesDeVoto[j];
      if (opcaoVoto.disputas.includes(disputa._id)) {
        CSV += opcaoVoto._id + "; " + opcaoVoto.titulo + "\r\n";
      }
    }

    CSV += "\r\n";
    CSV += "Votos" + "\r\n";
    CSV += "\r\n";
    CSV += "Voto Id; Nome; Peso; Voto; Data \r\n";

    for (let h = 0; h < enquete.votos.length; h++) {
      let voto = JSON.parse(JSON.stringify(enquete.votos[h]));
      if (voto.disputaId === disputa._id) {
        CSV += voto._id + ";" + voto.pessoa.nome +";" + voto.peso + ";" + voto.opcaoVotoTitulo + ";" + $geralService.getDataHoraFormatada(voto.created_at) + "\r\n";
      }
    }
  }

  let fileName = "eleicao_" + enquete._id + "_" + $geralService.getDataHoraFormatada(new Date());
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

export const getCSVCompletoVotacaoFechada = async (enquete: any) => {
  const { $geralService } = useNuxtApp();

  let CSV = "";
  CSV += "Eleição Id;" + enquete._id + "\r\n";
  CSV += "Eleição Título;" + enquete.titulo + "\r\n";
  CSV += "Início;" + $geralService.getDataHoraFormatada(enquete.inicio) + "\r\n";
  CSV += "Fim;" + $geralService.getDataHoraFormatada(enquete.fim) + "\r\n";
  CSV += "\r\n";
  CSV += "Disputas \r\n";
  for (let i = 0; i < enquete.disputas.length; i++) {
    CSV += enquete.disputas[i]._id + ";" + enquete.disputas[i].descricao + "\r\n";
  }
  CSV += "\r\n";
  CSV += "Opções de Voto (Ordem Randômica) \r\n";

  // shuffle(enquete.opcoesDeVoto);
  enquete.opcoesDeVoto = enquete.opcoesDeVoto
    .map((a: any) => ({ sort: Math.random(), value: a }))
    .sort((a: any, b: any) => a.sort - b.sort)
    .map((a: any) => a.value);

  for (let i = 0; i < enquete.opcoesDeVoto.length; i++) {
    CSV += enquete.opcoesDeVoto[i]._id + "\r\n";
  }

  CSV += "\r\n";
  CSV += "Votos \r\n";
  CSV += "\r\n";
  CSV += "Voto Id; Pessoa Id; Peso; Disputa Id; Escolha Id; Data \r\n";

  for (let i = 0; i < enquete.votos.length; i++) {
    let voto = JSON.parse(JSON.stringify(enquete.votos[i]));
    CSV += voto._id + ";" + voto.pessoa._id + ";" + voto.peso + ";" + voto.disputaId + ";" + voto.opcoesDeVotoId + ";" + $geralService.getDataHoraFormatada(voto.created_at) + "\r\n";
  }

  let fileName = "eleicao_" + enquete._id + "_" + $geralService.getDataHoraFormatada(new Date());
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

export const getCSVCompleto = async (votacaoId: any) => {
  const ret = await useCustomFetch("votacao/getPopulate", "post", { filtro: { _id: votacaoId }, populateObj:[{path: "votos.pessoa", select:{nome: 1, apelido: 1}}] } , undefined);

  if (ret.valido) {
    const enquete = ret.data[0];

    if (enquete.votacaoAberta) {
      return await getCSVCompletoVotacaoAberta(enquete);
    } else {
      return await getCSVCompletoVotacaoFechada(enquete);
    }
  } else {
    return ret;
  }
};


