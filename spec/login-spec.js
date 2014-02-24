"use strict";

var fs = require('fs');
var login_info = require('./login-info.json');
var TTRClient = require('../index.js');

describe("TTRClient", function() {

  it("Login to ttrrs api server", function() {
    var client;
    var err;
    var session_id;

    runs(function() {
      var client = new TTRClient(
        login_info.url,
        {
          user: login_info.user,
          password: login_info.password,
          ca: login_info.ca ? fs.readFileSync(login_info.ca) : null
        }
      );
      err = null;
      session_id = null;
      client.login(function(in_err, in_session_id){
        err = in_err;
        session_id = in_session_id;
      });
    });

    waitsFor(function() {
      return (err !== null) || (session_id !== null);
    }, "The session_id should be received", 5000);

    runs(function() {
      expect(err).toBeNull();
      expect(typeof(session_id)).toEqual('string');
      expect(session_id).not.toEqual('');
    });

  });

  it("Login was failed", function() {
    var client;
    var err;
    var session_id;

    runs(function() {
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
      });
    });

    waitsFor(function() {
      return (err !== null) || (session_id !== null);
    }, "The session_id should be received", 5000);

    runs(function() {
      expect(err.toString()).toBe('Error: LOGIN_ERROR');
    });

  });

});
