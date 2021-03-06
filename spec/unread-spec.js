"use strict";

var client = require('./libs/gen_client.js')({auto_login: true});

var util = require('util');
var Headline = require('../libs/headline.js');

describe("Unread", function() {

  var headlines = null;
  var err = null;
  var flag = false;

  beforeEach(function(){
    runs(function(){
      if(!flag){
        client.get_headlines(function(in_err, in_headlines){
          headlines = in_headlines;
          err = in_err;
          flag = true;
        });
      }
    });
    waitsFor(function() {
      return flag;
    }, "Headlines should be received", 10000);
  });

  it("Mark unread and mark read", function() {
    var article;
    var content;
    var err;
    var flag;
    runs(function(){
      article = null;
      content = null;
      err = null;
      flag = false;
      client.mark_unread({article_id: headlines[0].id}, function(in_err, in_content){
        if(!in_err){
          client.mark_read({article_id: headlines[0].id}, function(in_err, in_content){
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
        }else{
          err = in_err;
          flag = true;
        }
      });
    });
    waitsFor(function() {
      return flag;
    }, "Article should be received", 10000);

    runs(function(){
      expect(err).toBeNull();
      expect(content.updated).toEqual(1);
      expect(article.unread).not.toBeTruthy();
    });
  });

  it("Mark read and mark unread", function() {
    var article;
    var content;
    var err;
    var flag;
    runs(function(){
      article = null;
      content = null;
      err = null;
      flag = false;
      client.mark_read({article_id: headlines[0].id}, function(in_err, in_content){
        if(!in_err){
          client.mark_unread({article_id: headlines[0].id}, function(in_err, in_content){
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
        }else{
          err = in_err;
          flag = true;
        }
      });
    });
    waitsFor(function() {
      return flag;
    }, "Article should be received", 10000);

    runs(function(){
      expect(err).toBeNull();
      expect(content.updated).toEqual(1);
      expect(article.unread).toBeTruthy();
    });
  });

  it("Mark all article in specified feed as read", function() {
    var article;
    var content;
    var err;
    var flag;
    runs(function(){
      article = null;
      content = null;
      err = null;
      flag = false;
      client.mark_unread({article_id: headlines[0].id}, function(in_err, in_content){
        if(!in_err){
          client.catchup_feed({feed_id: -4, in_cat: false}, function(in_err, in_content){
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
        }else{
          err = in_err;
          flag = true;
        }
      });
    });
    waitsFor(function() {
      return flag;
    }, "Article should be received", 10000);

    runs(function(){
      expect(err).toBeNull();
      expect(content.status).toEqual('OK');
      expect(article.unread).not.toBeTruthy();
    });
  });
});
