/** 
 * This is the class for representing remote headline resources as Js objects.
 * @module headline
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
 * @alias module:headline
 * @param {object} attr Remote resource.
 * @param {object} client Instance of TTRClient.
 */
function Headline(){
  RemoteObject.apply(this, arguments);
}
util.inherits(Headline, RemoteObject);

/**
 * Get the full article corresponding to this headline
 * @param {function} in_caller_cb
 */
Headline.prototype.full_article = function(in_opts, in_caller_cb){
  var opts ={};

  var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
  opts.id = this.id;

  this._client.get_headlines.apply(this._client, [opts, function(err, articles){
    if(!err){
      caller_cb(err, articles[0]);
    }else{
      caller_cb(err, null);
    }
  }]);
};

module.exports = Headline;
