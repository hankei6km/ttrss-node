/*
 * NOTE: This spec rquires custom label for the test account on ttrss server.
 */
"use strict";

var client = require('./libs/gen_client.js')({auto_login: true});

var util = require('util');
var Label = require('../libs/label.js');

describe("Label", function() {

  var labels = null;
  var err = null;
  var flag = false;

  beforeEach(function(){
    runs(function(){
      if(!flag){
        client.get_labels(function(in_err, in_labels){
          labels = in_labels;
          err = in_err;
          flag = true;
        });
      }
    });
    waitsFor(function() {
      return flag;
    }, "Categories should be received", 10000);
  });

  it("Err of get_labels", function() {
    expect(err).toBeNull();
  });
  it("Type of labels", function() {
    expect(util.isArray(labels)).toBeTruthy();
  });
  it("Labels.length", function() {
    expect(labels.length).toBeGreaterThan(0);
  });
  it("Instance of labels[0]", function() {
    expect(labels[0] instanceof Label).toBeTruthy();
  });
  it("Labels[0].caption", function() {
    expect(typeof(labels[0].caption)).toEqual('string');
    expect(labels[0].caption).not.toEqual('string');
  });
  it("Labels[0].fg_color", function() {
    expect(typeof(labels[0].fg_color)).toEqual('string');
    expect(labels[0].fg_color).not.toEqual('string');
  });
  it("Labels[0].bg_color", function() {
    expect(typeof(labels[0].bg_color)).toEqual('string');
    expect(labels[0].bg_color).not.toEqual('string');
  });
  it("Labels[0].checked", function() {
    expect(typeof(labels[0].checked)).toEqual('boolean');
  });

  describe("Get headlines(only get, do not check item received)", function() {
    var headlines;
    var err;
    var flag;
    runs(function(){
      headlines = null;
      err = null;
      flag = false;
      labels[0].headlines(function(in_err, in_headlines){
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

});
