'use strict'

angular.module('seadlngApp').controller 'IdeaCtrl', ($scope, $http, $routeParams, $route, $timeout, $location, Idea, User) ->
  getIdea = (idea) -> 
    idea.votePercent = 0
    for vote in idea.branch_status.votes
      idea.votePercent += vote.weight*100
      voted = true if $scope.user isnt undefined and $scope.user._id is vote.voter
    idea.novote = voted
    idea.mergedBranches = []
    idea.unmergedBranches = []
    for branch in idea.branches
      branch.votePercent = 0
      for vote in branch.branch_status.votes
        branch.votePercent += vote.weight*100
      if branch.branch_status.isMerged
        idea.mergedBranches.push(branch)
      else
        idea.unmergedBranches.push(branch)
  mergeIdea = ->
    $http.put("/api/ideas/#{idea._id}/merge").success (data, status, headers, config) ->
      mergeStatus = data
      $timeout (->
        idea.branch_status.isMerged = mergeStatus
      ), 600

  $scope.vote = (idea) ->
    $http.put("/api/ideas/#{idea._id}/vote").success((data, status, headers, config) ->
      idea.votePercent = data.weight  if data.weight isnt undefined
      mergeIdea(idea) if idea.votePercent >= 100
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

  $scope.switchPage = (newPage) ->
    $location.path("/ideas/#{newPage}/#{$scope.ideasPer}")

  #Main
  $scope.user = User.get()
  window.user = $scope.user
  data = $route.current.locals.loadIdea.data
  window.data = data
  if data.dataTotal > 1
    $scope.ideas = data.data
  else 
    $scope.ideas = [data.data]
  for idea in $scope.ideas
    getIdea(idea)
  $scope.page = data.page
  $scope.numPages = data.pages
  $scope.totalIdeas = data.total
  $scope.ideasPer = data.per
