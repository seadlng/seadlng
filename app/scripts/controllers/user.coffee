'use strict'

angular.module('seadlngApp').controller 'UserCtrl', ($scope, $route) ->
  
  #Main
  $scope.user = $route.current.locals.loadUser.profile
  console.log($scope.user)
