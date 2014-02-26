"use strict";

var _ = require('underscore');

/**
 * Parase typically arguments(in_opts & in_caller_cb) of each apis.
 * @private
 * @param opts {object} Defaults parameters for ttrss api(it's not JSON).
 *    And setup parameters from this function.
 * @param in_opts {object} The ots is passed by caller.
 * @param in_caller_cb {function} The callback function is passed by caller.
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
