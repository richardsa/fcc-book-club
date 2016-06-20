'use strict';
var path = process.cwd();
var Users = require('../models/users.js');
var dbBooks = require('../models/books.js');
function userHandler() {
    this.updateProfile = function(req, res) {
        console.log('yeah');
        var title = req.query.title;
        var userName = req.query.userName;
        var userCity = req.query.userCity;
        var userState = req.query.userState;
        var userId = req.query.userId;
        console.log(req.query);
         Users
      .findOneAndUpdate({
        'github.id': userId
      }, {
        'github.displayName': userName,
        'github.city': userCity,
        'github.state': userState
      }, {new: true})
      .exec(function(err, result) {
        if (err) {
          throw err;
        }
        console.log(result);
        res.json(result);
      });
    }
    // quick and dirty function to clear tables
    this.getDrop = function(req, res) {
          dbBooks.remove(function(err, p) {
            if (err) {
                throw err;
            } else {
               console.log("book table cleared")
            }
        });

        Users.remove(function(err, p) {
            if (err) {
                throw err;
            } else {
                res.send("User Table Cleared");
            }
        });
    };

}


module.exports = userHandler;