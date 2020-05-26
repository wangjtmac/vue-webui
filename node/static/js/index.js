var myApp = angular.module('myApp',[
    'ui.router'
]);
myApp.config(['$stateProvider','$urlRouterProvider',
    function($stateProvider,$urlRouterProvider){
        $stateProvider.state('home',{
            url : "/home",
            views : {
                header : {
                    template : "<header class=\"page-header my-header\"><h1>myHeader</h1></header>"
                },
                body : {
                    cache:'true',
                    templateUrl : "./views/layout/body.main.tpl.html",
                    controllerUrl : "./views/layout/main-ctrl.js"
                },
                footer : {
                    template : "<footer class=\"fixed-bottom text-center\">&copy;2018 angular</footer>"
                },
            }
        });
        $urlRouterProvider.otherwise('/home');

}]);



