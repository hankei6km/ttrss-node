"use strict";

var fs = require('fs');
var util = require('util');
var login_info = require('./login-info.json');
var TTRClient = require('../index.js');

var client = new TTRClient(
  login_info.url,
  {
    user: login_info.user,
    password: login_info.password,
    ca: login_info.ca ? fs.readFileSync(login_info.ca) : null
  }
);

describe("TTRClient Misc", function() {

  var err = null;
  var flag = false;

  beforeEach(function(){
    runs(function(){
      if(!flag){
        client.login(function(err, in_session_id){
          if(!err){
            flag = true;
          }else{
            throw err;
          }
        });
      }
    });
    waitsFor(function() {
      return flag;
    }, "Sid should be received", 10000);
  });
  it("Err", function() {
    expect(err).toBeNull();
  });

  describe("Get total number of unread articles", function() {
    var unread;
    var err;
    var flag;
    runs(function(){
      unread = null;
      err = null;
      flag = false;
      client.get_unread_count(function(in_err, in_unread){
        unread = in_unread;
        err = in_err;
        flag = true;
      });
    });
    waitsFor(function() {
      return flag;
    }, "Number of unread should be received", 10000);

    it("Err", function() {
      expect(err).toBeNull();
    });
    it("Unread type.", function() {
      expect(typeof(unread)).toEqual('number');
    });
  });

  describe("Get total number of subscribed feeds.", function() {
    var count;
    var err;
    var flag;
    runs(function(){
      count = null;
      err = null;
      flag = false;
      client.get_feed_count(function(in_err, in_count){
        count = in_count;
        err = in_err;
        flag = true;
      });
    });
    waitsFor(function() {
      return flag;
    }, "Number of subscribed feeds should be received", 10000);

    it("Err", function() {
      expect(err).toBeNull();
    });
    it("Count type.", function() {
      expect(typeof(count)).toEqual('number');
    });
  });

});
