'use strict'

var _ = require('lodash')
var $ = require('../index')

exports.create = function (element, parent) {
  if (!parent || $.Element.tree.base) parent = $.Element.tree.base
  if (!element) return $.Error.report('CantCreateWithoutNode')
  if (element && typeof element === 'string') {
    element = { text: element }
  }

  element = $.Element.createElement(element)
  element.parent = parent

  $.Element.method.assign(element, $.Element.tree.base)

  return element
}

exports.createElement = function (params) {
  if (!$.Event.can.render(params)) {
    return $.Error.report('HTMLInvalidTag')
  }

  if (!params.tag) params.tag = 'div'
  var node = document.createElement(params.tag)

  var attr = params.attr
  if (attr) {
    if (!typeof attr === 'object') $.Error.report('HTMLInvalidAttr', params)
    for (let a in attr) {
      node.setAttribute(a, attr[a])
    }
  }

  var style = params.style
  if (style) {
    if (typeof style === 'object') $.Fn.mapProperty(node.style, style)
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
  node.dataset.key = key

  return {
    key: key,
    tag: params.tag,
    node: node
  }
}
