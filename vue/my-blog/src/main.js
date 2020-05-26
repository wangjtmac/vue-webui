// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueResource from 'vue-resource'



import 'assets/jquery/dist/jquery.min.js'
import 'assets/popper/dist/popper.min.js'
import 'assets/bootstrap/dist/js/bootstrap.js'



Vue.use(ElementUI);
Vue.use(VueResource);



Vue.config.productionTip = false


/* eslint-disable no-new */
new Vue({
  el: '#app',
  render:h => h(App),
 /* components: { App },
  template: '<App/>'*/
});
