'use strict'

var _ = require('lodash')

exports.User = _.merge(
  require('./area'),
  require('./culture'),
  require('./language')
)
