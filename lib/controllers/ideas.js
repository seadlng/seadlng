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
        voter: root.owner,
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
      rootIdea.summary_lock = true;
      rootIdea.save();
    });
  }
  idea.save(function (err) {
    if (err) return res.json(400, err);
    user.ideas.ideas.push(idea);
    if (root !== undefined) { 
      createVotingScheme(idea,root);
      user.ideas.following.push(root);
    }
    user.save();
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
      append = req.body.append,
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
    if ((!idea.summary_lock)||(admin&&force)) {
      idea.summary = summary;
      idea.updated = Date.now();
    }
    else {
      if (append) summary = append;
      idea.appended_summary.push(summary);
      idea.updated = Date.now();
    }
    if ((tags !== undefined)&&(tags.length > 0)) {
      idea.tags = tags;
      idea.updated = Date.now();
    }
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
    if ((!user._id.equals(idea.owner))&&(user.role !== "admin")) return res.json(403,{error:"Must be owner or admin!"});
    if ((idea.branch_status.isMerged)&&(idea.root !== undefined)) return res.json(403,{error:"Can't delete a merged branch!"});
    idea.remove(function (err, idea) {
      if (err) return res.json(500,err);
      else return res.send(200);
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
      total += vote.weight;
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
      total += votes[i].weight;
    }
    if (total >= 1) {
      idea.branch_status.isMerged = true;
      idea.updated = Date.now();
      idea.save();
      updateVoting(req.user, idea.root);
      res.send({isMerged:true});
    }
    res.send({isMerged:false});
  });
};

/**
 * Create or Edit Comment
 */
exports.comment = function (req, res, next) {
  var ideaId = req.params.id,
      commentText = req.body.comment,
      commentId = req.body.commentId,
      user = req.user,
      newComment = false,
      comment;
  console.log(req.body);
  if (user === undefined) return res.json(403,{error: "Must be logged in to comment!"});
  Idea.findById(ideaId, function (err, idea) {
    if (err) return next(err);
    if (!idea) return res.send(404);
    if (commentId !== undefined)
      comment = idea.comments.id(commentId);
    if (comment !== undefined) {
      comment.comment = commentText;
      comment.updated = Date.now();
    }
    else {
      comment = {
        comment: commentText,
        owner: user._id
      };
      idea.comments.push(comment);
    }
    idea.updated = Date.now();
    idea.save(function (err, idea) {
      user.ideas.following.push(idea);
      user.save();
      res.send(idea.comments[idea.comments.length-1]);
    });
  });
};

/**
 * Delete Comment
 */
exports.deleteComment = function (req, res, next) {
  var ideaId = req.params.id,
      commentId = req.params.commentId,
      user = req.user,
      comment;
  if (commentId === undefined) return  res.json(400,{error: "Comment not specified!"});
  if (user === undefined) return res.json(403,{error: "Must be logged in to remove a comment!"});
  Idea.findById(ideaId, function (err, idea) {
    if (err) return next(err);
    if (!idea) return res.send(404);
    comment = idea.comments.id(commentId);
    if (comment === undefined) res.json(404,{error: "Comment not found!"});
    if ((user._id.equals(comment.owner))||(user.role === "admin")) {
      if (Date.now()/1000 - comment.created/1000 < 60) {
        comment.remove();
        comment = {
          fullDelete: true
        };
      }
      else {
        comment.deleted = true;
        comment.comment = "This comment has been deleted";
        comment.updated = Date.now();
      }
      idea.updated = Date.now();
      idea.save();
    }
    else return res.json(403,{error: "Must be comment owner or admin to delete!"});
    res.send(comment);
  });
};
