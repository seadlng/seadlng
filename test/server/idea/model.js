'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    app = require('../../../server'),
    Idea = mongoose.model('Idea');

var idea,
    badOwnerIdea;

describe('Idea Model', function() {
  before(function(done) {
    idea = new Idea({
      title: "Good Idea",
      summary: "Good Idea summary",
      owner: "533f6ab6ec7b0c1d2e4a63ec",
      tags: ["Test1"],
    });
    badOwnerIdea = new Idea({
      title: "Good Idea",
      summary: "Good Idea summary",
      owner: "533f6ab6ec7b0c1d2e4a63ed",
      tags: ["Test1"],
    });

    // Clear ideas before testing
    Idea.remove().exec();
    done();
  });

  afterEach(function(done) {
    Idea.remove().exec();
    done();
  });

  it('should begin with no ideas', function(done) {
    Idea.find({}, function(err, ideas) {
      ideas.should.have.length(0);
      done();
    });
  });

  it('should fail when saving with a nonexistant owner', function(done) {
    badOwnerIdea.save(function(err) {
      should.exist(err);
      done();
    });
  });
  it('should not fail when saving with an existing owner', function(done) {
    idea.save(function(err) {
      should.not.exist(err);
      done();
    });
  });

});