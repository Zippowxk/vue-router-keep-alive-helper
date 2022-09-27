import Vue from '../../debug/vue.js'
// import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

const app = new Vue({
  router,
  render: function (h) { return h(App) }
})
router.onReady(() => app.$mount('#app'))
