'use strict'

var $ = require('.')
var _ = require('lodash')

module.exports = {}

_.assign(
  module.exports,
  require('./fn'),
  require('./element'),
  require('./event'),
  require('./user'),
  require('./resources/string'),
  require('./resources/error')
)
