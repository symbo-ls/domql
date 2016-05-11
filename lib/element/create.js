'use strict'

var $ = require('..')

exports.createElement = function (nodeName, params) {
  var node = document.createElement(nodeName)
  var key = parseInt(Math.random() * 10000)
  node.dataset.key = key

  if (params && typeof params === 'object') node.attributes = params
  else $.Error.report('InvalidParams', params)

  return {
    nodeName: nodeName,
    node: node,
    parent: $.Element.base
  }
}
