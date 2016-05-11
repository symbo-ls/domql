'use strict'

var $ = require('..')

exports.render = function (element) {
  if (!$.Event.can.render(element)) {
    return $.Error.report('InvalidDOMNode')
  }

  var parent = element.parent
  var node = element.node

  $.Element.method.define(node, parent)
}
