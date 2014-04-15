'use strict'

angular.module('seadlngApp')
  .controller 'NewIdeaCtrl', ($scope) ->
    $scope.awesomeThings = [
      'HTML5 Boilerplate'
      'AngularJS'
      'Karma'
    ]
    
    $scope.idea = {}
    $scope.submit = ->

      error = $scope.error.title = true unless $scope.idea.title.length > 0
      error = $scope.error.summary = true unless $scope.idea.summary.length > 0
      error = $scope.error.tags = true unless $scope.idea.tags.length > 0

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