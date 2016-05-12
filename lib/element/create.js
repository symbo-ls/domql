'use strict'

var $ = require('../index')

console.log(
  require('..'),
  require('.'),
  require('./base')
)

exports.create = function (node, parent) {
  if (!parent) parent = $.Element.base
  if (!node) return $.Error.report('CantCreateWithoutNode')
  if (node && typeof node === 'string') {
    node = { text: node }
  }

  var elem = $.Element.createElement(node)
  elem.parent = parent
  $.Element.method.assign(elem, $.Element.tree[parent])
}

exports.createElement = function (params) {
  if (!$.Event.can.render(params)) {
    return $.Error.report('InvalidDOMNode')
  }

  var attr = params.attr
  if (attr) {
    if (!typeof attr === 'object') $.Error.report('HTMLInvalidAttr', params)
  }

  var styles = params.styles
  if (styles) {
    if (!typeof styles === 'object') $.Error.report('HTMLInvalidStyles', params)
  }

  var node = document.createElement(params.nodeName, attr)
  var key = parseInt(Math.random() * 10000)
  node.dataset.key = key

  console.log('params')
  console.log(params)
  console.log(key, node)

  return {
    key: key,
    nodeName: params.nodeName,
    node: node
  }
}
