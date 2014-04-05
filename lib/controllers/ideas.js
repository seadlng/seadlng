'use strict';

var mongoose = require('mongoose'),
    Idea = mongoose.model('Idea'),
    passport = require('passport');


/**
 *  Get profile of specified Idea
 */
exports.show = function (req, res, next) {
  var ideaId = req.params.id;

  Idea.findById(ideaId, function (err, idea) {
    if (err) return next(err);
    if (!idea) return res.send(404);

    res.send(idea);
  });
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


