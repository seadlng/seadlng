'use strict';

var mongoose = require('mongoose'),
    Idea = mongoose.model('Idea'),
    passport = require('passport');


/**
 *  Get profile of specified Idea
 */
exports.show = function (req, res, next) {
  var IdeaId = req.params.id;

  if (IdeaId === "0") {
    res.send({
      _id: 0,
      title: "Good Idea",
      summary: "Good Idea summary"
    });
  }
  else {
    res.send({
      _id: 1,
      title: "Bad Idea",
      summary: "Bad Idea summary"
    });
  }
};

/**
 * Get all Ideas
 */
exports.showAll = function(req, res, next) {
  Idea.find({}, function (err, ideas) {
      var ideaMap = {};
      ideas.forEach(function(idea) {
        ideaMap[idea._id] = idea;
      });
      res.send(ideaMap);  
   });
};


