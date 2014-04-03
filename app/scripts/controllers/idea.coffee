'use strict'

angular.module('seadlngApp').controller 'IdeaCtrl', ($scope, $http, $routeParams, Idea) ->
	###$http.get("/api/ideas/#{$routeParams.id}").success (idea) ->
		console.log(idea)
		$scope.idea = idea
	###
	Idea.get($routeParams.id).success (_idea_) ->
		$scope.idea = _idea_