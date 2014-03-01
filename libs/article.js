/** 
 * This is the class for representing remote article resources as Js objects.
 * @module article
 * @author hankei6km
 * @copyright (c) 2014 hankei6km
 * @license MIT License (http://opensource.org/licenses/mit-license.php)
 */
"use strict";

var util = require('util');
var _ = require('underscore');

var parse_api_args = require('./api-args.js').parse;
var RemoteObject = require('./remote-object.js');

/**
 * @constructor
 * @alias module:article
 * @param {object} attr Remote resource.
 * @param {object} client Instance of TTRClient.
 */
function Article(){
  RemoteObject.apply(this, arguments);
  if('updated' in this._attr){
    this._attr.updated = new Date(this._attr.updated * 1000);
  }
}
util.inherits(Article, RemoteObject);

/**
 * Share this article to published feed.
 * @todo Implement this method.
 * @param {function} in_caller_cb
 */
Article.prototype.publish = function(in_opts, in_caller_cb){
  // TODO: Implement this method.
  throw new Error('must be implemented');  
};

/**
 * Refresh this object with new data fetched from the server.
 * @todo Implement this method.
 * @param {function} in_caller_cb
 */
Article.prototype.refresh_status = function(in_opts, in_caller_cb){
  // TODO: Implement this method.
  throw new Error('must be implemented');  
};

/**
 * Toggle unread status of this article.
 * @todo Implement this method.
 * @param {function} in_caller_cb
 */
Article.prototype.toggle_unread = function(in_opts, in_caller_cb){
  // TODO: Implement this method.
  throw new Error('must be implemented');  
};

module.exports = Article;
