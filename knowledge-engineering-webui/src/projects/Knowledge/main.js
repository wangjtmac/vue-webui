import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false;
import Axios from 'axios';
const axios = Axios.create({
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
});
Vue.prototype.$axios = axios;

import api from '@/api/index'
Vue.prototype.$http = api;
import url from '@/api/apiurl'
Vue.prototype.$url = url;

//element ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

//全局函数
import global_func from '@/api/global_func'
Vue.use(global_func);
//引入使用的插件脚本
import global_js_file from '@/api/global_js_file'


//引入 右键菜单
import ContextMenu from "@/components/subGroup/ContextMenu"
Vue.use(ContextMenu)


/*配置后端路径*/
/*第一层if判断生产环境和开发环境*/
if (process.env.NODE_ENV === 'production') {
    /*第二层if，根据.env文件中的VUE_APP_FLAG判断是生产环境还是测试环境*/
    if (process.env.VUE_APP_FLAG === 'pro') {
        //production 生产环境
        axios.defaults.baseURL = 'http://192.168.120.191:8090/knowledge';
    } else {
        //test 测试环境
        axios.defaults.baseURL = 'http://192.168.120.191:8090/knowledge';
    }
} else {
    //dev 开发环境
    axios.defaults.baseURL = 'http://192.168.23.210:8090/knowledge';
}

let loadingInstance;
//请求拦截
axios.interceptors.request.use(config => {
    /* loadingInstance  = Loading.service({
         fullscreen: true
     });*/
    return config;
}, error => {
    return Promise.reject(error);
});

// 响应拦截
axios.interceptors.response.use(responce => {
    // loadingInstance.close();
    return responce;
}, error => {
    //错误提醒
    // loadingInstance.close();
    return Promise.reject(error);
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')

