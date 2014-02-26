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

Object.defineProperty(RemoteObject.prototype, "id", {
  get: function() {
    return this._attr.id;
  }
});
Object.defineProperty(RemoteObject.prototype, "title", {
  get: function() {
    return this._attr.title;
  }
});
Object.defineProperty(RemoteObject.prototype, "unread", {
  get: function() {
    return this._attr.unread;
  }
});

module.exports = RemoteObject;
