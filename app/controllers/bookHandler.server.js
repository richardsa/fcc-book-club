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
        var bookId = req.query.bookId;
        var ownerId = req.query.ownerId;
        var requestorId = "";
        var approvalStatus = "";
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
                        requestorId: requestorId,
                        approvalStatus: approvalStatus

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
                if (result.length >= 1) {
                    console.log(JSON.stringify(result));
                    res.json(result);
                } else {
                    console.log("error");
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
        dbBooks
            .findOneAndUpdate({
                'bookId': bookId,

            }, {
                $set: {
                    'requestorId': requestorId,
                    'approvalStatus': ""
                }
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
    }

    // cancel book request 
    this.cancelRequest = function(req, res) {
        var bookId = req.query.bookId;
        var requestorId = req.query.requestorId;
        dbBooks
            .findOneAndUpdate({
                'bookId': bookId,

            }, {
                $set: {
                    'requestorId': ""
                    
                }
            })
            .lean().exec(function(err, result) {
                if (err) {
                    throw err;
                }
                if (result) {
                  console.log("cancel " + result);
                    res.json(result);
                } else {
                    res.send({
                        error: "There was an error processing your request"
                    });
                }
            });

    };

    this.getRequests = function(req, res) {
        var profile = req.params.id;
        console.log(profile);
        dbBooks
            .find({
                'requestorId': profile,
                'approvalStatus': ""
                
            })
            .lean().exec(function(err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    console.log(JSON.stringify(result));
                    res.json(result);
                } else {
                    //console.log("error");
                    res.send({
                        error: "You do not have any books in your collection"
                    });
                }
            });
    };

		// return denied requests

    this.getDeniedRequests = function(req, res) {
        var profile = req.params.id;
        console.log(profile);
        dbBooks
            .find({
                'requestorId': profile,
                'approvalStatus': "N"
            })
            .lean().exec(function(err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    console.log(JSON.stringify(result));
                    res.json(result);
                } else {
                    //console.log("error");
                    res.send({
                        error: "You do not have any books in your collection"
                    });
                }
            });
    };

		this.getApprovedRequests = function(req, res) {
        var profile = req.params.id;
        dbBooks
            .find({
                'requestorId': profile,
                'approvalStatus': "Y"
            })
            .lean().exec(function(err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    console.log(JSON.stringify(result));
                    res.json(result);
                } else {
                    //console.log("error");
                    res.send({
                        error: "You do not have any books in your collection"
                    });
                }
            });
    };
    
    //function to deny request  
    this.denyRequest = function(req, res){
        var bookId = req.params.id;
        dbBooks
            .findOneAndUpdate({
                'bookId': bookId,

            }, {
                $set: {
                    'approvalStatus': "N"
                }
            })
            .lean().exec(function(err, result) {
                if (err) {
                    throw err;
                }
                if (result) {
                    res.json(result);
                } else {
                    res.send({
                        error: "There was an error processing your request"
                    });
                }
            });
        
    };
      //function to accept request  
    this.approveRequest = function(req, res){
        var bookId = req.params.id;
        dbBooks
            .findOneAndUpdate({
                'bookId': bookId,

            }, {
                $set: {
                    'approvalStatus': "Y"
                }
            })
            .lean().exec(function(err, result) {
                if (err) {
                    throw err;
                }
                if (result) {
                    res.json(result);
                } else {
                    res.send({
                        error: "There was an error processing your request"
                    });
                }
            });
        
    };


}


module.exports = bookHandler;