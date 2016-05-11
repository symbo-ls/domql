'use strict'

var $ = require('..')

exports.Area: {
  current: 'nl',
  list: {
    nl: 'Netherlands',
    ge: 'Georgia',
    us: 'USA',
    ru: 'Russia'
  },
  timezone: {
    current: '',
    list: {} // this gonna be looong list
  },
  set: $.Fn.setCurrent
}
