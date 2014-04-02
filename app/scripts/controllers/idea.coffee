'use strict'

angular.module('seadlngApp').controller 'IdeaCtrl', ($scope, $http, $routeParams, Idea) ->
	$http.get("/api/ideas/#{$routeParams.id}").success (idea) ->
		console.log(idea)
		$scope.idea = idea
	$http.get('/api/awesomeThings').success (awesomeThings) ->
		$scope.awesomeThings = awesomeThings