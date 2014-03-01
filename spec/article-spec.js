"use strict";

var fs = require('fs');
var util = require('util');
var login_info = require('./login-info.json');
var TTRClient = require('../index.js');
var Article = require('../libs/article.js');

var client = new TTRClient(
  login_info.url,
  {
    user: login_info.user,
    password: login_info.password,
    ca: login_info.ca ? fs.readFileSync(login_info.ca) : null
  }
);

describe("TTRClient Feed", function() {

  var articles = null;
  var err = null;
  var flag = false;

  beforeEach(function(){
    runs(function(){
      if(!flag){
        client.login(function(err, in_session_id){
          if(!err){
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

});
