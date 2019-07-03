'use strict'

import Evt from '../event'
import Err from '../res/error'

import { style, attr, text } from './params'

var createElement = (params) => {
  if (!Evt.can.render(params)) {
    return Err('HTMLInvalidTag')
  }

  if (!params.tag) params.tag = 'div'
  var node = document.createElement(params.tag)

  text(params.text, node)
  style(params.style, node)
  attr(params.attr, node)

  var key = parseInt(Math.random() * 10000)
  node.dataset.key = key

  return {
    key: key,
    tag: params.tag,
    node: node
  }
}

export default createElement
