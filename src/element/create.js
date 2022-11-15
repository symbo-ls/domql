'use strict'

import root from './root'
import createNode from './node'
import { appendNode, assignNode } from './assign'
import { applyExtend } from './extend'
import nodes from './nodes'
import set, { removeContentElement } from './set'
import createState from './state'
import createProps from './props'
import update from './update'
import { on } from '../event'
import { assignClass } from './mixins/classList'
import { isFunction, isNumber, isString, createID, isNode, exec } from '../utils'
import { remove, lookup, setProps, log, keys, parse, parseDeep, spotByPath, nextElement, previousElement } from './methods'
import cacheNode from './cache'
import { registry } from './mixins'
import OPTIONS from './options'
// import { overwrite, clone, fillTheRest } from '../utils'

const ENV = process.env.NODE_ENV

/**
 * Creating a domQL element using passed parameters
 */
const create = (element, parent, key, options = OPTIONS.create || {}) => {
  if (options && !OPTIONS.create) OPTIONS.create = options

  // if ELEMENT is not given
  if (element === undefined) {
    if (ENV === 'test' || ENV === 'development')
      console.warn(key, 'element is undefined in', parent && parent.path)
    element = {}
  }
  if (element === null) return
  if (element === true) element = { text: true }

  // if element is extend
  if (element.__hash) {
    element = { extend: element }
  }

  // if PARENT is not given
  if (!parent) parent = root
  if (isNode(parent)) parent = root[`${key}_parent`] = { key: ':root', node: parent }

  // if element is STRING
  if (isString(element) || isNumber(element)) {
    const extendTag = element.extend && element.extend.tag
    const childExtendTag = parent.childExtend && parent.childExtend.tag
    const isKeyValidHTMLTag = ((nodes.body.indexOf(key) > -1) && key)
    element = {
      text: element,
      tag: extendTag || childExtendTag || isKeyValidHTMLTag || 'string'
    }
  }

  // define KEY
  const assignedKey = element.key || key || createID.next().value

  const { extend, props, state, childExtend, childProps } = element

  if (isKeyComponent(assignedKey)) {
    const hasComponentAttrs = extend || childExtend || props || state || element.on
    const componentKey = assignedKey.split('_')[0]
    if (!hasComponentAttrs || childProps) {
      parent[assignedKey] = element = {
        extend: componentKey || assignedKey,
        props: { ...element }
      }
    } else if (!extend || extend === true) {
      parent[assignedKey] = element = {
        ...element,
        extend: componentKey || assignedKey
      }
    }
  }

  // Responsive rendering
  // TODO: move as define plugin
  if (assignedKey.slice(0, 1) === '@') {
    if (props) {
      props.display = 'none'
      if (props[assignedKey]) props[assignedKey].display = props.display
      else props[assignedKey] = { display: props.display || 'block' }
    } else {
      parent[assignedKey] = element = {
        ...element,
        props: {
          display: 'none',
          [assignedKey]: { display: 'block' }
        }
      }
    }
  }

  if (options.components) {
    const { components } = options
    const { extend, component } = element
    const execExtend = exec(extend, element)
    if (isString(execExtend))
      if (components[execExtend]) element.extend = components[execExtend]
      else {
        if (ENV === 'test' || ENV === 'development') {
          console.warn(execExtend, 'is not in library', components, element)
          console.warn('replacing with ', {})
        }
        element.extend = {}
      }
  }

  // assign context
  if (options.context && !root.context) root.context = options.context
  element.context = root.context

  // create EXTEND inheritance
  applyExtend(element, parent, options)

  if (Object.keys(options).length) {
    registry.defaultOptions = options
    if (options.ignoreChildExtend) delete options.ignoreChildExtend
  }

  // create and assign a KEY
  element.key = assignedKey

  // enable TRANSFORM in data
  if (!element.transform) element.transform = {}

  // enable CACHING
  if (!element.__cached) element.__cached = {}

  // enable EXEC
  if (!element.__exec) element.__exec = {}

  // enable CLASS CACHING
  if (!element.__class) element.__class = {}
  if (!element.__classNames) element.__classNames = {}

  // enable CLASS CACHING
  if (!element.__attr) element.__attr = {}

  // enable CHANGES storing
  if (!element.__changes) element.__changes = []

  // enable CHANGES storing
  if (!element.__children) element.__children = []

  // Add _root element property
  const hasRoot = parent.parent && parent.parent.key === ':root'
  if (!element.__root) element.__root = hasRoot ? parent : parent.__root

  // set the PATH array
  if (ENV === 'test' || ENV === 'development') {
    if (!parent.path) parent.path = []
    element.path = parent.path.concat(assignedKey)
  }

  // assign METHODS
  element.set = set
  element.update = update
  element.remove = remove
  element.removeContent = removeContentElement
  element.setProps = setProps
  element.lookup = lookup
  element.spotByPath = spotByPath
  element.parse = parse
  element.parseDeep = parseDeep
  element.keys = keys
  element.nextElement = nextElement
  element.previousElement = previousElement
  if (ENV === 'test' || ENV === 'development') {
    element.log = log
  }

  // enable STATE
  element.state = createState(element, parent)

  // don't render IF in condition
  if (isFunction(element.if)) {
    // TODO: move as fragment
    if (!element.if(element, element.state)) {
      const ifFragment = cacheNode({ tag: 'fragment' })
      element.__ifFragment = appendNode(ifFragment, parent.node)
      element.__ifFalsy = true
    }
  }

  // if it already HAS a NODE
  if (element.node && !element.__ifFalsy) { // TODO: check on if
    return assignNode(element, parent, assignedKey)
  }

  // apply props settings
  if (!element.__ifFalsy) createProps(element, parent)

  // run `on.init`
  if (element.on && isFunction(element.on.init)) {
    on.init(element.on.init, element, element.state)
  }

  // run `on.init`
  if (element.on && isFunction(element.on.beforeClassAssign)) {
    on.beforeClassAssign(element.on.beforeClassAssign, element, element.state)
  }

  // generate a CLASS name
  assignClass(element)

  // CREATE a real NODE
  createNode(element, options)

  if (element.__ifFalsy) return element

  // assign NODE
  assignNode(element, parent, key)

  // run `on.render`
  if (element.on && isFunction(element.on.render)) {
    on.render(element.on.render, element, element.state)
  }

  if (parent.__children) parent.__children.push(element.key)
  // console.groupEnd(element.key)

  return element
}

export const isKeyComponent = (key) => {
  const isFirstKeyString = isString(key)
  if(!isFirstKeyString) return

  const firstCharKey = key.slice(0, 1)

  return /^[A-Z]*$/.test(firstCharKey)
}

export default create
