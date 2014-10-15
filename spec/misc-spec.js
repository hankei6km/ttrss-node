"use strict";

var client = require('./libs/gen_client.js')({auto_login: true});

var util = require('util');
var ttrss_node = require('../index.js');

describe("Misc", function() {

  it("dummy", function() {
    expect(null).toBeNull();
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

  describe("Edit/Enum shortcut(received attr) of remote-obj.", function() {
    var cats;
    var flag;
    runs(function(){
      cats = null;
      flag = false;
      client.get_categories(function(in_err, in_cats){
        cats = in_cats;
        flag = true;
      });
    });
    waitsFor(function() {
      return flag;
    }, "Categories should be received", 10000);

    it("Edit.", function() {
      var cat = cats[0];

      cat.id = 'test';
      expect(cat._attr.id).toEqual('test');

      // delete cat.id;
      // expect('id' in cat).not.toBeTruthy();
      // expect('id' in cat._attr).not.toBeTruthy();
    });

    it("Enum.", function() {
      var cat = cats[0];
      var t = false;

      for(var p in cat){
        if(p === 'unread'){
          t = true;
        }
      }

      expect(t).toBeTruthy();
    });
  });

});
