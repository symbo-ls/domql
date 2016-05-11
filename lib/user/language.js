'use strict'

var $ = require('..')

exports.language = {
  current: 'en',
  list: {
    nl: 'Dutch',
    ge: 'Georgian',
    us: 'English (USA)',
    uk: 'English (UK)',
    ru: 'Russian'
  },
  set: $.functions.setCurrent
}
