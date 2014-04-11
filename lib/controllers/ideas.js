'use strict';

var mongoose = require('mongoose'),
    Idea = mongoose.model('Idea'),
    passport = require('passport'),
    updateVoting, createVotingScheme;

createVotingScheme = function(idea,rootId, level) {
  var vote, weight;
  level = level || 1;
  weight = 1/(level*2.2);
  Idea.findById(rootId, function (err, root) {
      if (!root) return;
      vote = {
        voter: root.user,
        weight: weight
      };
      idea.voters.push(vote);
      idea.save();
      createVotingScheme(idea,root.root,level+1);
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
    owner: user._id,
    voters: [{
      voter: user._id,
      weight: 1
    }]
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
    if (root !== undefined) createVotingScheme(idea,root);
    return res.json(idea);
  });
};

/**
 *  Get profile of specified Idea
 */
exports.read = function (req, res, next) {
  var ideaId = req.params.id;

  Idea
    .findById(ideaId)
    .populate('root')
    .populate('branches')
    .exec( function (err, idea) {
    if (err) return next(err);
    if (!idea) return res.send(404);

    res.send({
      data: idea,
      page: 1,
      pages: 1,
      total: 1,
      per: 1,
      dataTotal: 1
    });
  });
};

/**
 * Get all Ideas
 */
exports.readAll = function(req, res, next) {
  Idea
    .find({})
    .sort('-updated')
    .limit(10)
    .populate('root')
    .populate('branches')
    .exec( function (err, ideas) {
      var data = [];
      ideas.forEach(function(idea) {
        data.push(idea);
      });
      Idea
        .count({})
        .exec( function (err, count) {
          res.send({
            data: data,
            page: 1,
            pages: count/10,
            total: count,
            per: 10,
            dataTotal: data.length
          });
      });  
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
    .populate('root')
    .populate('branches')
    .exec( function (err, ideas) {
      var data;
      if (per > 1) {
        data = [];
        ideas.forEach(function(idea) {
          data.push(idea);
        });
      }
      else {
        data = ideas[0];
      }
      Idea
        .count({})
        .exec( function (err, count) {
          res.send({
            data: data,
            page: parseInt(page)+1,
            pages: count/per,
            total: count,
            per: per,
            dataTotal: data.length
          });
      });  
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
    .populate('root')
    .populate('branches')
    .exec( function (err, ideas) {
      var data;
      if (per > 1) {
        data = [];
        ideas.forEach(function(idea) {
          data.push(idea);
        });
      }
      else {
        data = ideas[0];
      }
      Idea
        .count({})
        .exec( function (err, count) {
          res.send({
            data: data,
            page: parseInt(page)+1,
            pages: count/per,
            total: count,
            per: per,
            dataTotal: data.length
          });
      });  
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

/**
 * Vote for Idea
 */
exports.vote = function (req, res, next) {
  var ideaId = req.params.id,
      user = req.user,
      total = 0,
      vote, votes, weight, voters, i;
  Idea
  .findById(ideaId)
  .populate('root')
  .exec(function (err, idea) {
    if (err) return next(err);
    if (!idea) return res.send(404);
    if ((idea.root === undefined)||(idea.branch_status.isMerged)) 
      return res.json(409, {error: 'Idea is already merged or is not a branch'});
    if (user === undefined) {
      return res.json(403,{weight: total*100, error: "Must be logged in to vote!"});
    }
    votes = idea.branch_status.votes;
    for (i = votes.length - 1; i >= 0; i--) {
      if (user._id.equals(votes[i].voter)) {
        vote = i;
      }
      else
        total += votes[i].weight;
    }
    if (vote !== undefined) {
      votes.splice(i,1);
      idea.updated = Date.now();
      idea.save();
      return res.json(200,{weight: total*100});
    }
    voters = idea.root.voters;
    vote = undefined;
    for (i = voters.length - 1; i >= 0; i--) {
      if (user._id.equals(voters[i].voter)) vote = voters[i];
    }
    if (vote !== undefined) {
      votes.push(vote);
      idea.updated = Date.now();
      idea.save();
      return res.json(200,{weight: total*100});
    }
    else return res.json(403,{weight: total*100, error: "You can't vote on this idea!"});
  });
};

/**
 * Update root voting privelages
 */
updateVoting = function (user, ideaId, level) {
  level = level || 1;
  var weight = 1/(level*3),
      vote, voters;
  Idea.findById(ideaId, function (err, idea) {
    voters = idea.voters;
    for (var i = voters.length - 1; i >= 0; i--) {
      if (user._id.equals(voters[i].voter)) {
        vote = voters[i];
        break;
      }
    }
    if (vote === undefined) {
      vote = {
        voter: user._id,
        weight: weight
      };
      voters.push(vote);
    }
    else {
      if (weight > vote.weight) vote.weight = weight;
    }
    idea.save();
    if (idea.root !== undefined)
      updateVoting(user, idea.root, level+1);
  });
};

/**
 * Merge the Idea
 */
 exports.merge = function (req, res, next) {
  var ideaId = req.params.id,
      total = 0,
      votes;

  Idea.findById(ideaId, function (err, idea) {
    if (err) return next(err);
    if (!idea) return res.send(404);
    if ((idea.root === undefined)||(idea.branch_status.isMerged)) 
      return res.json(409, {error: 'Idea is already merged or is not a branch'});
    votes = idea.branch_status.votes;
    for (var i = votes.length - 1; i >= 0; i--) {
      if (votes[i].vote) total += votes[i].weight;
    }
    if (total >= 1) {
      idea.branch_status.isMerged = true;
      idea.save();
      updateVoting(req.user, idea.root);
    }
    res.send({isMerged:idea.branch_status.isMerged});
  });
};
