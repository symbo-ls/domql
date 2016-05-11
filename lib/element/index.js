'use strict'

var _ = require('lodash')

exports.Element = _.merge(
  require('./node'),
  require('./create'),
  require('./methods'),
  require('./base')
  require('./tree')
)
