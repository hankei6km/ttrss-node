"use strict";

var client = require('./libs/gen_client.js')({auto_login: true});

var util = require('util');
var Headline = require('../libs/headline.js');

describe("Headline", function() {

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

  it("Err of get_headlines", function() {
    expect(err).toBeNull();
  });
  it("Type of Headlines", function() {
    expect(util.isArray(headlines)).toBeTruthy();
  });
  it("Headlines.length", function() {
    expect(headlines.length).toBeGreaterThan(0);
  });
  it("Instance of Headlines[0]", function() {
    expect(headlines[0] instanceof Headline).toBeTruthy();
  });
  it("Feeds[0].title", function() {
    expect(headlines[0].title).not.toEqual('');
  });

  describe("Get full_article(only get, do not check item received)", function() {
    var article;
    var err;
    var flag;
    runs(function(){
      article = null;
      err = null;
      flag = false;
      headlines[0].full_article(function(in_err, in_article){
        article = in_article;
        err = in_err;
        flag = true;
      });
    });
    waitsFor(function() {
      return flag;
    }, "Article should be received", 10000);

    it("Err of Headline.full_article", function() {
      expect(err).toBeNull();
    });
  });
});
