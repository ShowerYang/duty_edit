import Vue from 'vue'
import App from './App.vue'
import store from './store'
// i18n
import i18n from './lang/i18n';
// axios
import axios from 'axios'
import VueAxios from 'vue-axios' 
Vue.use(VueAxios, axios)

Vue.config.productionTip = false

new Vue({
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
