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
    
  app.route('/books')
    .get(isLoggedIn, function(req, res) {
      res.sendFile(path + '/public/books.html');
    });

  app.route('/search/api')
    .get(isLoggedIn, bookHandler.searchBooks);

   app.route('/edit/api')
    .post(isLoggedIn, userHandler.updateProfile);
  //add book to collection
  app.route('/add/api')
    .post(isLoggedIn, bookHandler.addBook);
    
  //request to borrow book  
  app.route('/request/api')
    .post(isLoggedIn, bookHandler.requestBook)
    .delete(isLoggedIn, bookHandler.cancelRequest);
  //deny request to borrow book
  app.route('/deny/api/:id')
    .delete(isLoggedIn, bookHandler.denyRequest);
    
  app.route('/delete/api/:id')
    .delete(isLoggedIn, bookHandler.deleteBook);
    
    

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
    
  // return profile books
  app.route('/profile/api/:id')
     .get(isLoggedIn, bookHandler.getBooks);
  
  // return requests
  app.route('/request/api/:id')
    .get(isLoggedIn, bookHandler.getRequests);
     
  // return all books
  app.route('/books/api')
  .get(isLoggedIn, bookHandler.getAllBooks);

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