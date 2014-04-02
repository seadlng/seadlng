'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
/**
 * Idea Schema
 */
var IdeaSchema = new Schema({
  title: String,
  summary: String
});

/**
 * Validations
 */
 /*
IdeaSchema.path('awesomeness').validate(function (num) {
  return num >= 1 && num <= 10;
}, 'Awesomeness must be between 1 and 10');
*/

mongoose.model('Idea', IdeaSchema);
