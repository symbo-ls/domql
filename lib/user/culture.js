'use strict'

var $ = require('..')

exports.Culture = {
  current: $.User.Area.current,
  list: $.User.Area.list,
  set: $.Fn.setCurrent
}
