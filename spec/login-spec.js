"use strict";

var fs = require('fs');
var login_info = require('./login-info.json');
var TTRClient = require('../index.js');

describe("TTRClient", function() {

  it("Login to ttrrs api server , Check Logged in and Logout", function() {
    var client;
    var login_err;
    var logged_in_err;
    var logout_err;
    var session_id;
    var status;
    var flag;

    runs(function() {
      flag = false;
      var client = new TTRClient(
        login_info.url,
        {
          user: login_info.user,
          password: login_info.password,
          ca: login_info.ca ? fs.readFileSync(login_info.ca) : null
        }
      );

      login_err = null;
      logged_in_err = null;
      logout_err = null;
      session_id = null;
      status = null;

      client.login(function(in_login_err, in_session_id){
        login_err = in_login_err;
        session_id = in_session_id;
        client.logged_in(function(in_logged_in_err, in_status){
          logged_in_err = in_logged_in_err
          status = in_status;
          client.logout(function(in_logout_err){
            logout_err = in_logout_err;
            flag = true;
          });
        });
      });
    });

    waitsFor(function() {
      return flag;
    }, "The session_id should be received and logged out", 10000);

    runs(function() {
      expect(login_err).toBeNull();
      expect(typeof(session_id)).toEqual('string');
      expect(session_id).not.toEqual('');
      expect(status).toBeTruthy();
      expect(logged_in_err).toBeNull();
      expect(logout_err).toBeNull();
    });

  });

  it("Login was failed", function() {
    var client;
    var err;
    var session_id;
    var flag;

    runs(function() {
      flag = false;
      var client = new TTRClient(
        login_info.url,
        {
          user: login_info.user,
          password: '',
          ca: login_info.ca ? fs.readFileSync(login_info.ca) : null
        }
      );
      err = null;
      session_id = null;
      client.login(function(in_err, in_session_id){
        err = in_err;
        session_id = in_session_id;
        flag = true;
      });
    });

    waitsFor(function() {
      return flag;
    }, "The session_id should not be received", 10000);

    runs(function() {
      expect(err.toString()).toBe('Error: LOGIN_ERROR');
    });

  });


  it("Logout was failed", function() {
    var client;
    var err;
    var flag;

    runs(function() {
      flag = false;
      var client = new TTRClient(
        login_info.url,
        {
          user: login_info.user,
          password: '',
          ca: login_info.ca ? fs.readFileSync(login_info.ca) : null
        }
      );
      err = null;
      client.logout(function(in_err){
        err = in_err;
        flag = true;
      });
    });

    waitsFor(function() {
      return flag;
    }, "Logged out was failed", 5000);

    runs(function() {
      expect(err.toString()).toBe('Error: NOT_LOGGED_IN');
    });

  });


  it("isLoggedIn was failed", function() {
    var client;
    var err;
    var status;
    var flag;

    runs(function() {
      flag = false;
      var client = new TTRClient(
        login_info.url,
        {
          user: login_info.user,
          password: '',
          ca: login_info.ca ? fs.readFileSync(login_info.ca) : null
        }
      );
      err = null;
      status = null;
      client.logged_in(function(in_err, in_status){
        status = in_status;
        err = in_err;
        flag = true;
      });
    });

    waitsFor(function() {
      return flag;
    }, "Logged out was failed", 5000);

    runs(function() {
      expect(err).toBeNull();
      expect(status).not.toBeTruthy();
    });

  });

});
