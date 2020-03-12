import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    linkActiveClass: 'active',
    routes: [
        {
            path: '/',
            component: () => import("./views/Index.vue"),
            children: [
                {
                    path: '',
                    redirect: '/todolist/home'
                },
                {
                    path: '/todolist/home',
                    name: 'home',
                    component: () => import( './views/Home.vue')
                }
            ]
        },
        {
            path: '/datacenter',
            beforeEnter: (to, from, next) => {
                window.location.href = "/datacenter.html"
            }
        },
        {
            path : '/todolist.html',
            redirect: '/'
        },
        {
            path: '*',
            component: (resolve) => require(['../../components/error/Error404.vue'], resolve)
        }
    ]
});

router.beforeEach((to, from, next) => {
    if (to.matched.length === 0) {  //如果未匹配到路由
        from.path ? next({path: from.path}) : next('/todolist/home');   //如果上级也未匹配到路由则跳转主页面，如果上级能匹配到则转上级路由
    } else {
        next();    //如果匹配到正确跳转
    }
});
export default router