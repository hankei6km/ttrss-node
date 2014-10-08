"use strict";

var client = require('./libs/gen_client.js')({auto_login: true});

var util = require('util');
var Category = require('../libs/category.js');

describe("Category", function() {

  var cats = null;
  var err = null;
  var flag = false;

  beforeEach(function(){
    runs(function(){
      if(!flag){
        client.get_categories(function(in_err, in_cats){
          cats = in_cats;
          err = in_err;
          flag = true;
        });
      }
    });
    waitsFor(function() {
      return flag;
    }, "Categories should be received", 10000);
  });

  it("Err of get_categories", function() {
    expect(err).toBeNull();
  });
  it("Type of Categories", function() {
    expect(util.isArray(cats)).toBeTruthy();
  });
  it("Categories.length", function() {
    expect(cats.length).toBeGreaterThan(0);
  });
  it("Instance of Categories[0]", function() {
    expect(cats[0] instanceof Category).toBeTruthy();
  });
  it("Special category", function() {
    var contain = false;
    var id = null;
    var unread = null;
    cats.forEach(function(cat){
      if(cat.title == 'Special'){
        contain = true;
        id = cat.id;
        unread = cat.unread;
      }
    });
    expect(contain).toBeTruthy();
    expect(id).toEqual(-1);
    expect(typeof(unread)).toEqual('number');
  });

  describe("Get feeds(only get, do not check item received)", function() {
    var feeds;
    var err;
    var flag;
    runs(function(){
      feeds = null;
      err = null;
      flag = false;
      cats[0].feeds(function(in_err, in_feeds){
        feeds = in_feeds;
        err = in_err;
        flag = true;
      });
    });
    waitsFor(function() {
      return flag;
    }, "Feeds should be received", 10000);

    it("Err of Category.feeds", function() {
      expect(err).toBeNull();
    });
  });

});
