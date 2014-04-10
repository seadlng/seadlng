'use strict'

angular.module('seadlngApp').controller 'IdeaCtrl', ($scope, $http, $routeParams, $route, Idea, User) ->
  getIdea = -> 
    if $scope.idea.root != undefined
      Idea.get($scope.idea.root).success (_root_) ->
        $scope.root = _root_
      $scope.idea.votePercent = 0
      for vote in $scope.idea.branch_status.votes
        $scope.idea.votePercent += vote.weight*100 if vote.vote
        voted = true if $scope.user isnt undefined and $scope.user._id is vote.voter and vote.vote 
      $scope.novote = voted
    $scope.mergedBranches = []
    $scope.unmergedBranches = []
    for branch in $scope.idea.branches
      Idea.get(branch).success (_branch_) ->
        _branch_.votePercent = 0
        for vote in _branch_.branch_status.votes
          _branch_.votePercent += vote.weight*100 if vote.vote
        if _branch_.branch_status.isMerged
          $scope.mergedBranches.push(_branch_)
        else
          $scope.unmergedBranches.push(_branch_)
  this.mergeIdea = ->
    $http.put("/api/ideas/#{$scope.idea._id}/merge").success (data, status, headers, config) ->
      $scope.idea = data
      getIdea()
  $scope.vote = ->
    $http.put("/api/ideas/#{$scope.idea._id}/vote").success((data, status, headers, config) ->
      $scope.idea.votePercent = data.weight  if data.weight isnt undefined
      mergeIdea() if $scope.idea.votePercent >= 100
    ).error (data, status, headers, config) ->
      if data.error isnt undefined
        $scope.alerts.push
          type: "danger"
          msg: data.error

        console.log data.error
      return
 
  $scope.alerts = []
  $scope.closeAlert = (index) ->
    $scope.alerts.splice index, 1

  #Main
  $scope.user = User.get()
  window.user = $scope.user
  $scope.idea = $route.current.locals.loadIdea.data
  getIdea()