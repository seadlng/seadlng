'use strict'

describe 'Controller: NewideaCtrl', () ->

  # load the controller's module
  beforeEach module 'seadlngApp'

  NewideaCtrl = {}
  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    NewideaCtrl = $controller 'NewideaCtrl', {
      $scope: scope
    }

  it 'should attach a list of awesomeThings to the scope', () ->
    expect(scope.awesomeThings.length).toBe 3
