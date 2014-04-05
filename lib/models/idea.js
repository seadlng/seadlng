'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
/**
 * Idea Schema
 */
var IdeaSchema = new Schema({
  title: String,
  summary: String,
  tags: [String],
  branches: [Schema.Types.ObjectId],
  root: Schema.Types.ObjectId,
  owner: Schema.Types.ObjectId,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  branch_status: {
    isBranch: Boolean,
    isMerged: { type: Boolean, default: false },
    votes: [{
      voter: Schema.Types.ObjectId,
      weight: Number
    }]
  },
  comments: [{
    comment: String,
    owner: Schema.Types.ObjectId,
    created: { type: Date, default: Date.now },
    isFlagged: { type: Boolean, default: false }
  }]
});

/**
 * Validations
 */
IdeaSchema
  .path('title')
  .validate(function(title) {
    return title.length;
  }, 'Title cannot be blank');

IdeaSchema
  .path('summary')
  .validate(function(summary) {
    return summary.length;
  }, 'Summary cannot be blank');

IdeaSchema
  .path('tags')
  .validate(function(tags) {
    return tags.length;
  }, 'Must include at least one tag');

IdeaSchema
  .path('owner')
  .validate(function(owner, respond) {
    if (owner === undefined) return respond(false);
    else return respond(true);
  }, 'Idea must have an owner!');

mongoose.model('Idea', IdeaSchema);
