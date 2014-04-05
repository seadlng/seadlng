'use strict'

describe 'Service: Idea', () ->

  # load the service's module
  beforeEach module 'seadlngApp'

  # instantiate service
  Idea = {}
  beforeEach inject (_$httpBackend_,_Idea_) ->
    $httpBackend = _$httpBackend_
    Idea = _Idea_

  it 'should get a good idea', (ideaList) ->
    Idea.get('533f5868fe0156a5203f1cbe').success (_idea_) ->
      goodIdea = _idea_
      $httpBackend.flush()
      expect(goodIdea.title).toBe "Good Idea"

  it 'should get a bad idea', (ideaList) ->
    Idea.get('533f59d5c3808ecf21393c9b').success (_idea_) ->
      goodIdea = _idea_
      $httpBackend.flush()
      expect(goodIdea.title).toBe "Bad Idea"
