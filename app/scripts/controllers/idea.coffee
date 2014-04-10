'use strict'

angular.module('seadlngApp').controller 'IdeaCtrl', ($scope, $http, $routeParams, $route, $timeout, Idea, User) ->
  getIdea = -> 
    $scope.idea.votePercent = 0
    for vote in $scope.idea.branch_status.votes
      $scope.idea.votePercent += vote.weight*100 if vote.vote
      voted = true if $scope.user isnt undefined and $scope.user._id is vote.voter and vote.vote 
    $scope.novote = voted
    $scope.mergedBranches = []
    $scope.unmergedBranches = []
    for branch in $scope.idea.branches
      branch.votePercent = 0
      for vote in branch.branch_status.votes
        branch.votePercent += vote.weight*100 if vote.vote
      if branch.branch_status.isMerged
        $scope.mergedBranches.push(branch)
      else
        $scope.unmergedBranches.push(branch)
  mergeIdea = ->
    $http.put("/api/ideas/#{$scope.idea._id}/merge").success (data, status, headers, config) ->
      mergeStatus = data
      $timeout (->
        $scope.idea.branch_status.isMerged = mergeStatus
      ), 600

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