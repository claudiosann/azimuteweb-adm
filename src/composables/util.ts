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
        console.log("O token curto expirou e será relavidado!");
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
          console.log("Token curto revalidado com sucesso!");
          return true;
        } else {
          // TODO mostrar mensagens
          return false;
        }
      } else {
        console.log("O Token longo exprirou!");
      }
    }
  } else {
    console.log('esta vazio');
  }
  return false;
};
