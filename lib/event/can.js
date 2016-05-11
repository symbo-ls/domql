'use strict'

var $ = require('..')

exports.can = {
  render (element) {
    var isValid = _.indexOf($.Element.node.names, element.nodeName) > -1
    return isValid || $.Error.report('InvalidDOMNode')
  }
}
