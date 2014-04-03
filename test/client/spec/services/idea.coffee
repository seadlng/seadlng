'use strict'

describe 'Service: Idea', () ->

  # load the service's module
  beforeEach module 'seadlngApp'

  # instantiate service
  Idea = {}
  beforeEach inject (_$httpBackend_,_Idea_) ->
    $httpBackend = _$httpBackend_
    Idea = _Idea_

  it 'should get a good idea', () ->
    Idea.get(0).success (_idea_) ->
      goodIdea = _idea_
      $httpBackend.flush()
      expect(goodIdea.title).toBe "Good Idea"

  it 'should get a bad idea', () ->
    Idea.get(1).success (_idea_) ->
      goodIdea = _idea_
      $httpBackend.flush()
      expect(goodIdea.title).toBe "Bad Idea"
