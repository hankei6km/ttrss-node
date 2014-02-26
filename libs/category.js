"use strict";

var util = require('util');
var _ = require('underscore');

var parse_api_args = require('./api-args.js').parse;
var RemoteObject = require('./remote-object.js');

function Category(){
  RemoteObject.apply(this, arguments);
}
util.inherits(Category, RemoteObject);
/**
 * Get a list of feeds for this category.
 * @param in_opts {object} Parameters for ttrss api(it's not JSON)(optional).
 * @param in_opts.cunread_only {boolean} *Optional* Include only feeds containing unread
 *     articles. Default is false.
 * @param in_opts.climit {number} *Optional* Limit number of included feeds to ``limit``.
 *     Default is 0 (unlimited).
 * @param in_opts.coffset {number} *Optional* Skip this number of feeds. Useful for
 *     pagination. Default is 0.
 * @param in_opts.cinclude_nested {boolean} *Optional* Include child categories. Default
 *     is false.
 * @param in_caller_cb {function}
 */
Category.prototype.feeds = function(in_opts, in_caller_cb){
  var opts ={};

  var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
  opts.cat_id = this.id;

  this._client.get_feeds.apply(this._client, [opts, caller_cb]);
};

module.exports = Category;
