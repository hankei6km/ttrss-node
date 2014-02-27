/**
 * This is the base class for representing remote resources as Js objects.
 * @module remote-object
 * @author hankei6km
 * @copyright (c) 2014 hankei6km
 * @license MIT License (http://opensource.org/licenses/mit-license.php)
 */
"use strict";

/**
 * @constructor
 * @alias module:remote-object
 * @param {object} attr Remote resource.
 * @param {object} client Instance of TTRClient.
 */
function RemoteObject(attr, client){
  this._client = client;
  this._attr = {};
  for(var k in attr){
    this._attr[k] = attr[k];
  }
}

/**
 * Define shortcut to _attr.
 * @param {prototype} proto
 * @param {string} name
 */
function def_attr_getter(proto, name){
  Object.defineProperty(proto, name, {
    get: function() {
      return this._attr[name];
    }
  });
}

// Define shortcut to _attr for RemoteObject.
[
  "id",
  "title",
  "unread",
  "cat_id"
].forEach(function(item){
  def_attr_getter(RemoteObject.prototype, item);
});

module.exports = RemoteObject;
