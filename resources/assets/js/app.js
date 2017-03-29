
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');
require('angular');
require('angular-ui-router');
require('satellizer');

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

var gorillaApp = angular.module('gorillaApp', ['ui.router', 'satellizer']);

gorillaApp.config(['$stateProvider', '$urlRouterProvider', '$authProvider', function($stateProvider, $urlRouterProvider, $authProvider) {
    // Satellizer configuration that specifies which API
            // route the JWT should be retrieved from
            $authProvider.loginUrl = '/api/authenticate';

            // Redirect to the auth state if any other states
            // are requested other than users
            $urlRouterProvider.otherwise('/auth');
            
            $stateProvider
                .state('auth', {
                    url: '/auth',
                    templateUrl: '../views/authView.html',
                    controller: 'AuthController as auth'
                })
                .state('users', {
                    url: '/users',
                    templateUrl: '../views/userView.html',
                    controller: 'UserController as user'
                });
}]);

gorillaApp.controller('AuthController', ['$auth', '$state',function($auth, $state) {
    var vm = this;

    vm.login = function() {
        var credentials =  {
            email: vm.email,
            password: vm.password
        }

        $auth.login(credentials).then(function(data) {
            //if Login success redirect to users $state
            $state.go('users', {});
        });
    }
}]);

gorillaApp.controller('UserController', ['$http', function($http) {

    var vm = this;

    vm.users = {};
    vm.error = '';

    vm.getUsers = function() {
        $http.get('api/authenticate').then(function(data) {
            vm.users = data.data;
            //console.log(data.data);
        }, function(error) {
            vm.error = error;
        });
    }

}]);
