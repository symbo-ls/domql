'use strict'

var $ = require('..')

exports.Language = {
  current: 'en',
  list: {
    nl: 'Dutch',
    ge: 'Georgian',
    us: 'English (USA)',
    uk: 'English (UK)',
    ru: 'Russian'
  },
  set: $.Fn.setCurrent
}
