'use strict'

angular.module('seadlngApp')
  .controller 'LoginCtrl', ($scope, Auth, $location) ->
    $scope.user = {}
    $scope.errors = {}
    path = $location.search().r
    $scope.redirect = "?r=#{path}"

    $scope.login = (form) ->
      $scope.submitted = true
      
      if form.$valid
        Auth.login(
          email: $scope.user.email
          password: $scope.user.password
        )
        .then ->
          $location.path if path then path else '/profile'
          $location.search('r',null)
          # Logged in, redirect to home
          #$location.path '/'
        .catch (err) ->
          err = err.data;
          $scope.errors.other = err.message;
