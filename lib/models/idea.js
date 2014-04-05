'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    idvalidator = require('mongoose-id-validator');
    
/**
 * Idea Schema
 */
var IdeaSchema = new Schema({
  title: {type: String, required: true},
  summary: {type: String, required: true},
  tags: [String],
  branches: [Schema.Types.ObjectId],
  root: Schema.Types.ObjectId,
  owner:  {
            type: Schema.Types.ObjectId, 
            required: true,
            ref: 'User'
          },
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
  .path('tags')
  .validate(function(tags) {
    return tags.length;
  }, 'Must include at least one tag');

IdeaSchema.plugin(idvalidator);

mongoose.model('Idea', IdeaSchema);
