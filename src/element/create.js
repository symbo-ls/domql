'use strict'

import { isObject, isFunction, isString, createID, isNode, exec, is } from '@domql/utils'
import { TAGS } from '@domql/registry'
import { triggerEventOn } from '@domql/event'

import root from './root'
import createNode from './node'
import { appendNode, assignNode } from './assign'
import { applyExtend } from './extend'
import set, { removeContentElement } from './set'
import createState from './state'
import createProps from './props'
import update from './update'
import { assignClass } from './mixins/classList'
import { remove, lookup, setProps, log, keys, parse, parseDeep, spotByPath, nextElement, previousElement, isMethod } from './methods'
import cacheNode, { detectTag } from './cache'
import { registry } from './mixins'
import { throughInitialExec } from './iterate'
import OPTIONS from './options'
// import { overwrite, clone, fillTheRest } from '../utils'

const ENV = process.env.NODE_ENV

/**
 * Creating a domQL element using passed parameters
 */
const create = (element, parent, key, options = OPTIONS.create || {}) => {
  if (options && !OPTIONS.create) OPTIONS.create = options

  // console.log(element, parent)

  // if ELEMENT is not given
  if (element === undefined) {
    if (ENV === 'test' || ENV === 'development') {
      console.warn(key, 'element is undefined in', parent && parent.__ref && parent.__ref.path)
    }
    element = {}
  }
  if (isString(key) && key.slice(0, 2 === '__')) {
    if (ENV === 'test' || ENV === 'development') {
      console.warn(key, 'seems like to be in __ref')
    }
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
  if (checkIfPrimitive(element)) {
    element = applyValueAsText(element, parent, key)
  }

  // define KEY
  const assignedKey = (element.key || key || createID()).toString()

  if (checkIfKeyIsComponent(assignedKey)) {
    element = applyKeyComponentAsExtend(element, parent, assignedKey)
  }

  // Responsive rendering
  // TODO: move as define plugin
  if (checkIfMedia(assignedKey)) {
    element = applyMediaProps(element, parent, assignedKey)
  }

  if (element.__ref) element.__ref.origin = element
  else element.__ref = { origin: element } // eslint-disable-line 
  const __ref = element.__ref

  // assign context
  applyContext(element, parent, options)
  const { context } = element

  if (context && context.components) applyComponentFromContext(element, parent, options)

  // create EXTEND inheritance
  applyExtend(element, parent, options)

  // create and assign a KEY
  element.key = assignedKey

  // Only resolve extends, skip everything else
  if (options.onlyResolveExtends) return resolveExtends(element, parent, options)

  if (Object.keys(options).length) {
    registry.defaultOptions = options
    if (options.ignoreChildExtend) delete options.ignoreChildExtend
  }

  addCaching(element, parent)

  addMethods(element, parent)

  // enable STATE
  element.state = createState(element, parent)

  // don't render IF in condition
  checkIf(element, parent)

  // if it already HAS a NODE
  if (element.node && __ref.__if) { // TODO: check on if
    return assignNode(element, parent, assignedKey)
  }

  // apply props settings
  if (__ref.__if) createProps(element, parent)

  // run `on.init`
  triggerEventOn('init', element)

  // run `on.beforeClassAssign`
  triggerEventOn('beforeClassAssign', element)

  // generate a CLASS name
  assignClass(element)

  // CREATE a real NODE
  createNode(element, options)

  if (!__ref.__if) return element

  // assign NODE
  assignNode(element, parent, key)

  // run `on.renderRouter`
  triggerEventOn('renderRouter', element)

  // run `on.render`
  triggerEventOn('render', element)

  if (parent.__ref && parent.__ref.__children) parent.__ref.__children.push(element.key)
  // console.groupEnd(element.key)

  return element
}

const checkIfPrimitive = (element) => {
  return is(element)('string', 'number')
}

const applyValueAsText = (element, parent, key) => {
  const extendTag = element.extend && element.extend.tag
  const childExtendTag = parent.childExtend && parent.childExtend.tag
  const isKeyValidHTMLTag = ((TAGS.body.indexOf(key) > -1) && key)
  return {
    text: element,
    tag: extendTag || childExtendTag || isKeyValidHTMLTag || 'string'
  }
}

const addMethods = (element, parent) => {
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
}

const applyContext = (element, parent, options) => {
  if (options.context && !root.context && !element.context) root.context = options.context
  if (!element.context) element.context = parent.context || options.context || root.context
}

const checkIf = (element, parent) => {
  const { __ref } = element

  if (isFunction(element.if)) {
    // TODO: move as fragment
    const ifPassed = element.if(element, element.state)
    if (!ifPassed) {
      const ifFragment = cacheNode({ tag: 'fragment' })
      __ref.__ifFragment = appendNode(ifFragment, parent.node)
      delete __ref.__if
    } else __ref.__if = true
  } else __ref.__if = true
}

const addCaching = (element, parent) => {
  const { __ref } = element
  let { __ref: __parentRef } = parent

  // enable TRANSFORM in data
  if (!element.transform) element.transform = {}

  // enable CACHING
  if (!__ref.__cached) __ref.__cached = {}

  // enable EXEC
  if (!__ref.__exec) __ref.__exec = {}

  // enable CLASS CACHING
  if (!__ref.__class) __ref.__class = {}
  if (!__ref.__classNames) __ref.__classNames = {}

  // enable CLASS CACHING
  if (!__ref.__attr) __ref.__attr = {}

  // enable CHANGES storing
  if (!__ref.__changes) __ref.__changes = []

  // enable CHANGES storing
  if (!__ref.__children) __ref.__children = []

  // Add _root element property
  const hasRoot = parent && parent.key === ':root'
  if (!__ref.__root) __ref.__root = hasRoot ? element : parent.__ref.__root

  // set the PATH array
  if (ENV === 'test' || ENV === 'development') {
    if (!__parentRef) __parentRef = parent.__ref = {}
    if (!__parentRef.__path) __parentRef.__path = []
    __ref.__path = __parentRef.__path.concat(element.key)
  }
}

const resolveExtends = (element, parent, options) => {
  const { __ref } = element
  element.tag = detectTag(element)

  if (!__ref.__exec) __ref.__exec = {}
  if (!__ref.__attr) __ref.__attr = {}

  element.props = {}
  element.state = {}

  createProps(element, parent)
  createState(element, parent, { skip: true })

  throughInitialExec(element)

  for (const param in element) {
    const prop = element[param]
    if (isMethod(param) || isObject(registry[param]) || prop === undefined) continue

    const hasDefined = element.define && element.define[param]
    const ourParam = registry[param]
    const hasOptionsDefine = options.define && options.define[param]
    if (ourParam && !hasOptionsDefine) continue
    else if (element[param] && !hasDefined && !hasOptionsDefine) {
      create(exec(prop, element), element, param, options)
    }
  }

  delete element.parent
  delete element.update
  delete element.__element

  // added by createProps
  delete element.props.update
  delete element.props.__element

  // added by createState
  delete element.state.__element
  delete element.state.__element
  delete element.__hasRootState // TODO: check with @Nikaoto and remove
  delete element.__ref

  return element
}

const checkIfKeyIsComponent = (key) => {
  const isFirstKeyString = isString(key)
  if (!isFirstKeyString) return

  const firstCharKey = key.slice(0, 1)

  return /^[A-Z]*$/.test(firstCharKey)
}

const extendizeByKey = (element, parent, key) => {
  const { extend, props, state, childExtend, childProps } = element
  const hasComponentAttrs = extend || childExtend || props || state || element.on
  const componentKey = key.split('_')[0]

  if (!hasComponentAttrs || childProps) {
    return {
      extend: componentKey || key,
      props: { ...element }
    }
  } else if (!extend || extend === true) {
    return {
      ...element,
      extend: componentKey || key
    }
  }
}

const applyKeyComponentAsExtend = (element, parent, key) => {
  return extendizeByKey(element, parent, key) || element
}

const applyComponentFromContext = (element, parent, options) => {
  const { context } = element
  const { components } = context
  const { extend } = element
  const execExtend = exec(extend, element)
  if (isString(execExtend)) {
    if (components[execExtend]) element.extend = components[execExtend]
    else {
      if ((ENV === 'test' || ENV === 'development') && options.verbose) {
        console.warn(execExtend, 'is not in library', components, element)
        console.warn('replacing with ', {})
      }
      element.extend = {}
    }
  }
}

const checkIfMedia = (key) => key.slice(0, 1) === '@'

const applyMediaProps = (element, parent, key) => {
  const { props } = element
  if (props) {
    props.display = 'none'
    if (props[key]) props[key].display = props.display
    else props[key] = { display: props.display || 'block' }
    return element
  } else {
    return {
      ...element,
      props: {
        display: 'none',
        [key]: { display: 'block' }
      }
    }
  }
}

export default create
