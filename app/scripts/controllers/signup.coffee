'use strict'

angular.module('seadlngApp')
  .controller 'SignupCtrl', ($scope, Auth, $location) ->
    $scope.user = {}
    $scope.errors = {}
    path = $location.search().r
    $scope.redirect = "?r=#{path}"
    
    $scope.register = (form) ->
      $scope.submitted = true

      if form.$valid
        Auth.createUser(
          name: $scope.user.name
          email: $scope.user.email
          password: $scope.user.password
        ).then( ->
          $location.path if path then path else '/'
          $location.search('r',null)
          # Account created, redirect to home
          #$location.path '/'
        ).catch( (err) ->
          err = err.data
          $scope.errors = {}
          
          # Update validity of form fields that match the mongoose errors
          angular.forEach err.errors, (error, field) ->
            form[field].$setValidity 'mongoose', false
            $scope.errors[field] = error.type
        )