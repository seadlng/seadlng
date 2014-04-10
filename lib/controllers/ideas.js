'use strict';

var mongoose = require('mongoose'),
    Idea = mongoose.model('Idea'),
    passport = require('passport'),
    getUserWeight;

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
    user.ideas.ideas.push(idea);
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
    .sort('-updated')
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
    .sort('-updated')
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
    .sort('-updated')
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
 * Update Idea
 */
exports.update = function (req, res, next) {
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

getUserWeight = function (idea, userId) {
  if (!idea.branch_status.isMerged) {
    return 0;
  }
  else if (userId.equals(idea.owner)) {
    return 1.0;
  }
  else {
    if (idea.branches.length === 0) {
      return 0;
    }
    else {
      var weight = 0,
          subweight = 0,
          owned = 0;
      for (var i = idea.branches.length - 1; i >= 0; i--) {
        subweight = getUserWeight(idea.branches[i],userId);
        if (subweight > 0) owned++;
        weight = subweight/3.0;
      }
      return weight/owned;
    }
  }
};
/**
 * Vote for Idea
 */
exports.vote = function (req, res, next) {
  var ideaId = req.params.id,
      user = req.user,
      total = 0,
      vote, votes, weight;

  Idea.findById(ideaId, function (err, idea) {
    if (err) return next(err);
    if (!idea) return res.send(404);
    if ((idea.root === undefined)||(idea.branch_status.isMerged)) 
      return res.json(409, {error: 'Idea is already merged or is not a branch'});
    if (user === undefined) {
      return res.json(403,{weight: total*100, error: "Must be logged in to vote!"});
    }
    vote = {
        voter: user._id,
        weight: 0
      };
    votes = idea.branch_status.votes;
    for (var i = votes.length - 1; i >= 0; i--) {
      if (user._id.equals(votes[i].voter)) {
        votes.splice(i,1);
        vote = undefined;
        idea.updated = Date.now();
        idea.save();
      }
      else total += vote.weight;
    }
    if (vote !== undefined) {
      Idea
      .findById(idea.root)
      .populate('branches')
      .exec( function (err, root) {
        weight = getUserWeight(root, user._id);
        console.log("weight:" + weight);
        if (weight === 0) return res.json(403,{weight: total*100, error: "You can't vote on this idea!"});
        vote.weight = weight;
        votes.push(vote);
        idea.updated = Date.now();
        idea.save();
        total += weight;
        res.json(200,{weight: total*100});
      });
    }
    else res.json(200,{weight: total*100});
  });
};