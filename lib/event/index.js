'use strict'

var _ = require('lodash')

exports.Event = _.assign(
  require('./can'),
  require('./on'),
  require('./is'),
  require('./store'),
  require('./render')
)
