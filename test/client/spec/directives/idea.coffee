'use strict'

describe 'Directive: idea', () ->

  # load the directive's module
  beforeEach module 'seadlngApp'

  scope = {}

  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
