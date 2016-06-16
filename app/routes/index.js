'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var BookHandler = require(path + '/app/controllers/bookHandler.server.js');
var UserHandler = require(path + '/app/controllers/userHandler.server.js');
module.exports = function(app, passport) {

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {

      res.send(JSON.stringify({
        error: "you are not logged in."
      }));
    }
  }

  var clickHandler = new ClickHandler();
  var bookHandler = new BookHandler();
  var userHandler = new UserHandler();

  app.route('/')
    .get(function(req, res) {
      res.sendFile(path + '/public/index.html');
    });

  app.route('/search')
    .get(isLoggedIn, function(req, res) {
      res.sendFile(path + '/public/search.html');
    });

  app.route('/search/api')
    .get(isLoggedIn, bookHandler.searchBooks);

   app.route('/edit/api')
    .post(isLoggedIn, userHandler.updateProfile);
  
  app.route('/add/api')
    .post(isLoggedIn, bookHandler.addBook);

  app.route('/login')
    .get(function(req, res) {
      res.sendFile(path + '/public/login.html');
    });
   app.route('/edit')
    .get(isLoggedIn, function(req, res) {
      res.sendFile(path + '/public/edit.html');
    });


  app.route('/logout')
    .get(function(req, res) {
      req.logout();
      res.redirect('/login');
    });

  app.route('/profile')
    .get(isLoggedIn, function(req, res) {
      res.sendFile(path + '/public/profile.html');
    });

  app.route('/api/:id')
    .get(isLoggedIn, function(req, res) {
      res.json(req.user.github);
    });

  app.route('/auth/github')
    .get(passport.authenticate('github'));

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));

  app.route('/api/:id/clicks')
    .get(isLoggedIn, clickHandler.getClicks)
    .post(isLoggedIn, clickHandler.addClick)
    .delete(isLoggedIn, clickHandler.resetClicks);
    
    //delete tables
	app.route('/testing')
        .get(userHandler.getDrop);
};