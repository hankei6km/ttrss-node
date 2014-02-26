/**
 * This is the class for representing remote category resources as Js objects.
 * @module category
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
 * @alias module:category
 * @param {object} attr Remote resource.
 * @param {object} client Instance of TTRClient.
 */
function Category(){
  RemoteObject.apply(this, arguments);
}
util.inherits(Category, RemoteObject);

/**
 * Get a list of feeds for this category.
 * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
 * @param {boolean} in_opts.cunread_only *Optional* Include only feeds containing unread
 *     articles. Default is false.
 * @param {number} in_opts.climit *Optional* Limit number of included feeds to ``limit``.
 *     Default is 0 (unlimited).
 * @param {number} in_opts.coffset *Optional* Skip this number of feeds. Useful for
 *     pagination. Default is 0.
 * @param {boolean} in_opts.cinclude_nested *Optional* Include child categories. Default
 *     is false.
 * @param {function} in_caller_cb
 */
Category.prototype.feeds = function(in_opts, in_caller_cb){
  var opts ={};

  var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
  opts.cat_id = this.id;

  this._client.get_feeds.apply(this._client, [opts, caller_cb]);
};

module.exports = Category;
