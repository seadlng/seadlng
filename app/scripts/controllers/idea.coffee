'use strict'

angular.module('seadlngApp').controller 'IdeaCtrl', ($scope, $http, $routeParams, Idea) ->
  Idea.get($routeParams.id).success (_idea_) ->
    $scope.idea = _idea_
    if $scope.idea.root != undefined
      Idea.get($scope.idea.root).success (_root_) ->
        $scope.root = _root_
      $scope.idea.votePercent = 0
      for vote in $scope.idea.branch_status.votes
        $scope.idea.votePercent += vote.weight*100
    $scope.mergedBranches = []
    $scope.unmergedBranches = []
    for branch in $scope.idea.branches
      Idea.get(branch).success (_branch_) ->
        _branch_.votePercent = 0
        for vote in _branch_.branch_status.votes
          _branch_.votePercent += vote.weight*100
        if _branch_.branch_status.isMerged
          $scope.mergedBranches.push(_branch_)
        else
          $scope.unmergedBranches.push(_branch_)
