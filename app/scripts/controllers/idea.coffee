'use strict'

angular.module('seadlngApp')
  .controller 'IdeaCtrl', ($scope, $http) ->
    $http.get('/api/awesomeThings').success (awesomeThings) ->
      $scope.awesomeThings = awesomeThings