"use strict";

var fs = require('fs');
var login_info = require('./login-info.json');
var ttrss_node = require('../index.js');

describe("Auto login", function() {

  it("login and Get unread count", function() {
    var client;
    var unread;
    var err;
    var flag;
    runs(function(){
      var client = new ttrss_node(
        login_info.url,
        {
          user: login_info.user,
          password: login_info.password,
          ca: login_info.ca ? fs.readFileSync(login_info.ca) : null,
          auto_login: true
        }
      );

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

    runs(function(){
      expect(err).toBeNull();
      expect(typeof(unread)).toEqual('number');
    });
  });


  it("Auto login failed", function() {
    var client;
    var unread;
    var err;
    var flag;
    runs(function(){
      var client = new ttrss_node(
        login_info.url,
        {
          user: login_info.user,
          password: '',
          ca: login_info.ca ? fs.readFileSync(login_info.ca) : null,
          auto_login: true
        }
      );

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

    runs(function(){
      expect(err.message).toEqual('LOGIN_ERROR');
    });
  });

});
