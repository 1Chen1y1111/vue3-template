import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./styles/tailwind.css";
import router from "./routes";
import { setupDirectives } from "./directives";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
setupDirectives(app);

app.mount("#app");
