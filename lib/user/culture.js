'use strict'

var $ = require('..')

exports.culture = {
  current: $.user.area.current,
  list: $.user.area.list,
  set: $.functions.setCurrent
}
