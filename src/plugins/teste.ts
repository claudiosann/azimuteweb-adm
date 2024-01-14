export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('page:start', () => {
        console.log("Start Page");
    });
});
