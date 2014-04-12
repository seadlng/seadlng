'use strict';

var api = require('./controllers/api'),
    index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session'),
    ideas = require('./controllers/ideas'),
    requests = require('./controllers/requests');

var middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.get('/api/awesomeThings', api.awesomeThings);
  
  app.post('/api/requests/new', requests.create);
  app.get('/api/requests/:id', requests.read);
  app.put('/api/requests/:id', requests.update);
  app.delete('/api/requests/:id', requests.del);

  app.get('/api/requests', requests.readAll);
  app.get('/api/requests/page/:page/:per?*', requests.readAllPage);
  app.get('/api/requests/tag/:tag/:page?*/:per?*', requests.readAllTag);
  
    
  app.post('/api/ideas/new', ideas.create);
  app.get('/api/ideas/:id', ideas.read);
  app.put('/api/ideas/:id', ideas.update);
  app.delete('/api/ideas/:id', ideas.del);
  
  app.get('/api/ideas', ideas.readAll);
  app.get('/api/ideas/page/:page/:per?*', ideas.readAllPage);
  app.get('/api/ideas/tag/:tag/:page?*/:per?*', ideas.readAllTag);

  app.put('/api/ideas/:id/vote', ideas.vote);

  app.put('/api/ideas/:id/merge', ideas.merge);
  
  app.put('/api/ideas/:id/comment', ideas.comment);
  app.delete('/api/ideas/:id/comment', ideas.deleteComment);

  app.post('/api/users', users.create);
  app.put('/api/users', users.changePassword);
  app.get('/api/users', users.readAll);
  app.get('/api/users/me', users.me);
  app.get('/api/users/:id', users.read);

  app.post('/api/session', session.login);
  app.del('/api/session', session.logout);

  // All undefined api routes should return a 404
  app.get('/api/*', function(req, res) {
    res.send(404);
  });
  
  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', middleware.setUserCookie, index.index);
};