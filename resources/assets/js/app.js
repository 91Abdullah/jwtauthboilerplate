
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

gorillaApp.config([
    '$stateProvider', 
    '$urlRouterProvider', 
    '$authProvider', 
    '$httpProvider', 
    '$provide',
    function($stateProvider, $urlRouterProvider, $authProvider, $httpProvider, $provide) {

            // Setup for the $httpInterceptor
            $provide.factory('redirectWhenLoggedOut', ['$q', '$injector', function($q, $injector) {
                return {

                    responseError: function(rejection) {
                        // Need to use $injector.get to bring in $state or else we get
                        // a circular dependency error

                        var state = $injector.get('$state');

                        // Instead of checking for a status code of 400 which might be used
                        // for other reasons in Laravel, we check for the specific rejection
                        // reasons to tell us if we need to redirect to the login state

                        var rejectionReason = ['token_not_provided', 'token_expired', 'token_invalid', 'token_absent'];

                        // Loop through each rejection reason and redirect to the login
                        // state if one is encountered
                        angular.forEach(rejectionReason, function(value, key) {
                            if(rejection.data.reason === value) {
                                // If we get a rejection corresponding to one of the reasons
                                // in our array, we know we need to authenticate the user so 
                                // we can remove the current user from local storage
                                localStorage.removeItem('user');

                                // Send the user to the auth state so they can login
                                $state.go('auth');
                            }
                        });

                        return $q.reject(rejection);
                    }

                }
            }]);

            // Push the new factory onto the $http interceptor array
            $httpProvider.interceptors.push('redirectWhenLoggedOut');

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

gorillaApp.run(['$rootScope', '$state', function($rootScope, $state) {
    // $stateChangeStart is fired whenever the state changes. We can use some parameters
    // such as toState to hook into details about the state as it is changing

    //Setup appName
    $rootScope.appName = "Laravel-AngularJS JWT Auth Boilerplate";
    $rootScope.state = $state;

    $rootScope.$on('$stateChangeStart', function(event, toState) {
        // Grab the user from local storage and parse it to an object
        var user = JSON.parse(localStorage.getItem('user'));

        // If there is any user data in local storage then the user is quite
        // likely authenticated. If their token is expired, or if they are
        // otherwise not actually authenticated, they will be redirected to
        // the auth state because of the rejected request anyway
        if(user) {
            // The user's authenticated state gets flipped to
            // true so we can now show parts of the UI that rely
            // on the user being logged in

            $rootScope.authenticated = true;

            // Putting the user's data on $rootScope allows
            // us to access it anywhere across the app. Here
            // we are grabbing what is in local storage

            $rootScope.currentUser = user;

            // If the user is logged in and we hit the auth route we don't need
            // to stay there and can send the user to the main state

            if(toState.name === 'auth') {
                // Preventing the default behavior allows us to use $state.go
               // to change states
               event.preventDefault();

               // go to the "main" state which in our case is users
               $state.go('users');
            }
        }
    })
}])

gorillaApp.controller('AuthController', ['$auth', '$state', '$http', '$rootScope', function($auth, $state, $http, $rootScope) {
    var vm = this;

    vm.login = function() {
        var credentials =  {
            email: vm.email,
            password: vm.password
        }

        $auth.login(credentials).then(function(data) {
            // Return an $http request for the now authenticated
            // user so that we can flatten the promise chain
            return $http.get('api/authenticate/user').then(function(response) {

                var user = JSON.stringify(response.data.user);

                localStorage.setItem('user', user);

                $rootScope.authenticated = true;

                $rootScope.currentUser = response.data.user;

                $state.go('users');

            });
        }, function(error) {
            vm.loginError = true;
            vm.loginErrorText = error.data.error;
            //console.log(error.data.error);
        // Because we returned the $http.get request in the $auth.login
        // promise, we can chain the next promise to the end here
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

gorillaApp.controller('LogoutController', ['$auth', '$rootScope', '$state', function($auth, $rootScope, $state) {
    var vm = this;
    vm.logout = function() {
        $auth.logout().then(function() {
            localStorage.removeItem('user');

            $rootScope.authenticated = false;

            $rootScope.currentUser = null;
        }).then(function() {
            $state.go('auth');
        });
    }
    //console.log($state);
}]);
