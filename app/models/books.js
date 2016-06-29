'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
	  title: String,
      bookId: String,
      coverUrl: String,
      ownerId: String,
      requestorId: String,
      approvalStatus: String,
      
});

module.exports = mongoose.model('Book', Book);
