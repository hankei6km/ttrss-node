/** 
 * A libary for the Tiny Tiny RSS web API.
 * @module ttrss-node
 * @author hankei6km
 * @copyright (c) 2014 hankei6km
 * @license MIT License (http://opensource.org/licenses/mit-license.php)
 */
"use strict";

var util = require("util");
var _ = require('underscore');
var request = require('request');

/**
 * @constructor
 * @alias module:TTRClient
 * @param {string} url
 * @param {object} opts
 * @param {string} opts.user The username to use when logging in.
 * @param {string} opts.password The password for the user.
 * @param {string} opts.ca The cacert to use when https connect(optional).
 */
function TTRClient(url, opts){
  this.url = (url.match(/\/$/) ? url : url + '/') + 'api/';
  this.user = opts.user;
  this.password = opts.password;
  this.auto_login =
    typeof(opts.auto_login) == 'boolean' ? opts.auto_login : false;
  this.ca = opts.ca;
}

/**
 * Log in.
 * @param {function} caller_cb
 */
TTRClient.prototype.login = function(caller_cb){
  var opts = {
    op: 'login',
    user: this.user,
    password: this.password
  };

  var that = this;
  this._call_api(
    opts,
    function(err, data){
      if(!err){
        that.sid = data.content.session_id;
        caller_cb(null, data.content.session_id);
      }else{
        caller_cb(err, null);
      }
    }
  ); 
};

/**
 * Log out.
 * @param {function} caller_cb
 */
TTRClient.prototype.logout = function(caller_cb){
  var opts = {
    op: 'logout'
  };

  var that = this;
  this._call_api(
    opts,
    function(err, data){
      if(!err){
        that.sid = null;
        caller_cb(null);
      }else{
        caller_cb(err);
      }
    }
  ); 
};

/**
 * Is logged in.
 * @param {function} caller_cb
 */
TTRClient.prototype.logged_in = function(caller_cb){
  var opts = {
    op: 'isLoggedIn'
  };

  var that = this;
  this._call_api(
    opts,
    function(err, data){
      if(!err){
        caller_cb(null, data.content.status);
      }else{
        caller_cb(err);
      }
    }
  ); 
};

/**
 * Utility to call ttrss api.
 * @private
 * @param {object} in_post_data Parameters for ttrss api(it's not JSON).
 * @param {function} caller_cb
 */
TTRClient.prototype._call_api = function(in_post_data, caller_cb){
  var post_data = {};

  for(var p in in_post_data){
    post_data[p] = in_post_data[p];
  }

  if(post_data.op != 'login'){
    post_data.sid = this.sid;
  }

  var opts = {
    url: this.url,
    ca: this.ca, 
    json: true,
    body: JSON.stringify(post_data)
  };

  request.post(opts, function (err, resp, data) {
    if (!err && resp.statusCode == 200) {
      if(!('error' in data.content)){
        caller_cb(null, data);
      }else{
        caller_cb(new Error(data.content.error, null));
      }
    }else{
      if(!err){
        caller_cb(new Error('status code = ' + resp.statusCode), null);
      }else{
        caller_cb(err, null);
      }
    }
  })
};

module.exports = TTRClient;
