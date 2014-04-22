'use strict'

angular.module('seadlngApp')
  .directive('idea', () ->
    templateUrl: 'partials/singleIdea.html',
    #template: '<h1>{{idea.title}}</h1>',
    restrict: 'E',
    scope: {idea: '=' }
    link: (scope, element, attrs) ->
      
  )
