/** 
 * This is the class for representing remote feed resources as Js objects.
 * @module feed
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
 * @alias module:feed
 * @param {object} attr Remote resource.
 * @param {object} client Instance of TTRClient.
 */
function Feed(){
  RemoteObject.apply(this, arguments);
  if('last_updated' in this._attr){
    this._attr.last_updated = new Date(this._attr.last_updated * 1000);
  }
}
util.inherits(Feed, RemoteObject);

/**
 * Mark this feed as read(this method is not implemented).
 * @todo Implement this method.
 * @param {function} in_caller_cb
 */
Feed.prototype.catchup = function(in_caller_cb){
  // TODO: Implement this method.
  throw new Error('must be implemented');  
};

/**
 * Get a list of headlines from a this feed.
 * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
 * @param {number} in_opts.limit Return no more than this number of headlines. Default is
 *     ``0`` (unlimited, though the server limits to 60).
 * @param {number} in_opts.skip Skip this number of headlines. Useful for pagination.
 *     Default is ``0``.
 * @param {boolean} in_opts.is_cat The feed_id is a category. Defaults to ``False``.
 * @param {boolean} in_opts.show_excerpt Include a short excerpt of the article. Defaults
 *     to ``True``.
 * @param {number} in_opts.show_content Include full article content. Defaults to
 *     ``False``.
 * @param {string} in_opts.view_mode (string = all_articles, unread, adaptive, marked,
 *     updated)
 * @param {boolean} in_opts.include_attachments include article attachments. Defaults to
 *     ``False``.
 * @param {number} in_opts.since_id Only include headlines newer than ``since_id``.
 * @param {true} in_opts.include_nested Include articles from child categories.
 *     Defaults to ``True``.
 */
Feed.prototype.headlines = function(in_opts, in_caller_cb){
  var opts ={};

  var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
  opts.feed_id = this.id;

  this._client.get_headlines.apply(this._client, [opts, caller_cb]);
};

module.exports = Feed;
