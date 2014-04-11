'use strict'

angular.module('seadlngApp')
  .factory 'Idea', ($http) ->

    # Public API here
    {
      get: (id) ->
        $http.get("/api/ideas/#{id}")

      getAll: (page, per) ->
        page = page-1 || 0
        page = 0 if page < 0
        per = per || 15
        $http.get("/api/ideas/page/#{page}/#{per}")
    }
