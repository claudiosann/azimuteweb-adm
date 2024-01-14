<template>
<q-dialog :position="position" v-model="$parent.showBuscarPessoa" full-width :content-css="{minWidth: '80vw', minHeight: '200px;', maxWidth:'380px;', width: '90%', height: '400px'}">
    <q-card style="max-width: 400px !important">
        <!-- GO toolbar -->
        <q-toolbar v-if="showBar" class="bg-primary text-white">
            <q-icon name="mdi-account-search" size="30px" />
            <q-toolbar-title>Localizar Pessoa</q-toolbar-title>
            <q-btn flat round dense @click="cancel" icon="close" />
        </q-toolbar>
        <q-card-section>
          <q-input class="q-mb-md" placeholder="Nome, Número CBO, CPF ou E-mail" outlined autofocus hint="Pressione ENTER para localizizar" label="Localizar" ref="nome" v-model="nome" @keyup.enter="buscarPessoa">
        <template v-slot:append>
          <q-btn @click="buscarPessoa" round dense color="primary" icon="search" />
        </template>
          </q-input>
          <q-list class="rounded-borders" separator bordered v-if="!muitosResultados && listaPessoas.length > 0" highlight inset-separator>
                <q-item clickable v-ripple @click="confirm(pessoa)" v-for="pessoa in listaPessoas" :key="pessoa._id">
                    <q-item-section avatar>
                      <q-avatar size="64px">
                        <q-img :src="getUrlImagem(pessoa)"></q-img>
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label lines="1">{{ pessoa.nome }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>

            <div  style="margin-top:5px;"  v-if="!muitosResultados && listaPessoas.length===0">
                Nenhum Resultado.
            </div>
            <div style="margin-top:5px;" v-if="muitosResultados">
                Muitos Resultados! Melhore seu filtro.
            </div>

      </q-card-section>
    </q-card>
</q-dialog>
</template>

<script>
export default {
  // GO props
  props: {
    position: { type: String, default: undefined },
    showBar: { type: Boolean, default: true }
  },
  data () {
    return {
      listaPessoas: [],
      muitosResultados: false,
      nome: ''
    };
  },
  // GO valida
  // GO create
  created () {},
  mounted () {
    // setTimeout(() => {
    //   this.$refs['entidade.codigoInterno'].focus();
    // }, 500);
  },
  methods: {
    getUrlImagem: function (pessoa) {
      return this.$geralService.getUrlS3Thumb(pessoa.foto, {
        height: 128
      });
    },
    buscarPessoa: function () {
      if (this.nome) {
        this.$axios.post(this.$configuracoes.BASE_REST + 'buscarPessoa', {
          filtro: this.getFiltro(),
          maxRetorno: 10
        })
          .then((result) => {
            if (result.data.valido) {
              this.muitosResultados = false;
              this.listaPessoas = result.data.data;
            } else {
              if (result.data.data.erroMaxRetorno) {
                this.muitosResultados = true;
              } else {
                console.error(result.data);
                this.$q.notify({
                  position: 'top',
                  icon: 'error',
                  color: 'negative',
                  message: 'Falha ao buscar pessoas!'
                });
                this.muitosResultados = false;
              }
              this.listaPessoas = [];
            }
          }).catch((error) => {
            console.error(error);
            this.$q.notify({
              position: 'top',
              icon: 'error',
              color: 'negative',
              message: 'Erro de comunicação!'
            });
          });
      } else {
        this.listaPessoas = [];
      }
    },
    // GO cancel
    cancel () {
      // this.$q.notify({
      //   position: 'top',
      //   icon: 'warning',
      //   color: 'warning',
      //   message: 'Ação cancelada!'
      // });
      this.$parent.showBuscarPessoa = false;
    },
    // GO confirm
    confirm (pessoa) {
      this.$parent.showBuscarPessoa = false;
      this.$emit('confirmSelecao', pessoa);
    },
    isNumeric (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },
    validateEmail (email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },
    getFiltro () {
      const filtro = {};

      console.log(this.nome);

      if (this.nome.length > 0) {
        if (this.isNumeric(this.nome)) {
          if (this.nome.length === 11) {
            filtro.cpf = this.nome;
          } else {
            filtro.rg = {
              $regex: '.*' + this.nome + '.*'
            };
          }
        } else {
          if (this.validateEmail(this.nome)) {
            filtro.email = {
              $regex: '.*' + this.nome + '.*'
            };
          } else {
            filtro.nome = {
              $regex: '.*' + this.nome + '.*', $options: 'i'
            };
          }
        }
      }

      // if (this.cpf.length > 0) {
      //   filtro.cpf = this.cpf;
      // }
      // if (this.rg.length > 0) {
      //   filtro.rg = this.rg;
      // }
      // if (this.email.length > 0) {
      //   filtro.email = this.email;
      // }
      console.log(filtro);
      return filtro;
    }
  }
};
</script>

<style>
.titulo-nfe {
    margin-top: 20px;
    margin-bottom: 20px;
}

@media (max-width: 575px) {
    .margin-extra {
        margin-top: 20px;
    }
}

@media (min-width: 768px) {
    .titulo-nfe {
        padding-left: 15px;
    }
}

@media (min-width: 576px) {
    .titulo-nfe {
        padding-left: 10px;
    }
}
</style>
