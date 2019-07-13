'use strict'

import Evt from '../event'
import Err from '../res/error'
import create from './create'

import { style, attr, text, dataset } from './params'

var createElement = (params, key) => {
  if (!Evt.can.render(params)) {
    return Err('HTMLInvalidTag')
  }

  if (!params.data) params.data = {}

  var node
  if (params.tag === 'string') node = document.createTextNode(params.text)
  else if (params.tag) node = document.createElement(params.tag)
  else node = document.createElement('div')

  params.node = node

  var randomKey = parseInt(Math.random() * 10000)
  key = key || params.key ? params.key : randomKey
  params.key = key

  if (params.tag !== 'string') {
    for (let param in params) {
      switch (param) {
        case 'key':
        case 'tag':
        case 'node':
        case 'class':
        case 'on':
          break
        case 'text':
          text(params.text, node)
          break
        case 'data':
          if (params['data'].visible) dataset(params.data, node)
          break
        case 'style':
          style(params.style, node)
          break
        case 'attr':
          attr(params.attr, node)
          break
        default:
          create(params[param], params, param)
      }
    }
  }

  // node.dataset.key = key

  return params
}

export default createElement
