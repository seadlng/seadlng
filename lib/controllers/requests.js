'use strict';

var mongoose = require('mongoose'),
    Request = mongoose.model('Request'),
    passport = require('passport');

/**
 * Create Request
 */
exports.create = function (req, res, next) {
  var user = req.user,
      title = req.body.title,
      summary = req.body.summary,
      tags = req.body.tags,
      request;
  request = new Request({
    title: title,
    summary: summary,
    tags: tags,
    owner: user._id
  });
  request.save(function (err) {
    if (err) return res.json(400, err);
    user.requests.requests.push(request);
    user.save();
    return res.json(request);
  });
};

/**
 *  Get profile of specified Request
 */
exports.read = function (req, res, next) {
  var requestId = req.params.id;

  Request.findById(requestId, function (err, request) {
    if (err) return next(err);
    if (!request) return res.send(404);

    res.send(request);
  });
};

/**
 * Get all Requests
 */
exports.readAll = function (req, res, next) {
  Request
    .find({})
    .sort('-created')
    .limit(2)
    .exec(function (err, requests) {
      var requestMap = {};
      requests.forEach(function (request) {
        requestMap[request._id] = request;
      });
      res.send(requestMap);
    });
};

/**
 * Get all Requests
 */
exports.readAllPage = function (req, res, next) {
  var page = req.params.page,
    per = req.params.per;
  if (per === undefined) per = 15;
  Request
    .find({})
    .sort('-created')
    .skip(page * 1)
    .limit(per)
    .exec(function (err, requests) {
      var requestMap = {};
      requests.forEach(function (request) {
        requestMap[request._id] = request;
      });
      res.send(requestMap);
    });
};

/**
 * Get all Requests with tag
 */
exports.readAllTag = function (req, res, next) {
  var tag = req.params.tag,
      page = req.params.page,
      per = req.params.per;
  if (per === undefined) per = 15;
  if (page === undefined) page = 0;
  Request
    .find({
      'tags': tag
    })
    .sort('-created')
    .skip(page * 1)
    .limit(per)
    .exec(function (err, requests) {
      var requestMap = {};
      requests.forEach(function (request) {
        requestMap[request._id] = request;
      });
      res.send(requestMap);
    });
};
/**
 * Edit Request
 */
exports.edit = function (req, res, next) {
  var requestId = req.params.id,
      tags = req.body.tags,
      summary = req.body.summary,
      lock = req.body.lock,
      force = req.body.force,
      admin = false,
      user = req.user;
  admin = (user.role === "admin");

  Request.findById(requestId, function (err, request) {
    if (err) return next(err);
    if (!request) return res.send(404);
    if ((!user._id.equals(request.owner)) && (!admin)) return res.send(403);
    if ((lock !== undefined) && (admin))
      request.summary_lock = lock;
    if ((!request.summary_lock) || (admin && force))
      request.summary = summary;
    else
      request.appended_summary.push(summary);
    if ((tags !== undefined) && (tags.length > 0)) request.tags = tags;
    request.save();

    res.send(request);
  });
};

/**
 * Delete Request
 */
exports.del = function (req, res, next) {
  var user = req.user,
      requestId = req.params.id;
  Request.findById(requestId, function (err, request) {
    if (err) return next(err);
    if (!request) return res.send(404);
    if ((!user._id.equals(request.owner)) && (user.role !== "admin")) return res.send(403);
    request.remove(function (err, request) {
      if (err) return res.json(500, err);
    });
  });
};