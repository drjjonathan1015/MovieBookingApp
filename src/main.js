import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { initEmailJS } from './services/emailService'
import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() {
    console.log("New update available");
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  }
});

initEmailJS()

createApp(App)
  .use(createPinia())
  .use(router)
  .mount("#app");
