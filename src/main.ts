import App from './App.vue'
import { createApp } from 'vue'
import { setupRouter } from './router'

function bootstrap() {
  const app = createApp(App)
  setupRouter(app)
  app.mount('#app')
}

bootstrap()
