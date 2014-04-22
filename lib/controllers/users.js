'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport');

/**
 * Create user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.save(function(err) {
    if (err) return res.json(400, err);
    
    req.logIn(newUser, function(err) {
      if (err) return next(err);

      return res.json(req.user.userInfo);
    });
  });
};


exports.readAll = function(req, res, next) {
  User.find({}, function (err, users) {
      var userMap = {};
      users.forEach(function(user) {
        userMap[user._id] = user.profile;
      });
      res.send(userMap);  
   });
};

/**
 * Change password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return res.send(400);

        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get current user
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};

/**
 * Gets user and populates associated ideas
 */
exports.read = function(req, res, next) {
  var userId = req.params.id;

  User
    .findById(userId)
    .populate('ideas.ideas')
    .populate('ideas.favorites')
    .populate('ideas.following')
    .exec( function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(404);

    res.send({ profile: user.profile });
  });
};

/**
 *  
 */
exports.editIdeas = function(req, res, next) {
  var userId = req.params.id,
      ideaId = req.body.idea,
      category = req.body.category;
  console.log(req.method);
  console.log(req.body);
  if ((category !== "ideas")&&
      (category !== "favorites")&&
      (category !== "following")) {
    return res.json(400,{error: "Idea must be in ideas, favorites, or following!"});
  }
  if (!req.user || !req.user._id.equals(userId)) {
    return res.json(403,{error:"Unauthorized"});
  }
  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(404);
    if (req.method === 'DELETE') {
      user.ideas[category].splice(
        user.ideas[category].indexOf(userId)
      );  
      user.save();
      res.send({ success: true });
    }
    else {
      user.ideas[category].push(ideaId);
      user.save();
      res.send({ success: true });
    }
  });
};