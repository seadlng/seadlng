'use strict'

angular.module('seadlngApp')
  .controller 'NewIdeaCtrl', ($scope) ->
    $scope.awesomeThings = [
      'HTML5 Boilerplate'
      'AngularJS'
      'Karma'
    ]

$scope.submit = ->
  
  if $scope.title.length == 0
    $scope.error.title = error = true
  else $scope.error.title = error = false
    
    
  $scope.idea.tags = (tag.trim() for tag in $scope.tags.split ",")

  $http.post("/api/ideas/new",$scope.idea).success((data, status, headers, config) ->
    #do stuff
  ).error (data, status, headers, config) ->
    if data.error isnt undefined
      $scope.alerts.push
        type: "danger"
        msg: data.error
      console.log data.error