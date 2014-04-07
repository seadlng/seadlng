'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    idvalidator = require('mongoose-id-validator');

    
/**
 * Request Schema
 */
var RequestSchema = new Schema({
  title: {type: String, required: true},
  summary: {type: String, required: true},
  appended_summary: [String],
  summary_lock: {type: Boolean, default: false },
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
    comment: { type: String, required:true},
    owner: { 
      type: Schema.Types.ObjectId, 
      required:true, 
      ref: 'User'
    },
    created: { type: Date, default: Date.now },
    isFlagged: { type: Boolean, default: false }
  }]
});

/**
 * Validations
 */

RequestSchema
  .path('tags')
  .validate(function(tags) {
    return tags.length;
  }, 'Must include at least one tag');

RequestSchema.plugin(idvalidator);
module.exports = mongoose.model('Request', RequestSchema);
