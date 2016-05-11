'use strict'

var _ = require('lodash')
var about = JSON.parse(require('../about.json'))

_.merge(
  exports,
  about,
  require('./element'),
  require('./fn'),
  require('./user')
)
