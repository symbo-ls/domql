'use strict'

var $ = require('..')

exports.on = {
  render (parent) {
    parent($.Event.store.render)
  }
}
