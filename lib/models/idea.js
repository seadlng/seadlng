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
  appended_summary: [String],
  summary_lock: { type: Boolean, default: false },
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
  voters: [{
    voter: { 
        type: Schema.Types.ObjectId, 
        required:true, 
        ref: 'User'
      },
      weight: { type:Number, required:true, default:0 },
  }],
  branch_status: {
    isBranch: Boolean,
    isMerged: { type: Boolean, default: false },
    votes: [{
      voter: { 
        type: Schema.Types.ObjectId, 
        required:true, 
        ref: 'User'
      },
      weight: { type:Number, required:true, default:0 },
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

IdeaSchema
  .path('tags')
  .validate(function(tags) {
    return tags.length;
  }, 'Must include at least one tag');

IdeaSchema.plugin(idvalidator);
module.exports = mongoose.model('Idea', IdeaSchema);
