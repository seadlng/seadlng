'use strict'

describe 'Directive: idea', () ->

  # load the directive's module
  beforeEach module 'seadlngApp'

  scope = {}

  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()

  it 'should make hidden element visible', inject ($compile) ->
    element = angular.element '<idea></idea>'
    element = $compile(element) scope
    expect(element.text()).toBe 'this is the idea directive'
