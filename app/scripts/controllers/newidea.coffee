'use strict'

angular.module('seadlngApp')
  .controller 'NewIdeaCtrl', ($scope, $http, $location, $routeParams) ->
    
    $scope.idea = {
      title: "",
      summary: "",
      root: $routeParams.id
    }
    $scope.tags =  ""
    $scope.error = {}
    $scope.submit = ->

      error = $scope.error.title = true unless $scope.idea.title.length > 0
      error = $scope.error.summary = true unless $scope.idea.summary.length > 0
      error = $scope.error.tags = true unless $scope.tags.length > 0

      $scope.idea.tags = (tag.trim() for tag in $scope.tags.split ",")

      if not error    
        $http.post("/api/ideas/new",$scope.idea).success((data, status, headers, config) ->
          $location.path "/idea/#{data._id}"
        ).error (data, status, headers, config) ->
          if data.error isnt undefined
            $scope.alerts.push
              type: "danger"
              msg: data.error
            console.log data.error
    $scope.changeErr = ->
      error = $scope.error.title = false if $scope.idea.title.length > 0
      error = $scope.error.summary = false if $scope.idea.summary.length > 0
      error = $scope.error.tags = false if $scope.tags.length > 0