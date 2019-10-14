'use strict'

import Err from '../res/error'
import tree from './tree'
import createNode from './createNode'
import method from './method'
import applyPrototype from './proto'
import ID from './id'
import nodes from './nodes'
import set from './set'
import update from './update'

/**
 * Creating a domQL element using passed parameters
 */
var create = (element, parent, key) => {
  // If parent is not given
  if (!parent) parent = tree

  // If element is not given
  if (!element) return Err('CantCreateWithoutNode')

  // define key
  var assignedKey = element.key || key || ID.next().value

  // if it already has a node
  if (element.node) {
    return method.assignNode(element, parent, assignedKey)
  }

  // If element is string
  if (typeof element === 'string' || typeof element === 'number') {
    element = {
      text: element,
      tag: (!element.proto && parent.childProto && parent.childProto.tag) ||
      ((nodes.body.indexOf(key) > -1) && key) || 'string'
    }
  }

  if (!element.class && typeof assignedKey === 'string' && assignedKey.charAt(0) === '_') {
    element.class = assignedKey.slice(1)
  }

  // Assign parent reference to the element
  element.parent = parent

  // if proto, or inherited proto
  applyPrototype(element)

  // create and assign a key
  element.key = assignedKey

  if (typeof element.if === 'function' && !element.if(element)) return void 0

  // enable caching in data
  if (!element.data) element.data = {}

  // create Element class
  createNode(element)

  element.set = set
  element.update = update
  method.assignNode(element, parent, key)

  return element
}

export default create
