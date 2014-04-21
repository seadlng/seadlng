"use strict"

angular.module("seadlngApp")
  .factory "User", ($resource) ->
    $resource "/api/users/:id",
      id: "@id"
    ,
      update:
        method: "PUT"
        params: {}

      get:
        method: "GET"
        params:
          id: "me"

      query:
        method: "GET"
        params:
          id: '@id'
        

