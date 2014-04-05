'use strict';

var mongoose = require('mongoose'),
  Idea = mongoose.model('Idea'),
  Thing = mongoose.model('Thing'),
  User = mongoose.model('User');
  

/**
 * Populate database with sample application data
 */

//Clear old things, then add things in
Thing.find({}).remove(function() {
  Thing.create({
    name : 'HTML5 Boilerplate',
    info : 'HTML5 Boilerplate is a professional front-end template for building fast, robust, and adaptable web apps or sites.',
    awesomeness: 10
  }, {
    name : 'AngularJS',
    info : 'AngularJS is a toolset for building the framework most suited to your application development.',
    awesomeness: 10
  }, {
    name : 'Karma',
    info : 'Spectacular Test Runner for JavaScript.',
    awesomeness: 10
  }, {
    name : 'Express',
    info : 'Flexible and minimalist web application framework for node.js.',
    awesomeness: 10
  }, {
    name : 'MongoDB + Mongoose',
    info : 'An excellent document database. Combined with Mongoose to simplify adding validation and business logic.',
    awesomeness: 10
  }, function() {
      console.log('finished populating things');
    }
  );
});

// Clear old users, then add a default user
User.find({}).remove(function() {
  User.create({
    _id: "533f6ab6ec7b0c1d2e4a63ec",
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, function() {
      console.log('finished populating users');
    }
  );
  //Populate users first
  // Clear old ideas, then add a default idea
  Idea.find({}).remove(function() {
    Idea.create({
        _id: '533f5868fe0156a5203f1cbe',
        title: "Good Idea",
        summary: "Good Idea summary",
        owner: "533f6ab6ec7b0c1d2e4a63ec",
        tags: ["Test"]
    }, {
        _id: '533f59d5c3808ecf21393c9b',
        title: "Bad Idea",
        summary: "Bad Idea summary",
        owner: "533f6ab6ec7b0c1d2e4a63ec",
        tags: ["Test"]
    }, function() {
        console.log('finished populating ideas');
      }
    );
  });
});
