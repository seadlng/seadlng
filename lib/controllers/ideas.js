'use strict';

var mongoose = require('mongoose'),
    Idea = mongoose.model('Idea'),
    passport = require('passport');

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
  if (root !== undefined) {
    Idea.findById(root, function (err, rootIdea) {
      if (!rootIdea) return res.json(400, err);
      rootIdea.branches.push(idea);
      rootIdea.save();
    });
  }
  idea.save(function (err) {
    if (err) return res.json(400, err);
    user.ideas.push(idea);
    user.save();
    return res.json(idea);
  });
};

/**
 *  Get profile of specified Idea
 */
exports.read = function (req, res, next) {
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
exports.readAll = function(req, res, next) {
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
exports.readAllPage = function(req, res, next) {
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
exports.readAllTag = function(req, res, next) {
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
 * Edit Idea
 */
exports.edit = function (req, res, next) {
  var ideaId = req.params.id,
      tags = req.body.tags,
      summary = req.body.summary,
      lock = req.body.lock,
      force = req.body.force,
      admin = false,
      user = req.user;
  admin = (user.role === "admin");

  Idea.findById(ideaId, function (err, idea) {
    if (err) return next(err);
    if (!idea) return res.send(404);
    if ((!user._id.equals(idea.owner))&&(!admin)) return res.send(403);
    if ((lock !== undefined)&&(admin))
      idea.summary_lock = lock;
    if ((!idea.summary_lock)||(admin&&force))
      idea.summary = summary;
    else
      idea.appended_summary.push(summary);
    if ((tags !== undefined)&&(tags.length > 0)) idea.tags = tags;
    idea.save();

    res.send(idea);
  });
};

/**
 * Delete Idea
 */
exports.del = function(req, res, next) {
  var user = req.user,
      ideaId = req.params.id;
  Idea.findById(ideaId, function (err, idea) {
    if (err) return next(err);
    if (!idea) return res.send(404);
    if ((!user._id.equals(idea.owner))&&(user.role !== "admin")) return res.send(403);
    idea.remove(function (err, idea) {
      if (err) return res.json(500,err);
    });
    
  });
};