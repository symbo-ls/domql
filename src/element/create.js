'use strict'

import Err from '../res/error'
import tree from './tree'
import createElement from './createElement'
import method from './method'

var create = (elemParams, parent) => {
  // If parent is not given
  if (!parent || tree.base) parent = tree.base

  // If elemParams is not given
  if (!elemParams) return Err('CantCreateWithoutNode')

  // If elemParams is string
  if (elemParams && typeof elemParams === 'string') {
    elemParams = { text: elemParams }
  }

  // create Element class
  var element = createElement(elemParams)

  // Assign parent reference to the element
  element.parent = parent

  method.assign(element, tree.base)

  return element
}

export default create
