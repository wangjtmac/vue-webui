// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App'
import VueResource from 'vue-resource';

import Test from "./components/test";
import Users from "./components/users";

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.config.productionTip = false;



const Foo = { template: `
    <div id="app">
    <ul>
      <li>
        <router-link to="/">Users</router-link>
      </li>
      <li>
        <router-link to="./test">Test</router-link>
      </li>
    </ul>
    <div>
      <router-view></router-view>
    </div>
  </div>
` };

//设置路由

const routes = [
  { path:'/', component: Users },
  { path:'/test',component: Test }
];
const router = new VueRouter({
  mode:'history',
  // base:__dirname,
  routes: routes
});


/* eslint-disable no-new */
new Vue({
  el:"#app",
  router ,
  render: h => h(Foo)
});
