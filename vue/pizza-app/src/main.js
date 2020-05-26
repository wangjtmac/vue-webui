// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import {routes} from "./router";

Vue.config.productionTip = false;
Vue.use(VueRouter);


const router = new VueRouter({
  routes,
  mode:'history',
  scrollBehavior (to, from, savedPosition) {
    // return {x:0,y:100};

    // return {selector : '.btn'};

    if(savedPosition){
      return savedPosition;
    }else {
      return {x:0,y:0};
    }
  }
});




//全局守卫
/*router.beforeEach((to,from,next) => {


  //判断  store.getter.isLogin === false

  if(to.path === '/login' || to.path === '/register'){
    next();
  }else {
    alert('还没有登录，请先登录！');
    next('./login');
  }
});*/

//后置钩子
/*router.afterEach((to,from) => {
    alert('after each');
});*/


/* eslint-disable no-new */
new Vue({
  router,
  el: '#app',
  /*components: { App },
  template: '<App/>'*/
  render: h => h(App)
});
