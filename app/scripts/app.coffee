'use strict'

angular.module('seadlngApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'monospaced.elastic'
])
  .config ($routeProvider, $locationProvider, $httpProvider) ->
    $routeProvider
      .when '/',
        templateUrl: 'partials/main'
        controller: 'MainCtrl'
      
      .when '/login',
        templateUrl: 'partials/login'
        controller: 'LoginCtrl'
      .when '/signup', 
        templateUrl: 'partials/signup'
        controller: 'SignupCtrl'
      .when '/settings',
        templateUrl: 'partials/settings'
        controller: 'SettingsCtrl'
        authenticate: true
      .when '/idea/new',
        templateUrl: 'partials/newidea',
        controller: 'NewIdeaCtrl'
        authenticate: true
      .when '/idea/:id',
        templateUrl: 'partials/idea',
        controller: 'IdeaCtrl',
        resolve: { 
          loadIdea: (Idea, $route) ->
            Idea.get($route.current.params.id)
        }
      .when '/ideas/:page?/:per?',
        templateUrl: 'partials/idea',
        controller: 'IdeaCtrl',
        resolve: { 
          loadIdea: (Idea, $route) ->
            Idea.getAll($route.current.params.page,$route.current.params.per)
        }
      .when '/idea/:id/new/branch',
        templateUrl: 'partials/newidea',
        controller: 'NewIdeaCtrl',
        authenticate: true
      .when '/profile',
        templateUrl: 'partials/user',
        controller: 'UserCtrl',
        authenticate: true
        resolve: {
          loadUser: (User, $route) ->
            User.get().$promise.then (data) ->
              User.query({id:data._id}).$promise
        }
      .when '/profile/:id',
        templateUrl: 'partials/user',
        controller: 'UserCtrl',
        authenticate: true
        resolve: {
          loadUser: (User, $route) ->
            User.query({id:$route.current.params.id}).$promise
        }
      .otherwise
        redirectTo: '/'

    $locationProvider.html5Mode true
  
    # Intercept 401s and redirect you to login
    $httpProvider.interceptors.push ['$q', '$location', ($q, $location) ->
      responseError: (response) ->
        if response.status is 401
          $location.path '/login'
          $q.reject response
        else
          $q.reject response
    ]
  .run ($rootScope, $location, Auth) ->
    
    # Redirect to login if route requires auth and you're not logged in
    $rootScope.$on '$routeChangeStart', (event, next) ->
      $location.path '/login'  if next.authenticate and not Auth.isLoggedIn()