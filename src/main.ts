import { createApp } from "vue";
import App from "./App.vue";
import "./styles/tailwind.css";
import router from "./routes";

const app = createApp(App);

app.use(router).mount("#app");
