"use strict";

var client = require('./libs/gen_client.js')({auto_login: true});

var util = require('util');
var Article = require('../libs/article.js');

describe("Article", function() {

  var articles = null;
  var err = null;
  var flag = false;

  beforeEach(function(){
    runs(function(){
      if(!flag){
        client.get_headlines(function(in_err, headlines){
          if(!err){
            client.get_articles({article_id:headlines[0].id}, function(in_err, in_articles){
              articles = in_articles;
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
    }, "Articles should be received", 10000);
  });

  it("Err of get_articles", function() {
    expect(err).toBeNull();
  });
  it("Type of Articles", function() {
    expect(util.isArray(articles)).toBeTruthy();
  });
  it("Articles.length", function() {
    expect(articles.length).toBeGreaterThan(0);
  });
  it("Instance of Articles[0]", function() {
    expect(articles[0] instanceof Article).toBeTruthy();
  });
  it("Feeds[0].title", function() {
    expect(articles[0].title).not.toEqual('');
  });

  describe("Toggle unread", function() {
    var content;
    var unread;
    var err;
    var flag;
    runs(function(){
      content = null;
      unread = null;
      err = null;
      flag = false;
      articles[0].toggle_unread(function(in_err, in_content){
        content = in_content;
        err = in_err;
        if(!err){
          client.get_articles({article_id:articles[0].id}, function(in_err, in_articles){
            unread = in_articles[0].unread;
            err = in_err;
            flag = true;
          });
        }else{
          flag = true;
        }
      });
    });
    waitsFor(function() {
      return flag;
    }, "Content should be received", 10000);

    it("Err", function() {
      expect(err).toBeNull();
    });
    it("Content.updated", function() {
      expect(content.updated).toEqual(1);
    });
    it("Toggled unread", function() {
      if(articles[0].unread){
        expect(unread).not.toBeTruthy();
      }else{
        expect(unread).toBeTruthy();
      }
    });
  });
});
