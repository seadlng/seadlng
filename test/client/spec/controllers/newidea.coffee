'use strict'

describe 'Controller: NewIdeaCtrl', () ->

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


