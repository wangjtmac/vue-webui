import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    linkActiveClass: 'active',
    routes: [
        {
            path : '/',
            redirect: '/knowledge'
        },
        {
            path : '/knowledge',
            redirect: '/knowledge/domain',
            component: () => import("./views/Index.vue"),
            children : [
                {
                    path: 'domain',
                    name: 'domain',
                    component: () => import( './views/domain/domain')
                }, {
                    path: 'feature',
                    name: 'feature',
                    component: () => import( './views/feature')
                }, {
                    path: 'object',
                    name: 'domainObject',
                    component: () => import( './views/domain/object')
                }, {
                    path: 'relation',
                    name: 'domainRelation',
                    component: () => import( './views/domain/relation')
                }, {
                    path: 'behavior',
                    name: 'domainBehavior',
                    component: () => import( './views/domain/behavior')
                }, {
                    path : 'process',
                    redirect: '/knowledge/process/offline',
                    component: () => import('./components/BareRouteView'),
                    children : [
                        {
                            path: 'database',
                            name: 'databaseProcess',
                            component: () => import( './views/process/OfflineDB')
                        }, {
                            path: 'offlineRule',
                            name: 'offlineRuleProcess',
                            component: () => import( './views/process/OfflineRule')
                        }, {
                            path: 'entryHandle',
                            name: 'entryHandle',
                            component: () => import( './views/process/EntryHandle')
                        }
                    ]
                }, {
                    path: 'setting',
                    redirect: '/knowledge/setting/basic',
                    component: () => import('./components/BareRouteView'),
                    children : [
                        {
                            path: 'basic',
                            name: 'basicSetting',
                            component: () => import( './views/setting/basic')
                        }
                    ]
                }, {
                    path: 'langMaterial',
                    redirect: '/knowledge/langMaterial/preTreatment',
                    component: () => import('./components/BareRouteView'),
                    children : [
                        {
                            path: 'preTreatment',
                            name: 'preTreatment',
                            component: () => import( './views/langMaterial/preTreatment')
                        }, {
                            path: 'mark',
                            name: 'langMark',
                            component: () => import( './views/langMaterial/mark')
                        }
                    ]
                }
            ]
        },
        {
            path: '/todolist',
            beforeEnter: (to, from, next) => {
                window.location.href = "/todolist.html"
            }
        },
        {
            path : '/knowledge.html',
            redirect: '/'
        },
        {
            path: '*',
            component: () => import('../../components/error/Error404.vue')
        }

    ]
});

router.beforeEach((to, from, next) => {
    if (to.matched.length === 0) {  //如果未匹配到路由
        from.path ? next({path: from.path}) : next('/');   //如果上级也未匹配到路由则跳转主页面，如果上级能匹配到则转上级路由
    } else {
        next();    //如果匹配到正确跳转
    }
});
export default router
