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
  if(typeof(this._attr.id) === 'string'){
    this._attr.id = parseInt(this._attr.id);
  }
  if(typeof(this._attr.unread) === 'string'){
    this._attr.unread = parseInt(this._attr.unread);
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

  "cat_id",

  "marked",
  "published",
  "updated",
  "is_updated",
  "link",
  "feed_id",
  "tags",
  "excerpt",
  "content",
  "labels",
  "feed_title",
  "comments_count",
  "comments_link",
  "always_display_attachments",
  "author",
  "score",
  "note",
  "lang",

  "has_icon",
  "order_id",

  "caption",
  "fg_color",
  "bg_color",
  "checked"
].forEach(function(item){
  def_attr_getter(RemoteObject.prototype, item);
});

module.exports = RemoteObject;
