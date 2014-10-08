"use strict";

var login_info = require('./login-info.json');
var ttrss_node = require('../index.js');

describe("Abort", function() {

  it("login", function() {
    var client;
    var login_err;
    var flag;

    runs(function() {
      flag = false;
      var client = require('./libs/gen_client.js')();

      login_err = null;

      var req = client.login(function(in_login_err, in_session_id){
        login_err = in_login_err;
        flag = true;
      });

      req.abort();
    });

    waitsFor(function() {
      return flag;
    }, "The login error should be received", 10000);

    runs(function() {
      expect(login_err.message).toEqual('abort');
    });

  });
});
