"use strict";

var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var login_info = require('../login-info.json');
var ttrss_node = require('../../index.js');

module.exports = function(in_opts){
  var opts = _.extend({
      user: login_info.user,
      password: login_info.password,
      ca: login_info.ca ? fs.readFileSync(login_info.ca) : null,
      cert: login_info.cert ? fs.readFileSync(login_info.cert) : null,
      key: login_info.key ? fs.readFileSync(login_info.key) : null,
      auto_login: false
  }, in_opts || {});

  var client = new ttrss_node(login_info.url, opts);

  return client;
};
