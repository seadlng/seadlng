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
  Idea
    .find({})
    .sort('-created')
    .limit(2)
    .exec( function (err, ideas) {
      var ideaMap = {};
      ideas.forEach(function(idea) {
        ideaMap[idea._id] = idea;
      });
      res.send(ideaMap);  
   });
};

/**
 * Get all Ideas
 */
exports.showAllPage = function(req, res, next) {
  var page = req.params.page,
      per = req.params.per;
  if (per === undefined) per = 15;
  Idea
    .find({})
    .sort('-created')
    .skip(page*1)
    .limit(per)
    .exec( function (err, ideas) {
      var ideaMap = {};
      ideas.forEach(function(idea) {
        ideaMap[idea._id] = idea;
      });
      res.send(ideaMap);  
   });
};

/**
 * Get all Ideas with tag
 */
exports.showAllTag = function(req, res, next) {
  var tag = req.params.tag,
      page = req.params.page,
      per = req.params.per;
  if (per === undefined) per = 15;
  if (page === undefined) page = 0;
  Idea
    .find({'tags' : tag})
    .sort('-created')
    .skip(page*1)
    .limit(per)
    .exec( function (err, ideas) {
      var ideaMap = {};
      ideas.forEach(function(idea) {
        ideaMap[idea._id] = idea;
      });
      res.send(ideaMap);  
   });
};

/**
 * Create Idea
 */
exports.create = function(req, res, next) {

  var user = req.user,
      title = req.body.title,
      summary = req.body.summary,
      root = req.body.root,
      tags = req.body.tags,
      idea;
  idea = new Idea({
    title: title,
    summary: summary,
    tags: tags,
    root: root,
    owner: user._id
  });
  idea.save(function (err) {
    if (err) return res.json(400, err);
    user.ideas.push(idea);
    user.save();
    return res.json(idea);
  });
};