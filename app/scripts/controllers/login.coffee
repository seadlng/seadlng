'use strict'

angular.module('seadlngApp')
  .controller 'LoginCtrl', ($scope, Auth, $location) ->
    $scope.user = {}
    $scope.errors = {}

    $scope.login = (form) ->
      $scope.submitted = true
      
      if form.$valid
        Auth.login(
          email: $scope.user.email
          password: $scope.user.password
        )
        .then ->
          window.history.back()
          # Logged in, redirect to home
          #$location.path '/'
        .catch (err) ->
          err = err.data;
          $scope.errors.other = err.message;
