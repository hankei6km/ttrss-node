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
var Label = require('./libs/label.js');
var Headline = require('./libs/headline.js');
var Article = require('./libs/article.js');

/**
 * Create to instance of `RemoteObject` from recieved content.
 * @private
 * @param {object} RemoteClass Class based `RemoteObject`(i.e. `Feed`).
 * @param {array} content Recieved content array.
 * @param {object} client Instanced TTRClient object.
 */
function remote_object_from_content(RemoteClass, content, client){
  var len = content.length;
  var ret = new Array(len);

  for(var idx=0; idx<len; idx++){
    ret[idx] = new RemoteClass(content[idx], client);
  }

  return ret;
}

/**
 * @alias module:ttrss-node
 * @return {object} Instance of ttrss_node.
 * @param {string} in_url
 * @param {object} in_opts
 * @param {string} in_opts.user The username to use when logging in.
 * @param {string} in_opts.password The password for the user.
 * @param {string} in_opts.ca The cacert to use when https connect(optional).
 */
module.exports = function(in_url, in_opts){
  var url = (in_url.match(/\/$/) ? in_url : in_url + '/') + 'api/';
  var user = in_opts.user;
  var password = in_opts.password;
  var auto_login =
    typeof(in_opts.auto_login) == 'boolean' ? in_opts.auto_login : false;
  var ca = in_opts.ca;

  var sid = null;

  return {
    /**
     * Log in.
     * @return {object} Handle object for 'request'.
     * @param {function} caller_cb
     */
    login: function(caller_cb){
      var opts = {
        op: 'login',
        user: user,
        password: password
      };

      var that = this;
      return this._call_api(
        opts,
        function(err, data){
          if(!err){
            sid = data.content.session_id;
            caller_cb(null, data.content.session_id);
          }else{
            caller_cb(err, null);
          }
        }
      ); 
    },

    /**
     * Log out.
     * @return {object} Handle object for 'request'.
     * @param {function} caller_cb
     */
    logout: function(caller_cb){
      var opts = {
        op: 'logout'
      };

      var that = this;
      return this._call_api(
        opts,
        function(err, data){
          if(!err){
            sid = null;
            caller_cb(null);
          }else{
            caller_cb(err);
          }
        }
      ); 
    },

    /**
     * Is logged in.
     * @param {function} caller_cb
     */
    logged_in: function(caller_cb){
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
    },

    /**
     * Utility to call ttrss api.
     * @private
     * @return {object} Handle object for 'request'.
     * @param {object} in_post_data Parameters for ttrss api(it's not JSON).
     * @param {function} caller_cb
     */
    _call_api: function(in_post_data, caller_cb){
      var post_data = {};

      for(var p in in_post_data){
        post_data[p] = in_post_data[p];
      }

      if(post_data.op != 'login'){
        post_data.sid = sid;
      }

      var opts = {
        url: url,
        ca: ca, 
        json: true,
        body: JSON.stringify(post_data)
      };

      var aborted = false;

      var req = request.post(opts, function (err, resp, data) {
        if(!aborted){
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
        }
      });

      return {
        abort: function(){
          aborted = true;
          req.abort();
          caller_cb(new Error('abort'), null);
        }
      };
    },

    /**
     * Get total number of unread articles.
     * @return {object} Handle object for 'request'.
     * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
     * @param {function} in_caller_cb
     */
    get_unread_count: function(in_opts, in_caller_cb){
      var opts = {};
      var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
      opts.op = 'getUnread';

      var that = this;
      return this._call_api(
        opts,
        function(err, data){
          if(!err){
            caller_cb(err, 
                      data.content.unread ? 
                        parseInt(data.content.unread) : data.content.unread);
          }else{
            caller_cb(err, null);
          }
        }
      );
    },

    /**
     * Get total number of subscribed feeds.
     * @return {object} Handle object for 'request'.
     * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
     * @param {function} in_caller_cb
     */
    get_feed_count: function(in_opts, in_caller_cb){
      var opts = {};
      var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
      opts.op = 'getCounters';

      var that = this;
      return this._call_api(
        opts,
        function(err, data){
          if(!err){
            var count = null;
            var len = data.content.length;
            for(var idx=0; idx<len; idx++){
              if(data.content[idx].id == 'subscribed-feeds'){
                count = data.content[idx].counter;
              }
            }
            caller_cb(null, count);
          }else{
            caller_cb(err, null);
          }
        }
      );
    },

    /**
     * Get a list of all available categories.
     * @return {object} Handle object for 'request'.
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
    get_categories: function(in_opts, in_caller_cb){
      var opts = {
        op: 'getCategories',
        unread_only: false,
        enable_nested: false,
        include_empty: false
      };
      var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);

      var that = this;
      return this._call_api(
        opts,
        function(err, data){
          if(!err){
            var cats = remote_object_from_content(Category, data.content, that);
            caller_cb(err, cats);
          }else{
            caller_cb(err, null);
          }
        }
      );
    },

    /**
     * Get a list of feeds in a category.
     * @return {object} Handle object for 'request'.
     * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
     * @param {number} in_opts.cat_id Category id. This is available as the ``id`` property
     *     of a Category object.
     * @param {boolean} in_opts.unread_only *Optional* Include only feeds containing unread
     *     articles. Default is false.
     * @param {number} in_opts.limit *Optional* Limit number of included feeds to ``limit``.
     *     Default is 0 (unlimited).
     * @param {number} in_opts.offset *Optional* Skip this number of feeds. Useful for
     *     pagination. Default is 0.
     * @param {boolean} in_opts.include_nested *Optional* Include child categories. Default
     *     is false.
     * @param {function} in_caller_cb
     */
    get_feeds: function(in_opts, in_caller_cb){
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
      return this._call_api(
        opts,
        function(err, data){
          if(!err){
            var feeds = remote_object_from_content(Feed, data.content, that);
            caller_cb(err, feeds);
          }else{
            caller_cb(err, null);
          }
        }
      );
    },

    /**
     * Get a list of configured labels.
     * @return {object} Handle object for 'request'.
     * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
     * @param {function} in_caller_cb
     */
    get_labels: function(in_opts, in_caller_cb){
      var opts = {};

      var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
      opts.op = 'getLabels';

      var that = this;
      return this._call_api(
        opts,
        function(err, data){
          if(!err){
            var labels = remote_object_from_content(Label, data.content, that);
            caller_cb(err, labels);
          }else{
            caller_cb(err, null);
          }
        }
      );
    },

    /**
     * Get headlines for specified label id. Supports the same in_opts
     *             as ``get_headlines``, except for ``feed_id`` of course.
     * @return {object} Handle object for 'request'.
     * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
     * @param {function} in_caller_cb
     */
    get_headlines_for_label: function(in_opts, in_caller_cb){
      var opts = {};

      var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
      if('label_id' in opts){
        // opts.feed_id = -11 - parseInt(opts.label_id);
        opts.feed_id = parseInt(opts.label_id);
        delete opts.label_id;
      }else{
        opts.feed_id = -11;
      }

      return this.get_headlines(opts, caller_cb);
    },

    /**
     * Get a list of headlines from a specified feed.
     * @return {object} Handle object for 'request'.
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
    get_headlines: function(in_opts, in_caller_cb){
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
      return this._call_api(
        opts,
        function(err, data){
          if(!err){
            var headlines = remote_object_from_content(Headline, data.content, that);
            caller_cb(err, headlines);
          }else{
            caller_cb(err, null);
          }
        }
      );
    },

    /**
     * Get a list of articles from article ids.
     * @return {object} Handle object for 'request'.
     * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
     * @param {string} in_opts.article_id A comma separated string or list of article ids to
     *     fetch,
     */
    get_articles: function(in_opts, in_caller_cb){
      var opts = {
        article_id: null
      };

      var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
      opts.op = 'getArticle';
      if(util.isArray(opts.article_id)){
        opts.article_id = opts.article_id.join(',');
      }

      var that = this;
      return this._call_api(
        opts,
        function(err, data){
          if(!err){
            var articles = remote_object_from_content(Article, data.content, that);
            caller_cb(err, articles);
          }else{
            caller_cb(err, null);
          }
        }
      );
    },


    /**
     * Update all properties of an article object with fresh information from
     * the server.
     * 
     * Please note that this method alters the original object and does not
     * return a new one.
     * (this method is not implemented)
     * @todo Implement this method.
     * @return {object} Handle object for 'request'.
     * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
     * @param {Article} in_opts.content Article.
     * @param {function} in_caller_cb
     */
    refresh_article: function(in_opts, in_caller_cb){
      // TODO: Implement this method.
      throw new Error('must be implemented');  

      // var opts = {};

      // var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
      // opts.op = 'getArticle';
      // opts.article_id = opts.article.id;

      // var that = this;
      // return this._call_api(
      //   opts,
      //   function(err, data){
      //     if(!err){
      //       caller_cb(err, data.content[0]);
      //     }else{
      //       caller_cb(err, null);
      //     }
      //   }
      // );
    },

    /**
     * Share an article to the *published* feed.
     * (this method is not implemented)
     * @todo Implement this method.
     * @return {object} Handle object for 'request'.
     * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
     * @param {string} in_ops.title Article title.
     * @param {string} in_ops.url Article url.
     * @param {string} in_ops.content Article content.
     * @param {function} in_caller_cb
     */
    share_to_published: function(in_opts, in_caller_cb){
      // TODO: Implement this method.
      throw new Error('must be implemented');  

      // var opts = {
      //   //'title': title,
      //   //'url': url,
      //   //'content': content
      // };

      // var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
      // opts.op = 'shareToPublished';

      // var that = this;
      // return this._call_api(
      //   opts,
      //   function(err, data){
      //     if(!err){
      //       caller_cb(err, data.content);
      //     }else{
      //       caller_cb(err, null);
      //     }
      //   }
      // );
    },

    /**
     * Toggle the unread status of an article.
     * (this method is not implemented)
     * @todo Implement this method.
     * @return {object} Handle object for 'request'.
     * @param {object} in_opts Parameters for ttrss api(it's not JSON)(optional).
     * @param {string} in_opts.article_id: List or comma separated string of IDs of articles
     *    to toggle unread.
     * @param {function} in_caller_cb
     */
    toggle_unread: function(in_opts, in_caller_cb){
      // TODO: Implement this method.
      throw new Error('must be implemented');  

      // var opts = {
      //   article_ids: null,
      //   mode: 2,
      //   field: 2
      // };

      // var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
      // opts.op = 'updateArticle';
      // if(util.isArray(opts.article_id)){
      //   opts.article_id = opts.article_id.join(',');
      // }

      // var that = this;
      // return this._call_api(
      //   opts,
      //   function(err, data){
      //     if(!err){
      //       caller_cb(err, data.content);
      //     }else{
      //       caller_cb(err, null);
      //     }
      //   }
      // );
    },


    /**
     * Attempt to mark all articles in specified feed as read.
     * (this method is not implemented)
     * @todo Implement this method.
     * @return {object} Handle object for 'request'.
     * @param {number} feed_id id of the feed to catchup.
     * @param {boolean} is_cat Specified feed is a category. Default is False.
     * @param {function} in_caller_cb
     */
    catchup_feed: function(in_opts, in_caller_cb){
      // TODO: Implement this method.
      throw new Error('must be implemented');  

      // var opts = {
      //   //feed_id: feed_id,
      //   is_cat: false
      // };
      // var caller_cb = parse_api_args(opts, in_opts, in_caller_cb);
      // opts.op = 'catchupFeed';

      // var that = this;
      // return this._call_api(
      //   opts,
      //   function(err, data){
      //     if(!err){
      //       caller_cb(err, data.content);
      //     }else{
      //       caller_cb(err, null);
      //     }
      //   }
      // );
    }
  };
};
