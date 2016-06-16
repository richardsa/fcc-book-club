'use strict';
var path = process.cwd();
var books = require('google-books-search');
var dbBooks = require('../models/books.js');

function bookHandler() {
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

    }

    //add book to collection
    this.addBook = function(req, res) {
        console.log(req.query);
        var title = req.query.title;
        var printsec = req.query.printsec;
        var img = req.query.img;
        var zoom = req.query.zoom;
        var edge = req.query.edge;
        var source = req.query.source;
        var cover = req.query.cover + "&printsec=" + printsec + "&img=" + img + "&zoom=" + zoom + "&edge=" + edge + "&source=" + source ;
        var bookId = req.query.bookId;
        var ownerId = req.query.ownerId;
        console.log("title " + title + " cover " + cover + " bookId " + bookId + " ownerId " + ownerId) 
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
                        res.send({bookId: bookId});
                    });
                }
            });
    }

}


module.exports = bookHandler;