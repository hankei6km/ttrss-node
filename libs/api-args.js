/**
 * Utility for api arguments.
 * @private
 * @module api-args
 * @author hankei6km
 * @copyright (c) 2014 hankei6km
 * @license MIT License (http://opensource.org/licenses/mit-license.php)
 */
"use strict";

var _ = require('underscore');

/**
 * Parase typically arguments(in_opts & in_caller_cb) of each apis.
 * @private
 * @param {object} opts Defaults parameters for ttrss api(it's not JSON).
 *    And setup parameters from this function.
 * @param {object} in_opts The opts is passed by caller.
 * @param {function} in_caller_cb The callback function is passed by caller.
 */
function parse_api_args(opts, in_opts, in_caller_cb){
  var caller_cb = function(){};

  var t = typeof(in_opts);
  if(t =='object'){
    _.extend(opts, in_opts);
    if(typeof(in_caller_cb)=='function'){
      caller_cb = in_caller_cb;
    }
  }else if(t == 'function'){
    caller_cb = in_opts;
  }

  return caller_cb;
}

exports.parse = parse_api_args;
