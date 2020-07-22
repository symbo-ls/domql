'use strict'

import { report } from '../utils'
import tree from './tree'
import createNode from './createNode'
import { assignNode } from './assign'
import { applyPrototype } from './proto'
import ID from './id'
import nodes from './nodes'
import set from './set'
import update from './update'
import * as on from '../event/on'

/**
 * Creating a domQL element using passed parameters
 */
var create = (element, parent, key) => {
  // If parent is not given
  if (!parent) parent = tree

  // If element is not given
  if (element === undefined) element = {}
  if (element === null) return void 0

  // run onInit
  if (element.on && typeof element.on.init === 'function') {
    on.init(element.on.init, element)
  }

  // define key
  var assignedKey = element.key || key || ID.next().value

  // if it already has a node
  if (element.node) {
    return assignNode(element, parent, assignedKey)
  }

  // If element is string
  if (typeof element === 'string' || typeof element === 'number') {
    element = {
      text: element,
      tag: (!element.proto && parent.childProto && parent.childProto.tag) ||
      ((nodes.body.indexOf(key) > -1) && key) || 'string'
    }
  }

  // Assign parent reference to the element
  element.parent = parent

  // Set the path
  if (!parent.path) parent.path = []
  element.path = parent.path.concat(assignedKey)

  // if proto, or inherited proto
  applyPrototype(element)

  // generate a class name
  if (element.class === true) element.class = assignedKey
  else if (!element.class && typeof assignedKey === 'string' && assignedKey.charAt(0) === '_') {
    element.class = assignedKey.slice(1)
  }

  // create and assign a key
  element.key = assignedKey

  if (typeof element.if === 'function' && !element.if(element)) return void 0

  // enable caching in data
  if (!element.data) element.data = {}

  // create Element class
  createNode(element)

  element.set = set
  element.update = update
  assignNode(element, parent, key)

  // run onRender
  if (element.on && typeof element.on.render === 'function') {
    on.render(element.on.render, element)
  }

  return element
}

export default create
