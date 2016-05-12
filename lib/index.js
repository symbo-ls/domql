'use strict'

var $ = require('.')
var _ = require('lodash')

module.exports = global.app = {}

_.assign(
  module.exports,
  require('./fn'),
  require('./element'),
  require('./event'),
  require('./resources/string'),
  require('./resources/language'),
  require('./resources/error')
)
