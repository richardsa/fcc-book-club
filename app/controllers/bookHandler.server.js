'use strict';
var path = process.cwd();
var books = require('google-books-search');
var dbBooks = require('../models/books.js');

function bookHandler() {
    //main book search function
    this.searchBooks = function(req, res) {
        console.log('yeah');
        var title = req.query.title;

        books.search(title, function(error, results) {
            if (!error) {

                res.send(results);

            } else {
                var noResults = {
                    error: 'No Results Found'
                };
                res.send(noResults);
            }
        });

    };

    //add book to collection
    this.addBook = function(req, res) {
        console.log(req.query);
        var title = req.query.title;
        var cover;
        if (req.query.cover === "/public/img/noCover.png") {
            cover = req.query.cover;
        } else {
            var printsec = req.query.printsec;
            var img = req.query.img;
            var zoom = req.query.zoom;
            var edge = req.query.edge;
            var source = req.query.source;
            cover = req.query.cover + "&printsec=" + printsec + "&img=" + img + "&zoom=" + zoom + "&edge=" + edge + "&source=" + source;
        }
        //var cover = req.query.cover + "&printsec=" + printsec + "&img=" + img + "&zoom=" + zoom + "&edge=" + edge + "&source=" + source;
        var bookId = req.query.bookId;
        var ownerId = req.query.ownerId;
        console.log("title " + title + " cover " + cover + " bookId " + bookId + " ownerId " + ownerId);
        var requestorId = "";
        dbBooks.findOne({
                bookId: bookId,
                ownerId: ownerId
            },
            function(err, doc) {
                if (err) {
                    throw err;
                }
                if (doc) {
                    res.send({
                        error: "You already own this book"
                    });
                } else {
                    dbBooks.collection.insert({
                        bookId: bookId,
                        ownerId: ownerId,
                        title: title,
                        cover: cover,
                        requestorId: requestorId

                    }, function(err, updatedResult) {
                        if (err) {
                            throw err;
                        }
                        //console.log(updatedResult);
                        res.send({
                            bookId: bookId
                        });
                    });
                }
            });
    };

    //delete book from profile
    this.deleteBook = function(req, res) {
        var bookId = req.params.id;
        dbBooks.findOne({
                bookId: bookId

            },
            function(err, book) {
                if (err) {
                    throw err;
                }
                if (book) {
                    book.remove(function(err) {
                        if (err) {
                            throw err;
                        }
                        res.send("book deleted");
                    });
                }
            });
    };

    // return all profile books
    this.getBooks = function(req, res) {
        var profile = req.params.id;
        console.log(profile);
        dbBooks
            .find({
                'ownerId': profile
            })
            .lean().exec(function(err, result) {
                if (err) {
                    throw err;
                }
                if (result) {
                    res.json(result);
                } else {
                    res.send({
                        error: "You do not have any books in your collection"
                    });
                }
            });
    };

    // return all community books
    this.getAllBooks = function(req, res) {
        
        dbBooks
            .find({})
            .lean().exec(function(err, result) {
                if (err) {
                    throw err;
                }
                if (result) {
                    res.json(result);
                } else {
                    res.send({
                        error: "No books in community at this time"
                    });
                }
            });
    };
    
    // request to borrow book
    
    this.requestBook = function(req, res) {
      var bookId = req.query.bookId;
      var requestorId = req.query.requestorId;
      console.log("bookId " + bookId + " requestorId " + requestorId);
      dbBooks
          .findOneAndUpdate({
              'bookId': bookId,
              
          },  { $set: { 'requestorId': requestorId } })
          .lean().exec(function(err, result) {
              if (err) {
                  throw err;
              }
              if (result) {
                  res.json(result);
              } else {
                  res.send({
                      error: "You do not have any books in your collection"
                  });
              }
          });
    }

}


module.exports = bookHandler;