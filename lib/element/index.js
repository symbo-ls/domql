'use strict'

var _ = require('lodash')
exports.Element = {}

_.assign(
  exports.Element,
  require('./node'),
  require('./create'),
  require('./method'),
  require('./base'),
  require('./tree')
)
