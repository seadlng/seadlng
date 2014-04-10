'use strict'

describe 'Controller: IdeaCtrl(Good Idea)', () ->

  # load the controller's module
  beforeEach module 'seadlngApp'

  IdeaCtrl = {}
  scope = {}
  $httpBackend = {}

  routeParamsStub = jasmine.createSpy('routeParamsStub')
  routeParamsStub.id = 0
###
  # Initialize the controller and a mock scope
  beforeEach inject (_$httpBackend_, $controller, $rootScope) ->
    $httpBackend = _$httpBackend_
    $httpBackend.expectGET('/api/ideas/0').respond {data: [{_id: 0,title: "Good Idea",summary: "Good Idea summary"}]}
    scope = $rootScope.$new()
    routeParams = 
    IdeaCtrl = $controller 'IdeaCtrl', {
      '$scope': scope
      '$routeParams': routeParamsStub
    }

  it 'should attach a good idea to the scope', () ->
    expect(scope.ideas).toBeUndefined()
    $httpBackend.flush()
    expect(scope.ideas[0]._id).toBe 0
    expect(scope.ideas[0].title).toBe "Good Idea"

describe 'Controller: IdeaCtrl(Bad Idea)', () ->

  # load the controller's module
  beforeEach module 'seadlngApp'

  IdeaCtrl = {}
  scope = {}
  $httpBackend = {}

  routeParamsStub = jasmine.createSpy('routeParamsStub')
  routeParamsStub.id = 1

  # Initialize the controller and a mock scope
  beforeEach inject (_$httpBackend_, $controller, $rootScope) ->
    $httpBackend = _$httpBackend_
    $httpBackend.expectGET('/api/ideas/1').respond {_id: 1,title: "Bad Idea",summary: "Good Idea summary"}
    scope = $rootScope.$new()
    routeParams = 
    IdeaCtrl = $controller 'IdeaCtrl', {
      '$scope': scope
      '$routeParams': routeParamsStub
    }

  it 'should attach a bad idea to the scope', () ->
    expect(scope.idea).toBeUndefined()
    $httpBackend.flush()
    expect(scope.idea._id).toBe 1
    expect(scope.idea.title).toBe "Bad Idea"
###