'use strict'

var $ = require('..')

exports.area: {
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
  set: $.fn.setCurrent
}
