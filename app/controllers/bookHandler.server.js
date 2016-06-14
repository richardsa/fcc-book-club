'use strict';
var path = process.cwd();
var books = require('google-books-search');

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

}


module.exports = bookHandler;