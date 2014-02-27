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

var parse_api_args = require('./libs/api-args.js').parse;
var Category = require('./libs/category.js');
var Feed = require('./libs/feed.js');
var Headline = require('./libs/headline.js');

/**
 * @constructor
 * @alias module:ttrss-node
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

/**
 * Get a list of all available categories.
 * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
 * @param {boolean} in_opts.unread_only Only return categories containing unread articles.
 *    Defaults to false.
 * @param {boolean} in_opts.enable_nested When enabled, traverse through sub-categories
 *    and return only the **topmost** categories in a flat list.
 *    Defaults to false.
 * @param {boolean} in_opts.include_empty Include categories not containing any feeds.
 *    Defaults to false. *Requires server version 1.7.6*
 * @param {function} in_caller_cb
 */
TTRClient.prototype.get_categories = function(in_opts, in_caller_cb){
  var opts = {
    op: 'getCategories',
    unread_only: false,
    enable_nested: false,
    include_empty: false
  };
  var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);

  var that = this;
  this._call_api(
    opts,
    function(err, data){
      if(!err){
        var len = data.content.length;
        var cats = new Array(len);
        for(var idx=0; idx<len; idx++){
          cats[idx] = new Category(data.content[idx], that);
        }
        caller_cb(err, cats);
      }else{
        caller_cb(err, null);
      }
    }
  );
}

/**
 * Get a list of feeds in a category.
 * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
 * @param {number} in_opts.cat_id Category id. This is available as the ``id`` property
 *     of a Category object.
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
TTRClient.prototype.get_feeds = function(in_opts, in_caller_cb){
  var opts = {
    cat_id: -1,
    unread_only: false,
    limit: 0,
    offset: 0,
    include_nested: false
  };
                                                                 
  var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
  opts.op = 'getFeeds';

  var that = this;
  this._call_api(
    opts,
    function(err, data){
      if(!err){
        var len = data.content.length;
        var feeds = new Array(len);
        for(var idx=0; idx<len; idx++){
          feeds[idx] = new Feed(data.content[idx], that);
        }
        caller_cb(err, feeds);
      }else{
        caller_cb(err, null);
      }
    }
  );
}

/**
 * Get a list of headlines from a specified feed.
 * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
 * @param {number} in_opts.feed_id  Feed id. This is available as the ``id`` property of
 *     a Feed object. Default is ``-4`` (all feeds).
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
 * @param {function} in_caller_cb
 */
TTRClient.prototype.get_headlines = function(in_opts, in_caller_cb){
  var opts = {
    feed_id: -4,
    limit: 0,
    skip: 0,
    is_cat: false,
    show_excerpt: true,
    show_content: false,
    // view_mode: undefined,
    include_attachments: false,
    // since_id: undefined,
    include_nested: true
  };
                                                                 
  var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
  opts.op = 'getHeadlines';

  var that = this;
  this._call_api(
    opts,
    function(err, data){
      if(!err){
        var len = data.content.length;
        var headlines = new Array(len);
        for(var idx=0; idx<len; idx++){
          headlines[idx] = new Headline(data.content[idx], that);
        }
        caller_cb(err, headlines);
      }else{
        caller_cb(err, null);
      }
    }
  );
};

/**
 * Get a list of articles from article ids.
 * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
 * @param {string} in_opts.article_id A comma separated string or list of article ids to
 *     fetch,
 */
TTRClient.prototype.get_articles = function(in_opts, in_caller_cb){
  var opts = {
    article_id: null
  };

  var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
  opts.op = 'getArticle';
  if(util.isArray(opts.article_id)){
    opts.article_id = opts.article_id.join(',');
  }

  var that = this;
  this._call_api(
    opts,
    function(err, data){
      if(!err){
        var len = data.content.length;
        var articles = new Array(len);
        for(var idx=0; idx<len; idx++){
          //articles[idx] = new Article(data.content[idx], that);
          articles[idx] = data.content[idx];
        }
        caller_cb(err, articles);
      }else{
        caller_cb(err, null);
      }
    }
  );
};


/**
 * Attempt to mark all articles in specified feed as read.
 * (this method is not implemented)
 * @todo Implement this method.
 * @param {number} feed_id id of the feed to catchup.
 * @param {boolean} is_cat Specified feed is a category. Default is False.
 * @param {function} in_caller_cb
 */
TTRClient.prototype.catchup_feed = function(in_opts, in_caller_cb){
  // TODO: Implement this method.
  throw new Error('must be implemented');  

  var opts = {
    //feed_id: feed_id,
    is_cat: false
  };
  var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
  opts.op = 'catchupFeed';

  var that = this;
  this._call_api(
    opts,
    function(err, data){
      if(!err){
        caller_cb(err, data.content);
      }else{
        caller_cb(err, null);
      }
    }
  );
};

module.exports = TTRClient;
