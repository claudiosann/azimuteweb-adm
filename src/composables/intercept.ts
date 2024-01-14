import { Dialog } from "quasar";
import LoginModal from "../components/LoginModal.vue";

export const useCustomFetch = async (
  url: string,
  method: any,
  data: any,
  headers: any
) => {
  const runTimeConfig = useRuntimeConfig();
  const geral: any = useGeral();
  const token: any = useCookie("__bew");
  const tkMaster: any = useCookie("__ret");
  const { $geralService } = useNuxtApp();
  const yul = $geralService.configuracoes._urj;

  try {
    // console.log('revalidando');
    if (
      await revalidateToken(
        token.value,
        tkMaster.value,
        yul,
        geral.pessoa._id
      )
    ) {
      const ret: any = await $fetch(`${runTimeConfig.public.baseUrl}${url}`, {
        method: method,
        body: data,
        headers: headers
          ? headers
          : (geral.token 
          ? { "x-access-token": geral.token, "enc": true }
          : undefined),
      });

      if (ret.valido) {
        return ret;
      } else {
        console.log(ret);
        if (ret.data && ret.data.message) { return ret; } else {
              return {
                valido: false,
                data: {
                  message: "Falha de Comunicação",
                },
              };
          
          }
      }
    } else {
      setTimeout(() => {
        Dialog.create({
          component: LoginModal,
          persistent: true,
          componentProps: {
            entidadeId: geral.entidade._id,
          },
        }).onOk(async (data) => {
          console.log("OKlogin", data);
        });
      }, 500);
      return {
        valido: false,
        expirou: true,
        data: { message: "Falha de autenticação!" },
      };
    }
  } catch (error) {
    console.log(error);
    return { valido: false, data: { message: "Falha na Comunicação!" } };
  }
};


export const useCustomFetchOld = async (url: string, method: any, data: any, pessoa: any,  headers: any) => {
  const runTimeConfig = useRuntimeConfig();
  const geral: any = useGeral();
  const token: any = useCookie("__bew");
  const tkMaster: any = useCookie("__ret");
  const { $geralService } = useNuxtApp();
  const yul = $geralService.configuracoes._urj;

  try {
    console.log(pessoa);
    console.log(pessoa);
    
       if (await revalidateToken(token.value, tkMaster.value, yul, geral.pessoa._id)) {
         const ret: any = await $fetch(`https://www.cbo.org.br/azimuteweb_ws/webresources/${url}`, {
           method: method,
           body: data,
           headers: headers ? headers : pessoa.token ? { 'token': pessoa.token, 'usuario': pessoa.id, 'origin': 'https://www.cbo.org.br' } : undefined,
         });
         if (ret.valido) {
           return ret;
         } else {
           return {
             valido: false,
             data: {
               message: ret.jsonMsg && ret.jsonMsg.geral ? ret.jsonMsg.geral : "Falha de Comunicação",
             },
           };
         }
       } else {
         setTimeout(() => {
           Dialog.create({
             component: LoginModal,
             persistent: true,
             componentProps: {},
           }).onOk(async (data) => {
             // console.log("OKlogin", data);
           });
         }, 500);
         return {
           valido: false,
           expirou: true,
           data: { message: "Falha de autenticação!" },
         };
       }
  } catch (error) {
    console.log(error);
    return { valido: false, data: { message: "Falha na Comunicação!" } };
  }
};
