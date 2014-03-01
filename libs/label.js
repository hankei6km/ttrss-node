/**
 * This is the class for representing remote label resources as Js objects.
 * @module label
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
 * @alias module:label
 * @param {object} attr Remote resource.
 * @param {object} client Instance of TTRClient.
 */
function Label(){
  RemoteObject.apply(this, arguments);
}
util.inherits(Label, RemoteObject);

/**
 * Get a list of headlines for this label. Supports the same in_opts as
 *     ``Feed.headlines()``
 * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
 * @param {true} in_opts.include_nested Include articles from child categories.
 *     Defaults to ``True``.
 */
Label.prototype.headlines = function(in_opts, in_caller_cb){
  var opts ={};

  var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
  opts.label_id = this.id;

  this._client.get_headlines_for_label.apply(this._client, [opts, caller_cb]);
};

module.exports = Label;
