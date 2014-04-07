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
  owner:  {
            type: Schema.Types.ObjectId, 
            required: true,
            ref: 'User'
          },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  comments: [{
    comment: { type: String, required:true},
    owner: { 
      type: Schema.Types.ObjectId, 
      required:true, 
      ref: 'User'
    },
    created: { type: Date, default: Date.now },
    isFlagged: { type: Boolean, default: false }
  }],
  suggestions: [{
    suggestion: { type: String, required:true},
    title: {type: String, required: true},
//    id: { type: Number, required: true},
    owner: { 
      type: Schema.Types.ObjectId, 
      required:true, 
      ref: 'User'
    },
    created: { type: Date, default: Date.now },
    isFlagged: { type: Boolean, default: false },
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
