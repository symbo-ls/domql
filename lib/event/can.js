'use strict'

var $ = require('..')

exports.can = {
  render (element) {
    var tag = element.tag || 'div'
    var isValid = _.indexOf($.Element.node.names, tag) > -1
    return isValid || $.Error.report('HTMLInvalidTag')
  }
}
