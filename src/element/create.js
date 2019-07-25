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

  // if proto
  if (elemParams.proto) {
    deepMerge(elemParams, elemParams.proto)
  }

  // If elemParams is string
  if (typeof elemParams === 'string') {
    elemParams = { key, text: elemParams, tag: 'string' }
  }

  // create Element class
  var element = createElement(elemParams, key)

  // Assign parent reference to the element
  element.parent = parent

  method.assignNode(element, parent)

  return element
}

export default create
