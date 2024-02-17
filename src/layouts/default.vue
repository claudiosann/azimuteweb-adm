<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <ClientOnly>
      <q-toolbar :class="$q.dark.isActive ? 'text-grey-2 bg-gray-800' : 'bg-grey-2 text-grey-9'">
        <q-avatar class="my-2" style="font-size: 50px;" rounded>
          <q-img class="hover:scale-115  transition duration-300" v-if="geral.entidade"
            :src="getUrlImagem(geral.entidade.logo)" />
        </q-avatar>
        <q-toolbar-title>
          <q-item style="padding: 0px !important;">
            <q-item-section v-if="geral.entidade">
              <q-item-label class="text-2xl text-weight-medium" lines="1">{{ geral.entidade ? (geral.entidade.sigla + ' - ') : '' }}
                Administrativo</q-item-label>
              <q-item-label class="mt-0! text-subtitle1" lines="1">{{ geral.entidade.nomeRazao }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-toolbar-title>
       
        
          <q-btn class="btn-scale q-mr-sm" push glossy round v-if="geral.entidade && geral.logado"
            @click="toggleLeftDrawer" aria-label="Menu Sistema" icon="menu" />

          <q-btn push glossy round dark:text-black bg-gray-700 text-white dark:bg-gray-200 btn-scale
            :icon="isDark ? 'contrast' : 'dark_mode'" @click="toggleDark()" />
      </q-toolbar>
      </ClientOnly>
      <!-- <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar> -->
    </q-header>

    <q-drawer :width="310" v-model="leftDrawerOpen" show-if-above bordered>
      <ClientOnly>
      <q-list>
         <div class="flex justify-between"  :class="{ 'text-grey-6': $q.dark.isActive, 'text-grey-8': !$q.dark.isActive }" v-if="geral.pessoa" style="background: rgba(128,128,128,0.1) !important; padding: 4px !important;">
          
              <q-avatar v-if="geral.pessoa.foto" m-1 style="font-size: 50px;" rounded>
                  <q-img class="rounded-borders" style="width: 48px;" :ratio="32 / 32" :src="getUrlImagem(geral.pessoa.foto)">
                  </q-img>
              </q-avatar>
              <q-avatar v-else m-1 style="font-size: 50px;" rounded>
                  <q-icon name="person" size="30px"/>
              </q-avatar>
       
          <q-item-section class="ml-2">
              <q-item-label font-bold lines="1">{{ geral.pessoa.apelido ? geral.pessoa.apelido : geral.pessoa.nome }}</q-item-label>
              <q-item-label caption v-if="geral.pessoa.vinculo">{{ geral.pessoa.vinculo.tipoLigacao }}</q-item-label>
          </q-item-section>
           <q-item-section avatar>
             <q-btn class="q-mr-sm" outline v-if="geral.logado" dense @click="logout" aria-label="Logout" label="logout" icon="logout"/>
          </q-item-section>

      </div>



<MenuSistema></MenuSistema>
        <!-- <EssentialLink v-for="link in essentialLinksDy" :key="link.title" v-bind="link" /> -->
        <!-- <q-item clickable @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Logout</q-item-label>
            <q-item-label caption>
              Fazer Logout
            </q-item-label>
          </q-item-section>
        </q-item> -->
        <q-item>
          <q-item-section avatar>
            <q-icon name="timer" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Validade Sessão</q-item-label>
            <q-item-label caption>
               <div class="mr-2">Curta {{ geral.tempoExpiracao }}</div>

            </q-item-label>
            <q-item-label caption>

          <div>Longa {{ geral.tempoExpiracaoMaster }}</div>
            </q-item-label>
          </q-item-section>
        </q-item>
          <EssentialLink v-if="geral.pessoa._id == '5aff4d2f47667633c7ace227'" link="/conversao" color="bg-gradient-to-l from-rose-500  to-yellow-700" icon="home_work"
                    title="Conversão (Suporte)" :caption="`Conversão de dados`"
                     />
      </q-list>
      </ClientOnly>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { EssentialLinkProps } from "../components/EssentialLink.vue";
import { useDark, useToggle } from "@vueuse/core";
import { useQuasar } from "quasar";

const { $geralService } = useNuxtApp();
const usuarioC = useCookie("__oir");
const tokenAzimuteweb = useCookie("__bew");
const vinculo = useCookie("__olu");
const geral = useGeral();

const getUrlImagem = (imagem: any) => {
  return $geralService.getUrlS3Thumb(imagem, { height: 128 });
};


const $q = useQuasar();

const isDark = useDark({
  selector: "html",
  attribute: "class",
  valueDark: "dark",
  valueLight: undefined,
});

const toggleDarkGeral = useToggle(isDark);

const toggleDark = () => {
  toggleDarkGeral();
  $q.dark.toggle();
};
const logout = () => {
  geral.reset();
  usuarioC.value = null;
  tokenAzimuteweb.value = "";
  vinculo.value = "";
  navigateTo('/login')
};


const essentialLinksDy: any = computed(() => {
  if (geral.logado) {
    const essentialLinks: EssentialLinkProps[] = [
      // {
      //   title: "Dashboard",
      //   caption: "Painel de Informações",
      //   icon: "dashboard",
      //   link: "/",
      // },
      // {
      //   title: "Teste",
      //   caption: "Teste Page",
      //   icon: "mood",
      //   link: "/teste",
      // },
      {
        title: "Perfis de Acessos",
        caption: "Funções de Acesso ao sistema",
        icon: "badge",
        link: "/cadastro/PerfisDeAcessos",
      },
      {
        title: "Grupos Esportivos",
        caption: "Grupos Esportivos",
        icon: "scatter_plot",
        link: "/cadastro/GruposEsportivos",
      },
    ];
    return essentialLinks;
  } else {
    const essentialLinks: EssentialLinkProps[] = [
      {
        title: "Recuperar Senha",
        caption: "Esqueci minha senha",
        icon: "settings_backup_restore",
        link: "/esqueciMinhaSenha",
      },
      {
        title: "Cadastro",
        caption: "Novo Cadastro",
        icon: "person",
        link: "/cadastro",
      },
      {
        title: "Login",
        caption: "Login",
        icon: "login",
        link: "/login",
      }
    ];
    return essentialLinks;
  }
});

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
onMounted(() => {
  $q.dark.set(isDark.value);
});

// useHead({
//   script: [
//     {
//       src: 'https://maps.googleapis.com/maps/api/js?v=3.52&key=AIzaSyBYArIKIP3RXubz_6gNW_3oBu0JNH9-sZA&libraries=places,staticmap,drawing',
//       // valid options are: 'head' | 'bodyClose' | 'bodyOpen'
//       tagPosition: 'bodyClose'
//     }
//   ]
// });
</script>
