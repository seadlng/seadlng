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
  }, {
    _id: '534206803f5a0df32002aaf1',
    provider: 'local',
    name: 'Admin',
    email: 'admin@test.com',
    password: 'test',
    role: 'admin'
  }, function() {
      console.log('finished populating users');
  //Populate users first
  // Clear old ideas, then add a default idea
    Idea.find({}).remove(function() {
      var idea1 = new Idea({
          _id: '533f5868fe0156a5203f1cbe',
          title: "Good Idea",
          summary: "Good Idea summary",
          owner: "533f6ab6ec7b0c1d2e4a63ec",
          tags: ["Test1"],
          created: "2014-03-05T22:41:15.729Z",
          updated: "2014-03-05T22:41:15.729Z",
          branch_status: {
            isMerged: true
          } 
      }); 
      idea1.save();
      var idea2 = new Idea({
          _id: '533f59d5c3808ecf21393c9b',
          title: "Bad Idea",
          summary: "Bad Idea summary",
          summary_lock: true,
          owner: "533f6ab6ec7b0c1d2e4a63ec",
          tags: ["Test2"],
          created: "2014-04-05T22:41:15.729Z",
          updated: "2014-04-05T22:41:15.729Z",
          branch_status: {
            isMerged: true
          } 
      });
      idea2.save();
      var ideaBranch = new Idea({
        _id: '5344868ddbdf3ea60fb471ff',
        title: "Good Idea Branch",
        summary: "Branch of a Good Idea",
        root: "533f5868fe0156a5203f1cbe",
        owner: "534206803f5a0df32002aaf1",
        tags: ["Test1"],
        created: "2014-03-05T22:41:15.729Z",
        updated: "2014-03-05T22:41:15.729Z",
        branch_status: {
          isMerged: true
        }
      });
      ideaBranch.save();
        idea1.branches.push(ideaBranch);
        idea1.save();
      var ideaBranch2 = new Idea({
        title: "Good Idea Branch 2",
        summary: "Another Branch of a Good Idea",
        _id: '5345da4fde1303236d96b1a4',
        root: "533f5868fe0156a5203f1cbe",
        owner: "534206803f5a0df32002aaf1",
        tags: ["Test1"],
        created: "2014-03-05T22:41:15.729Z",
        updated: "2014-03-05T22:41:15.729Z",
        branch_status: {
          votes:[{
            voter: "534206803f5a0df32002aaf1",
            weight: 1/3,
            vote: false
          }, {
            voter: "533f6ab6ec7b0c1d2e4a63ec",
            weight: 1,
            vote: false
          }]
        }
      });
      ideaBranch2.save();
      idea1.branches.push(ideaBranch2);
      idea1.save();
    });
    console.log('finished populating ideas');
  });
});