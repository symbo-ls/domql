'use strict'

var _ = require('lodash')
var $ = require('../index')

exports.create = function (node, parent) {
  if (!parent || $.Element.base) parent = $.Element.base
  if (!node) return $.Error.report('CantCreateWithoutNode')
  if (node && typeof node === 'string') {
    node = { text: node }
  }

  var elem = $.Element.createElement(node)
  elem.parent = parent

  $.Element.method.assign(elem, $.Element.tree.base)
}

exports.createElement = function (params) {
  if (!$.Event.can.render(params)) {
    return $.Error.report('InvalidDOMNode')
  }

  var node = document.createElement(params.nodeName)

  var attr = params.attr
  if (attr) {
    if (!typeof attr === 'object') $.Error.report('HTMLInvalidAttr', params)
    for (let a in attr) {
      node.setAttribute(a, attr[a])
    }
  }

  var styles = params.styles
  if (styles) {
    if (typeof styles === 'object') $.Fn.mapProperty(node.style, styles)
    else $.Error.report('HTMLInvalidStyles', params)
  }

  var text = params.text
  if (text) {
    if (typeof text === 'string') {
      text = document.createTextNode(text)
      $.Element.method.append(text, node)
    }
    else $.Error.report('HTMLInvalidText', params)
  }

  var key = parseInt(Math.random() * 10000)
  node.dataset[key] = key

  return {
    key: key,
    nodeName: params.nodeName,
    node: node
  }
}
