'use strict'

import root from './root'
import createNode from './createNode'
import { appendNode, assignNode } from './assign'
import { applyPrototype } from './proto'
import nodes from './nodes'
import set from './set'
import createState from './createState'
import createProps from './createProps'
import update from './update'
import * as on from '../event/on'
import { assignClass } from './mixins/classList'
import { isFunction, isNumber, isString, createID, isNode } from '../utils'
import { remove, lookup, log, keys, parse, parseDeep } from './methods'
import cacheNode from './cache'
import { registry } from './mixins'
// import { overwrite, clone, fillTheRest } from '../utils'

const ENV = process.env.NODE_ENV

/**
 * Creating a domQL element using passed parameters
 */
const create = (element, parent, key, options = {}) => {
  // if ELEMENT is not given
  if (element === undefined) element = {}
  if (element === null) return

  // if element is proto
  if (element.__hash) {
    element = { proto: element }
  }

  if (options.components) {
    const { components } = options
    const { proto, component } = element
    if (isString(proto))
      if (components[proto]) element.proto = components[proto]
      else console.warn(proto, 'is not in library', components, element)
  }

  // define KEY
  const assignedKey = element.key || key || createID.next().value

  // if PARENT is not given
  if (!parent) parent = root
  if (isNode(parent)) parent = root[`${key}_parent`] = { node: parent }

  // if element is STRING
  if (isString(element) || isNumber(element)) {
    element = {
      text: element,
      tag: (!element.proto && parent.childProto && parent.childProto.tag) ||
      ((nodes.body.indexOf(key) > -1) && key) || 'string'
    }
  }

  // create PROTOtypal inheritance

  applyPrototype(element, parent, options)

  if (Object.keys(options).length) {
    registry.defaultOptions = options
    if (options.ignoreChildProto) delete options.ignoreChildProto
  }

  // enable STATE
  element.state = createState(element, parent)

  // create and assign a KEY
  element.key = assignedKey

  // don't render IF in condition
  if (isFunction(element.if)) {
    // TODO: move as fragment
    if (!element.if(element, element.state)) {
      const ifFragment = cacheNode({ tag: 'fragment' })
      element.__ifFragment = appendNode(ifFragment, parent.node)
      element.__ifFalsy = true
    }
  }

  // set the PATH array
  if (ENV === 'test' || ENV === 'development') {
    if (!parent.path) parent.path = []
    element.path = parent.path.concat(assignedKey)
  }

  // if it already HAS a NODE
  if (element.node && !element.__ifFalsy) { // TODO: check on if
    return assignNode(element, parent, assignedKey)
  }

  // assign METHODS
  element.set = set
  element.update = update
  element.remove = remove
  element.lookup = lookup
  element.parse = parse
  element.parseDeep = parseDeep
  element.keys = keys
  if (ENV === 'test' || ENV === 'development') {
    element.log = log
  }

  // enable TRANSFORM in data
  if (!element.transform) element.transform = {}

  // enable CACHING
  if (!element.__cached) element.__cached = {}

  // enable EXEC
  if (!element.__exec) element.__exec = {}

  // enable CHANGES storing
  if (!element.__changes) element.__changes = []

  // enable CHANGES storing
  const hasRoot = parent.parent && parent.parent.key === ':root'
  if (!element.__root) element.__root = hasRoot ? parent : parent.__root

  // apply props settings
  if (!element.__ifFalsy) createProps(element, parent)

  // run `on.init`
  if (element.on && isFunction(element.on.init)) {
    on.init(element.on.init, element, element.state)
  }

  // generate a CLASS name
  assignClass(element)

  // console.group('create')
  // console.log(element.path)
  // console.log(element)
  // console.groupEnd('create')
  // if (parent.key === 'footer' && key === '0') debugger

  // CREATE a real NODE
  createNode(element, options)

  if (element.__ifFalsy) return element

  // assign NODE
  assignNode(element, parent, key)

  // run `on.render`
  if (element.on && isFunction(element.on.render)) {
    on.render(element.on.render, element, element.state)
  }

  return element
}

export default create
