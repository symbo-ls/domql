'use strict'

import { DEFAULT_METHODS, TAGS } from '@domql/registry'

import { root } from '@domql/tree'
import { createKey } from '@domql/key'
import { isNumber, isString, isObject, isNode, isFunction, isArray, exec } from '@domql/utils'
import { createState } from '@domql/state'
import { createProps } from '@domql/props'
import { extendElement } from '@domql/extends'

const OPTIONS = {}

const init = (element, key, options, parent) => {
  const ref = {}
  if (!element) return { ref }
  // if null remove

  if (isString(element) || isNumber(element)) {
    return {
      key,
      ref,
      tag: 'string',
      text: element
    }
  } else if (isArray(element)) return Object.assign({}, element)
  else if (isObject(element)) {
    const { extendLibrary } = options
    const extendFromLibrary = isString(element.extends) && extendLibrary[element.extends]
    if (extendFromLibrary && extendLibrary) {
      element = {
        props: element,
        ref,
        extends: extendFromLibrary
      }
    }
    if (!element.ref) element.ref = ref
    if (element.on && element.on.init) element.on.init(element, element.state)
    return element
  } else if (isFunction(element)) return ({ ref, ...exec(parent, parent.ref.state) })
  return element
}

const assignKey = (element, key) => {
  if (element.key) return element
  element.key = key || createKey.next().value
  return element
}

const applyParent = (element, key) => {
  const { ref } = element
  const { parent } = ref
  if (isNode(parent)) {
    ref.parent = root.ref.parent = { node: parent }
  }
  if (!parent) ref.parent = root
  return element
}

const applyState = (element, key) => {
  const { ref } = element
  ref.state = createState(element, element.ref.parent)
  return element
}

const applyExtends = (element, key, options) => {
  extendElement(element, element.ref.parent, options)
  return element
}

const applyTag = (element, key) => {
  if (element.tag) {
    element.ref.tag = element.tag
    return element
  }
  const keyIsTag = TAGS.body.indexOf(key) > -1
  element.tag = element.ref.tag = keyIsTag ? key : 'div'
  return element
}

const applyProps = (element, key) => {
  const { ref } = element
  ref.props = createProps(element, ref.parent)
  return element
}

const applyAttr = (element, key) => {
  if (!isObject(element.attr)) return element
  const { ref } = element
  if (!ref.attr) ref.attr = {}
  for (const attrKey in element.attr) {
    ref.attr[attrKey] = exec(element.attr[attrKey], element, element.state)
  }
  return element
}

const onEachAvailable = (element, key, options) => {
  const { ref } = element
  const value = element[key]
  let { children, childrenKeys } = ref
  if (!children) children = ref.children = []
  if (!childrenKeys) childrenKeys = ref.childrenKeys = []

  // move value to ref.children
  children.push(value)
  childrenKeys.push(key)

  // apply global options
  const useOption = options[onEachAvailable]
  if (useOption) useOption(element, key)
}

export const onEach = (element, key, options) => {
  for (const key in element) {
    const isMethod = DEFAULT_METHODS[key]
    if (isMethod && isFunction(isMethod)) isMethod(element, element.ref.state)
    const hasDefine = element.define && element.define[key]
    if (hasDefine && isFunction(hasDefine)) element.ref[key] = hasDefine(element, element.ref.state)
    if (!isMethod && !hasDefine) onEachAvailable(element, key, options)
  }
  return element
}

export const applyTransform = (element, key, options) => {
  const { ref, transform } = element
  if (!transform) return element
  if (!ref.transform) ref.transform = {}
  const keys = Object.keys(transform || {})
  keys.map(key => {
    const transformer = transform[key]
    ref.transform[key] = transformer(element, key)
    return key
  })
  return element
}

const addChildren = (element, key, options) => {
  const { ref } = element
  const { children, childrenKeys } = ref

  if (children && children.length) {
    ref.children = children.map((child, key) => {
      return create(child, element, childrenKeys[key], options)
    })
  }

  return element
}

const applyGlobalTransform = (element, key, options) => {
  const { ref } = element
  const { transform } = options
  if (!transform) return element
  if (!ref.transform) ref.transform = {}
  const keys = Object.keys(transform || {})
  keys.map(key => {
    const transformer = transform[key]
    ref.transform[key] = transformer(element, key)
    return key
  })
  return element
}

/**
 * Creating a DOMQL element
 */
export const create = (element, parent, key, options = OPTIONS) => [
  init,
  assignKey,
  applyParent,
  applyState,
  applyExtends,
  applyTag,
  applyProps,
  applyAttr,
  onEach,
  applyTransform,
  addChildren,
  applyGlobalTransform
].reduce((prev, current) => current(prev, key, options, parent), element)
