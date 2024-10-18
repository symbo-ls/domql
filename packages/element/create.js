'use strict'

import createNode from './node'
import { ROOT } from './tree'

import {
  HTML_TAGS,
  isObject,
  isFunction,
  isString,
  exec,
  is,
  isNode,
  isUndefined,
  generateKey,
  checkIfKeyIsComponent,
  deepCloneWithExtend,
  applyComponentFromContext,
  applyKeyComponentAsExtend,
  isVariant,
  detectInfiniteLoop,
  addChildrenIfNotInOriginal
} from '@domql/utils'

import { triggerEventOn } from '@domql/event'
import { assignNode } from '@domql/render'
import { createState } from '@domql/state'

import { isMethod } from './methods'
import { createProps } from './props'
import { applyExtend } from './extend'
import { registry } from './mixins'
import { addMethods } from './methods/set'
import { assignKeyAsClassname } from './mixins/classList'
import { throughInitialExec, throughInitialDefine } from './iterate'

import OPTIONS from './cache/options'

import {
  applyVariant,
  createValidDomqlObjectFromSugar
} from './utils/component'

const ENV = process.env.NODE_ENV

/**
 * Creating a domQL element using passed parameters
 */
const create = (element, parent, key, options = OPTIONS.create || {}, attachOptions) => {
  cacheOptions(element, options)

  // if element is STRING
  if (checkIfPrimitive(element)) {
    element = applyValueAsText(element, parent, key)
  }

  element = redefineElement(element, parent, key, options)
  parent = redefineParent(element, parent, key)
  key = createKey(element, parent, key)

  const ref = addRef(element, parent, key)

  ref.__initialProps = deepCloneWithExtend(element.props, [])

  applyContext(element, parent, options)

  applyComponentFromContext(element, parent, options)

  if (!ref.__skipCreate) {
    applyExtend(element, parent, options)
  }

  element.key = key

  if (options.onlyResolveExtends) {
    return onlyResolveExtends(element, parent, key, options)
  }

  switchDefaultOptions(element, parent, options)

  addCaching(element, parent)

  addMethods(element, parent)

  createScope(element, parent)

  createState(element, parent)
  if (element.scope === 'state') element.scope = element.state

  createIfConditionFlag(element, parent)

  // apply props settings
  createProps(element, parent)
  if (element.scope === 'props' || element.scope === true) element.scope = element.props

  // recatch if it passess props again
  createIfConditionFlag(element, parent)

  // if it already HAS a NODE
  if (element.node && ref.__if) {
    return assignNode(element, parent, key, attachOptions)
  }

  // apply variants
  applyVariant(element, parent)

  const onInit = triggerEventOn('init', element, options)
  if (onInit === false) return element

  triggerEventOn('beforeClassAssign', element, options)

  // generate a CLASS name
  assignKeyAsClassname(element)

  addChildrenIfNotInOriginal(element, parent, key)

  renderElement(element, parent, options, attachOptions)

  addElementIntoParentChildren(element, parent)

  triggerEventOn('complete', element, options)

  return element
}

const createBasedOnType = (element, parent, key, options) => {
  // if ELEMENT is not given
  if (element === undefined) {
    if (ENV === 'test' || ENV === 'development') {
      console.warn(key, 'element is undefined in', parent && parent.__ref && parent.__ref.path)
    }
    return {}
  }
  if (isString(key) && key.slice(0, 2 === '__')) {
    if (ENV === 'test' || ENV === 'development') {
      console.warn(key, 'seems like to be in __ref')
    }
  }
  if (element === null) return
  if (element === true) return { text: true }

  // if element is extend
  if (element.__hash) {
    return { extend: element }
  }

  return element
}

const redefineElement = (element, parent, key, options) => {
  const elementWrapper = createBasedOnType(element, parent, key, options)

  if (options.syntaxv3 || (element.props && element.props.syntaxv3) || (parent && parent.props && parent.props.syntaxv3) /* kalduna guard */) {
    if (element.props) element.props.syntaxv3 = true
    else element.syntaxv3 = true
    return createValidDomqlObjectFromSugar(element, parent, key, options)
  } else if (checkIfKeyIsComponent(key)) {
    return applyKeyComponentAsExtend(elementWrapper, parent, key)
  }

  // TODO: move as define plugins
  // Responsive rendering
  if (checkIfMedia(key)) {
    return applyMediaProps(elementWrapper, parent, key)
  }

  return elementWrapper
}

const redefineParent = (element, parent, key, options) => {
  if (!parent) return ROOT
  if (isNode(parent)) {
    const parentNodeWrapper = { key: ':root', node: parent }
    ROOT[`${key}_parent`] = parentNodeWrapper
    return parentNodeWrapper
  }
  return parent
}

const cacheOptions = (element, options) => {
  if (options && !OPTIONS.create) {
    OPTIONS.create = options
    OPTIONS.create.context = element.context || options.context
  }
}

const createKey = (element, parent, key) => {
  return (
    exec(key, element) ||
    key ||
    element.key ||
    generateKey()
  ).toString()
}

const addRef = (element, parent) => {
  if (element.__ref) element.__ref.origin = element
  else element.__ref = { origin: element }
  return element.__ref
}

const switchDefaultOptions = (element, parent, options) => {
  if (Object.keys(options).length) {
    registry.defaultOptions = options
    if (options.ignoreChildExtend) delete options.ignoreChildExtend
  }
}

const addElementIntoParentChildren = (element, parent) => {
  if (parent.__ref && parent.__ref.__children) parent.__ref.__children.push(element.key)
}

const visitedElements = new WeakMap()
const renderElement = (element, parent, options, attachOptions) => {
  if (visitedElements.has(element)) {
    if (ENV === 'test' || ENV === 'development') console.warn('Cyclic rendering detected:', element.__ref.path)
  }

  visitedElements.set(element, true)

  const { __ref: ref, key } = element

  // CREATE a real NODE
  try {
    const isInfiniteLoopDetected = detectInfiniteLoop(ref.path)
    if (ref.__uniqId || isInfiniteLoopDetected) return
    createNode(element, options)
    ref.__uniqId = Math.random()
  } catch (e) {
    if (ENV === 'test' || ENV === 'development') {
      const path = ref.path
      if (path.includes('ComponentsGrid')) path.splice(0, path.indexOf('ComponentsGrid') + 2)
      if (path.includes('demoComponent')) path.splice(0, path.indexOf('demoComponent') + 1)
      const isDemoComponent = element.lookup(el => el.state.key)?.state?.key
      console.warn('Error happened in:', isDemoComponent ? isDemoComponent + ' ' : '' + path.join('.'))
      console.warn(element)
      console.error(e)
    }
  }

  if (!ref.__if) {
    parent[key || element.key] = element
    return element
  }

  // assign NODE
  assignNode(element, parent, key, attachOptions)

  // run `on.renderRouter`
  triggerEventOn('renderRouter', element, options)

  // run `on.render`
  triggerEventOn('render', element, options)

  // run `on.done`
  triggerEventOn('done', element, options)

  // run `on.done`
  triggerEventOn('create', element, options)
}

const checkIfPrimitive = (element) => is(element)('string', 'number')

const applyValueAsText = (element, parent, key) => {
  const extendTag = element.extend && element.extend.tag
  const childExtendTag = parent.childExtend && parent.childExtend.tag
  const childPropsTag = parent.props.childProps && parent.props.childProps.tag
  const isKeyValidHTMLTag = ((HTML_TAGS.body.indexOf(key) > -1) && key)
  return {
    text: element,
    tag: extendTag || childExtendTag || childPropsTag || isKeyValidHTMLTag || 'string'
  }
}

const applyContext = (element, parent, options) => {
  const forcedOptionsContext = options.context && !ROOT.context && !element.context
  if (forcedOptionsContext) ROOT.context = options.context

  // inherit from parent or root
  if (!element.context) element.context = parent.context || options.context || ROOT.context
}

// Create scope - shared object across the elements to the own or the nearest parent
const createScope = (element, parent) => {
  const { __ref: ref } = element
  // If the element doesn't have a scope, initialize it using the parent's scope or the root's scope.
  if (!element.scope) element.scope = parent.scope || ref.root.scope || {}
}

const createIfConditionFlag = (element, parent) => {
  const { __ref: ref } = element

  if (isFunction(element.if) && !element.if(element, element.state, element.context)) {
    delete ref.__if
  } else ref.__if = true
}

const addCaching = (element, parent) => {
  const { __ref: ref, key } = element
  let { __ref: parentRef } = parent

  // enable TRANSFORM in data
  if (!element.transform) element.transform = {}

  // enable CACHING
  if (!ref.__cached) ref.__cached = {}
  if (!ref.__defineCache) ref.__defineCache = {}

  // enable EXEC
  if (!ref.__exec) ref.__exec = {}

  // enable CLASS CACHING
  if (!ref.__class) ref.__class = {}
  if (!ref.__classNames) ref.__classNames = {}

  // enable CLASS CACHING
  if (!ref.__attr) ref.__attr = {}

  // enable CHANGES storing
  if (!ref.__changes) ref.__changes = []

  // enable CHANGES storing
  if (!ref.__children) ref.__children = []

  if (checkIfKeyIsComponent(key)) ref.__componentKey = key.split('_')[0].split('.')[0].split('+')[0]

  // Add _root element property
  const hasRoot = parent && parent.key === ':root'
  if (!ref.root) ref.root = hasRoot ? element : parentRef.root

  // set the PATH array
  // if (ENV === 'test' || ENV === 'development') {
  if (!parentRef) parentRef = parent.ref = {}
  if (!parentRef.path) parentRef.path = []
  ref.path = parentRef.path.concat(element.key)
  // }
}

const onlyResolveExtends = (element, parent, key, options) => {
  const { __ref: ref } = element
  if (!ref.__skipCreate) {
    addCaching(element, parent)

    addMethods(element, parent)

    createScope(element, parent)

    createState(element, parent)
    if (element.scope === 'state') element.scope = element.state

    createIfConditionFlag(element, parent)

    // apply props settings
    createProps(element, parent)
    if (element.scope === 'props' || element.scope === true) element.scope = element.props

    if (element.node && ref.__if) { parent[key || element.key] = element } // Borrowed from assignNode()

    if (!element.props) element.props = {}
    applyVariant(element, parent)
  }

  if (element.tag !== 'string' && element.tag !== 'fragment') {
    throughInitialDefine(element)
    throughInitialExec(element)

    for (const k in element) {
      if (
        isUndefined(element[k]) ||
        isMethod(k, element) ||
        isObject(registry[k]) ||
        isVariant(k)
      ) continue

      const hasDefine = element.define && element.define[k]
      const contextHasDefine = element.context && element.context.define &&
            element.context.define[k]
      const optionsHasDefine = options.define && options.define[k]

      if (!ref.__skipCreate && registry[k] && !optionsHasDefine) {
        continue
      } else if (element[k] && !hasDefine && !optionsHasDefine && !contextHasDefine) {
        create(exec(element[k], element), element, k, options)
      }
    }
  }

  parent[key || element.key] = element // Borrowed from assignNode()

  delete element.update
  delete element.__element

  // added by createProps
  if (element.props) {
    delete element.props.update
    delete element.props.__element
  }

  return element
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
