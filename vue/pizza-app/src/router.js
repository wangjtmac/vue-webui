import Home from './components/Home'
import Menu from './components/Menu'
import Admin from './components/Admin'
import About from './components/about/About'
import Login from './components/Login'
import Register from './components/Register'
//二级路由
import Contact from './components/about/Contact'
import Delivery from './components/about/Delivery'
import History from './components/about/History'
import OrderingGuide from './components/about/OrderingGuide'



export const routes = [
    {path: '/', name: "homeLink", components:{
      default : Home ,
        'orderingGuide':OrderingGuide,
        'history':History,
        'delivery':Delivery
      }},
    {path: '/menu', name: "menuLink", component: Menu},
    {path: '/admin', name: "adminLink", component: Admin //, beforeEnter: (to ,from , next) =>{
      //路由独享守卫
      // alert('非登录状态,不能访问！');
      // next(false);
      // }
    },
    {
      path: '/about', name: "aboutLink",redirect: "/about/contact", component: About, children: [
        {path:'/about/contact', name : 'contactLink' , component: Contact },
        {path:'/delivery', name : 'deliveryLink' , component: Delivery },
        {path:'/history', name : 'historyLink' , component: History },
        {path:'/orderingGuide', name : 'orderingGuideLink' , component: OrderingGuide },
      ]
    },
    {path: '/login', name: "loginLink", component: Login},
    {path: '/register', name: "registerLink", component: Register},
    {path: '*', redirect: "/"},
  ];
