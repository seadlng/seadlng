'use strict'

angular.module('seadlngApp')
  .factory 'Idea', ($http) ->

    # Public API here
    {
      get: (id) ->
        $http.get("/api/ideas/#{id}")
    }
