'use strict'

import Err from '../res/error'
import tree from './tree'
import createElement from './createElement'
import method from './method'
import deepMerge from '../utils/deepMerge'

/**
 * Creating a domQL element using passed parameters
 */
var create = (elemParams, parent, key) => {
  // If parent is not given
  if (!parent) parent = tree.root

  // If elemParams is not given
  if (!elemParams) return Err('CantCreateWithoutNode')

  // create and assign a key
  if (!key) key = elemParams.key ? elemParams.key : parseInt(Math.random() * 10000)

  // if proto, or inherited proto
  if (elemParams.proto) {
    console.log('proto', elemParams)
    deepMerge(elemParams, elemParams.proto)
  } else if (parent && parent.childProto) {
    console.log('childproto', elemParams)
    deepMerge(elemParams, parent.childProto)
  }

  // If elemParams is string
  if (typeof elemParams === 'string') {
    elemParams = { text: elemParams, tag: 'string' }
  }

  elemParams.key = key

  // create Element class
  var element = createElement(elemParams)

  // Assign parent reference to the element
  element.parent = parent

  method.assignNode(element, parent)

  return element
}

export default create
