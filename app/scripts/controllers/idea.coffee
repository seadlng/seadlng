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

  mergeIdea = (idea) ->
    $http.put("/api/ideas/#{idea._id}/merge").success (data, status, headers, config) ->
      mergeStatus = data
      $timeout (->
        idea.branch_status.isMerged = mergeStatus
      ), 600

  commentSuccess = (data, status, headers, config) ->
    $scope.newComment.comment = ""
    $scope.newComment.active = false
    data.created = Date.now()
    data.updated = data.created
    getComment(data)
    $scope.comments.push(data)

  getComment = (comment) ->
    unless comment.profile
      $http.get("/api/users/#{comment.owner}").success (data, status, headers, config) ->
        comment.profile = data.profile
        comment.editable = comment.owner == $scope.user._id
        comment.editStatus = "edit"
        comment.edited = comment.created != comment.updated
        comment.edit = ->
          comment.editing = !comment.editing
          if comment.editing
            comment.original = comment.comment
            comment.editStatus = "cancel"
          else
            comment.editStatus = "edit"
            if comment.original != comment.comment
              commentData = {
                comment: comment.comment,
                commentId: comment._id
              }
              $http.put("/api/ideas/#{$scope.ideas[0]._id}/comment",commentData).success((data, status, headers, config) ->
                comment.edited = true
              ).error(httpError)

        comment.change = ->
          if comment.original == comment.comment
            comment.editStatus = "cancel"
          else
            comment.editStatus = "submit"
        comment.cancel = ->
          comment.comment = comment.original
          comment.edit()

  httpError = (data, status, headers, config) ->
    if data.error isnt undefined
      $scope.alerts.push
        type: "danger"
        msg: data.error
      console.log data.error

  $scope.vote = (idea) ->
    $http.put("/api/ideas/#{idea._id}/vote").success((data, status, headers, config) ->
      idea.votePercent = data.weight  if data.weight isnt undefined
      mergeIdea(idea) if idea.votePercent >= 100
    ).error(httpError)
 
  $scope.closeAlert = (index) ->
    $scope.alerts.splice index, 1

  $scope.switchPage = (newPage) ->
    $location.path("/ideas/#{newPage}/#{$scope.ideasPer}")

  #Main
  $scope.user = User.get()
  $scope.alerts = []
  $scope.newComment = {
    active: false
    comment: ""
  }
  data = $route.current.locals.loadIdea.data
  if data.dataTotal > 1
    $scope.ideas = data.data
  else 
    $scope.single = true
    $scope.ideas = [data.data]
    $scope.comments = data.data.comments
    for comment in $scope.comments
      getComment(comment)
    $scope.newComment.submit = ->
      $http.put("/api/ideas/#{data.data._id}/comment",$scope.newComment).success(commentSuccess).error(httpError) 
  for idea in $scope.ideas
    getIdea(idea)
  $scope.page = data.page
  $scope.numPages = data.pages
  $scope.totalIdeas = data.total
  $scope.ideasPer = data.per
