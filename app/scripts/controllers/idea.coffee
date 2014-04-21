'use strict'

angular.module('seadlngApp').controller 'IdeaCtrl', ($scope, $http, $routeParams, $route, $timeout, $location, Idea, User) ->
  getIdea = (idea) ->
    User.query({id: idea.owner}).$promise.then (data) ->
      idea.owner = data.profile
    idea.votePercent = 0
    idea.single = true if $scope.single
    for vote in idea.branch_status.votes
      idea.votePercent += vote.weight*100
      voted = true if $scope.user isnt undefined and $scope.user._id is vote.voter
    idea.novote = voted
    idea.mergedBranches = []
    idea.unmergedBranches = []
    $http.get("/api/users/#{idea.owner}").success (data, status, headers, config) ->
      idea.profile = data.profile
      idea.deleteable = idea.editable = idea.owner == $scope.user._id
      idea.deleteable = true if $scope.user.role == "admin"
      idea.edited = idea.created != idea.updated
      idea.edit = {}
      idea.edit.summary = {}
      idea.edit.append = {}
      idea.edit.summary.editing = false
      idea.edit.summary.edit = ->
        idea.edit.summary.editing = !idea.edit.summary.editing
        if idea.edit.summary.editing
          idea.edit.summary.original = idea.summary
          idea.edit.append.original = idea.append
      idea.edit.summary.cancel = ->
        idea.summary = idea.edit.summary.original
        idea.append = ""
        idea.edit.summary.edit()
      idea.edit.summary.submit = ->
        $http.put("/api/ideas/#{idea._id}",idea).success((data, status, headers, config) ->
          idea.edit.summary.edit()
          idea.edited = true
          if idea.summary_lock
            idea.appended_summary.push(idea.append)
            idea.append = ""
        ).error(idea.httpError)
    for branch in idea.branches
      branch.votePercent = 0
      for vote in branch.branch_status.votes
        branch.votePercent += vote.weight*100
      if branch.branch_status.isMerged
        idea.mergedBranches.push(branch)
      else
        idea.unmergedBranches.push(branch)
    idea.delete = ->
      $http.delete("/api/ideas/#{idea._id}").success((data, status, headers, config) ->
        $location.path "/ideas"
      ).error(idea.httpError)
    idea.branchIt = ->
      console.log "/idea/#{idea._id}/new/branch"
      $location.path "/idea/#{idea._id}/new/branch"
    idea.vote = ->
      $http.put("/api/ideas/#{idea._id}/vote").success((data, status, headers, config) ->
        idea.votePercent = data.weight  if data.weight isnt undefined
        idea.mergeIdea() if idea.votePercent >= 100
      ).error(idea.httpError)
    idea.mergeIdea = ->
      $http.put("/api/ideas/#{idea._id}/merge").success (data, status, headers, config) ->
        mergeStatus = data
        $timeout (->
          idea.branch_status.isMerged = mergeStatus
        ), 600
    idea.newComment = {
      active: false
      comment: ""
    }
    idea.newCommentSuccess = (data, status, headers, config) ->
      idea.newComment.comment = ""
      idea.newComment.active = false
      data.created = Date.now()
      data.updated = data.created
      idea.getComment(data)
      idea.comments.push(data)
    idea.newComment.submit = ->
      $http.put("/api/ideas/#{idea._id}/comment",idea.newComment).success(idea.newCommentSuccess).error(idea.httpError) 

    idea.getComment = (comment) ->
      unless comment.profile
        $http.get("/api/users/#{comment.owner}").success (data, status, headers, config) ->
          comment.profile = data.profile
          comment.deleteable = comment.editable = comment.owner == $scope.user._id && !comment.deleted
          comment.deleteable = true if $scope.user.role == "admin" and !comment.deleted
          comment.editStatus = "edit"
          comment.edited = comment.created != comment.updated && !comment.deleted
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
                ).error(idea.httpError)

          comment.change = ->
            if comment.original == comment.comment
              comment.editStatus = "cancel"
            else
              comment.editStatus = "submit"
            comment.editable = comment.comment != ""

          comment.cancel = ->
            comment.comment = comment.original
            comment.edit()
          comment.delete = ->
            $http.delete("/api/ideas/#{$scope.ideas[0]._id}/comment/#{comment._id}").success((data, status, headers, config) ->
              comment.editing = false
              if data.fullDelete
                $scope.ideas[0].comments.splice $scope.ideas[0].comments.indexOf(comment)
              else 
                comment.deleted = true
                comment.comment = data.comment
                comment.editable = comment.deleteable = false
            ).error(idea.httpError)

    idea.httpError = (data, status, headers, config) ->
      if data.error isnt undefined
        $scope.alerts.push
          type: "danger"
          msg: data.error
        console.log data.error

  $scope.closeAlert = (index) ->
    $scope.alerts.splice index, 1

  $scope.switchPage = (newPage) ->
    $location.path("/ideas/#{newPage}/#{$scope.ideasPer}")

  #Main
  $scope.user = User.get()
  $scope.alerts = []
  data = $route.current.locals.loadIdea.data
  if data.dataTotal > 1
    $scope.ideas = data.data
  else 
    $scope.single = true
    $scope.ideas = [data.data]
  for idea in $scope.ideas
    getIdea(idea)
    if $scope.ideas.length == 1
      for comment in idea.comments
        idea.getComment(comment)
  $scope.page = data.page
  $scope.numPages = data.pages
  $scope.totalIdeas = data.total
  $scope.ideasPer = data.per
