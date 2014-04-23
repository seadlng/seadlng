'use strict'

angular.module('seadlngApp').controller 'UserCtrl', ($scope, $route, User) ->
  
  #Main
  $scope.user = $route.current.locals.loadUser.profile
  for idea in $scope.user.ideas.ideas
  	User.query({id: idea.owner}).$promise.then (data) ->
      idea.owner = data.profile
  for idea in $scope.user.ideas.following
  	User.query({id: idea.owner}).$promise.then (data) ->
      idea.owner = data.profile
  for idea in $scope.user.ideas.favorites
  	User.query({id: idea.owner}).$promise.then (data) ->
      idea.owner = data.profile
  console.log($scope.user)
