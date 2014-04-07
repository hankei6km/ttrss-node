"use strict";

var fs = require('fs');
var util = require('util');
var login_info = require('./login-info.json');
var ttrss_node = require('../index.js');
var Feed = require('../libs/feed.js');

var client = new ttrss_node(
  login_info.url,
  {
    user: login_info.user,
    password: login_info.password,
    ca: login_info.ca ? fs.readFileSync(login_info.ca) : null
  }
);

describe("Feed", function() {

  var feeds = null;
  var err = null;
  var flag = false;

  beforeEach(function(){
    runs(function(){
      if(!flag){
        client.login(function(err, in_session_id){
          if(!err){
            client.get_feeds(function(in_err, in_feeds){
              feeds = in_feeds;
              err = in_err;
              flag = true;
            });
          }else{
            throw err;
          }
        });
      }
    });
    waitsFor(function() {
      return flag;
    }, "Feeds should be received", 10000);
  });

  it("Err of get_feeds", function() {
    expect(err).toBeNull();
  });
  it("Type of Feeds", function() {
    expect(util.isArray(feeds)).toBeTruthy();
  });
  it("Feeds.length", function() {
    expect(feeds.length).toBeGreaterThan(0);
  });
  it("Instance of Feeds[0]", function() {
    expect(feeds[0] instanceof Feed).toBeTruthy();
  });
  it("Feeds[0].cat_id", function() {
    expect(feeds[0].cat_id).toEqual(-1);
  });

  describe("Get headlines(only get, do not check item received)", function() {
    var headlines;
    var err;
    var flag;
    runs(function(){
      headlines = null;
      err = null;
      flag = false;
      feeds[1].headlines(function(in_err, in_headlines){
        headlines = in_headlines;
        err = in_err;
        flag = true;
      });
    });
    waitsFor(function() {
      return flag;
    }, "Headlines should be received", 10000);

    it("Err of Feed.headlines", function() {
      expect(err).toBeNull();
    });
  });

  describe("Catchup feed", function() {
    var content;
    var article;
    var err;
    var flag;
    runs(function(){
      err = null;
      flag = false;
      var feed = null;
      for(var idx=0; idx<feeds.length; idx++){
        if(feeds[idx].id == -4){
          feed = feeds[idx];
          break;
        }
      }
      feed.headlines(function(in_err, headlines){
        client.mark_unread({article_id: headlines[0].id}, function(in_err, in_content){
          feed.catchup(function(in_err, in_content){
            if(!in_err){
              content = in_content;
              headlines[0].full_article(function(in_err, in_article){
                article = in_article;
                err = in_err;
                flag = true;
              });
            }else{
              err = in_err;
              flag = true;
            }
          });
        });
      });
    });
    waitsFor(function() {
      return flag;
    }, "Headlines should be received", 10000);

    it("Err of Feed.headlines", function() {
      expect(err).toBeNull();
    });
  });

});
