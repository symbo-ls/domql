'use strict'

var _ = require('lodash')

exports.Event = _.merge(
  require('./can'),
  require('./on'),
  require('./store'),
  require('./render')
)
