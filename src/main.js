import { createApp } from 'vue'
import './styles/main.scss'
import App from './App.vue'
import router from './router'
import posthog from './plugins/posthog'

createApp(App)
  .use(posthog)
  .use(router)
  .mount('#app')
