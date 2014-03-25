'use strict'

angular.module('seadlngApp')
  .factory 'Session', ($resource) ->
    $resource '/api/session/'
