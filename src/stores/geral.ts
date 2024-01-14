import { defineStore, acceptHMRUpdate } from "pinia";
import constantes from "../service/constantes";
import geralService from "../service/GeralService";
import { Notify, Dialog } from "quasar";
import LoginModal from "../components/LoginModal.vue";

const delay = (t: number) => new Promise((r) => setTimeout(r, t));

export const useGeral = defineStore("geral", {
  state: () => ({
    funcoesSistema: [] as Array<any>,
    funcoesAcessos: {} as any,
    alterarSenha: null,
    theme: { dark: false },
    pessoa: null as any,
    token: null as string | null,
    entidade: null as any,
    logado: false,
    editando: false,
    iniciou: false,
    tokens: { expiracao: 0, expiracaoMaster: 0, sessao: 0, sessaoMaster: 0 },
  }),
  getters: {
    tempoExpiracao: (state) => {
      return geralService.getDuration(state.tokens.expiracao, "mm:ss");
    },
    tempoExpiracaoMaster: (state) => {
      return geralService.getDuration(state.tokens.expiracaoMaster, "HH:mm:ss");
    },
    tokenValido: (state) => state.tokens.expiracao > 0,
    tokenMasterValido: (state) => state.tokens.expiracaoMaster > 0,
  },

  actions: {
    async decrementExpiracao(value: number) {
      const interval = 1000;
      this.tokens.expiracao = geralService.getDiffDateAtual(value);
      this.tokens.sessao = Date.now();
      const sessaoInicial = this.tokens.sessao;
      if (this.tokens.expiracao <= 0) return;
      while (
        this.tokens.expiracao > 0 &&
        this.tokens.sessao === sessaoInicial
      ) {
        this.$patch((state) => {
          state.tokens.expiracao = state.tokens.expiracao - interval;
          if (state.tokens.expiracao < 0) {
            state.tokens.expiracao = 0;
            state.tokens.sessao = 0;
          }
        });
        await delay(interval);
      }
    },
    async decrementExpiracaoMaster(value: number) {
      const interval = 1000;
      this.tokens.expiracaoMaster = geralService.getDiffDateAtual(value);
      this.tokens.sessaoMaster = Date.now();
      const sessaoInicial = this.tokens.sessaoMaster;
      if (this.tokens.expiracaoMaster <= 0) return;
      while (
        this.tokens.expiracaoMaster > 0 &&
        this.tokens.sessaoMaster === sessaoInicial
      ) {
        this.$patch((state) => {
          state.tokens.expiracaoMaster =
            state.tokens.expiracaoMaster - interval;
          
          if (state.tokens.expiracaoMaster < 0) {
            state.tokens.expiracaoMaster = 0;
            state.tokens.sessaoMaster = 0;
             setTimeout(() => {
               Dialog.create({
                 component: LoginModal,
                 persistent: true,
                 componentProps: {
                   entidadeId: state.entidade._id
                 },
               }).onOk(async (data) => {
                 
               });
             }, 500);
            
            // setTimeout(() => {
            //   Dialog.create({
            //     title: "Atenção",
            //     message:
            //       "Sua sessão expirou! É necessário fazer login novamente.",
            //   });
            // }, 400);

            // navigateTo("/login");
          }
        });
        await delay(interval);
      }
    },
    verificaAcesso(funcao: string, notificar: boolean) {
      if (notificar) {
        if (this.funcoesAcessos[funcao]) {
          return true;
        } else {
          Notify.create({
            type: "warning",
            message: "Você não tem permissão para esta ação!",
          });
          return false;
        }
      } else {
        return this.funcoesAcessos[funcao];
      }
    },
    reset() {
      this.pessoa = null;
      this.entidade = null;
      this.token = null;
      this.funcoesSistema = [];
      this.funcoesAcessos = {};
      this.entidade = null;
      this.logado = false;
      this.tokens = {
        expiracao: 0,
        expiracaoMaster: 0,
        sessao: 0,
        sessaoMaster: 0,
      };
    },

    async setPessoa(pessoa: any, call?: Function) {
      if (pessoa !== null) {
        this.pessoa = pessoa;
        this.logado = true;
        if (call) {
          await call();
        }
      } else {
        this.reset();
      }
    },

    setEntidade(entidade: any) {
      if (entidade === null) {
        this.reset();
      } else {
        this.entidade = entidade;
      }
    },

    setTheme(theme: any) {
      this.theme = theme;
      // Vue.prototype.$geralService.useTheme();
    },

    setEditando(editando: boolean) {
      this.editando = editando;
    },

    setToken(token: string) {
      if (this.pessoa && token) {
        this.token = token;
      } else {
        this.reset();
      }
    },

    setFuncoesSistema(acesso: any) {
      if (acesso) {
        if (this.pessoa._id === "5aff4d2f47667633c7ace227") {
          const funcoes: Array<any> = [];
          const funcoesAcessos: any = {};
          for (
            let index2 = 0;
            index2 < constantes.FUNCOES_SISTEMA.length;
            index2++
          ) {
            const element = constantes.FUNCOES_SISTEMA[index2];
            funcoes.push(element.id);
            funcoesAcessos[element.variavel] = true;
          }
          this.funcoesSistema = funcoes;
          this.funcoesAcessos = funcoesAcessos;
        } else if (acesso) {
          const funcoes: any = [];
          const funcoesAcessos: any = {};
          for (let index = 0; index < acesso.acessosSistema.length; index++) {
            const acessoSistema = acesso.acessosSistema[index];
            Array.prototype.push.apply(funcoes, acessoSistema.funcoesSistema);
          }
          Array.prototype.push.apply(funcoes, acesso.funcoesExtras);

          for (
            let index = 0;
            index < acesso.funcoesRestritivas.length;
            index++
          ) {
            const element = acesso.funcoesRestritivas[index];
            for (let index2 = 0; index2 < funcoes.length; index2++) {
              const element2 = funcoes[index2];
              if (element2 === element) {
                funcoes.splice(index2, 1);
                index2--;
              }
            }
          }

          for (let index = 0; index < funcoes.length; index++) {
            const funcao = funcoes[index];
            for (
              let index2 = 0;
              index2 < constantes.FUNCOES_SISTEMA.length;
              index2++
            ) {
              const element = constantes.FUNCOES_SISTEMA[index2];
              if (element.id === funcao) {
                funcoesAcessos[element.variavel] = true;
                break;
              }
            }
          }
          this.funcoesSistema = funcoes;
          this.funcoesAcessos = funcoesAcessos;
        } else {
          this.funcoesSistema = [];
          this.funcoesAcessos = {};
        }
      } else {
        this.funcoesSistema = [];
        this.funcoesAcessos = {};
      }
    },

    setFuncoesAcessos(funcoes: any) {
      if (funcoes) {
        this.funcoesAcessos = funcoes;
      } else {
        this.funcoesAcessos = {};
      }
    },

    setAlterarSenha(alterarSenha: any) {
      this.alterarSenha = alterarSenha;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGeral, import.meta.hot));
}
