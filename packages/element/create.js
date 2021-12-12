'use strict'

import { root } from '@domql/tree'
import { createId } from '@domql/id'
import { isNumber, isString, isObject, isNode, isFunction, isArray, exec } from '@domql/utils'
import { DEFAULT_METHODS, TAGS } from '@domql/registry'
import { createState } from '@domql/state'
import { createProps } from '@domql/props'

const OPTIONS = {}

const init = (element, key, options, parent) => {
  const ref = {}
  if (isString(element) || isNumber(element)) return {
    key,
    ref,
    text: element
  }
  else if (isArray(element)) return Object.assign({}, element)
  else if (isObject(element)) {
    if (!element.ref) element.ref = ref
    if (element.on && element.on.init) element.on.init(element, element.state)
    return element
  }
  else if (isFunction(element)) return exec(parent, parent.ref.state)
  else if (!element) return { ref }
  return element
}

const assignKey = (element, key) => {
  if (element.key) return element
  element.key = key || createId.next().value
  return element
}

const applyTag = (element, key) => {
  if (element.tag) return element
  const keyIsTag = TAGS.body.indexOf(key) > -1
  element.tag = element.ref.tag = keyIsTag ? key : 'div'
  return element
}

const applyParent = (element, key) => {
  const { ref } = element
  const { parent } = ref
  if (isNode(parent)) {
    ref.parent = root.ref[`parent`] = { node: parent }
  }
  if (!parent) ref.parent = root
  return element
}

const applyState = (element, key) => {
  const { ref, state } = element
  ref.state = createState(element, element.ref.parent)
  return element
}

const applyExtends = (element, key) => {
  return element
}

const applyProps = (element, key) => {
  const { ref, props } = element
  ref.props = createProps(element, element.ref.parent)
  return element
}

const onEachAvailable = (element, key, options) => {
  const { ref } = element
  const value = element[key]
  let { children, childrenKeys } = ref
  if (!children) children = ref.children = []
  if (!childrenKeys) childrenKeys = ref.childrenKeys = []

  // add to ref.children
  const useOption = options[onEachAvailable]
  if (useOption) useOption(element, key)

  // move value to ref.children
  children.push(value)
  childrenKeys.push(key)
}

const onEach = (element, key, options) => {
  for (const key in element) {
    const isMethod = DEFAULT_METHODS[key]
    if (isMethod && isFunction(isMethod)) isMethod(element, element.state)
    if (!isMethod) onEachAvailable(element, key, options)
  }
  return element
}

const applyTransform = (element, key, options) => {
  const { ref, transform } = element
  if (!ref.transform) ref.transform = {}
  if (!transform) return element
  const keys = Object.keys(transform || {})
  keys.map(key => {
    const transformer = transform[key]
    ref.transform[key] = transformer(element, key)
  })
  return element
}

const applyChildren = (element, key, options) => {
  const { ref } = element
  const { children } = ref

  if (children && children.length)
    children.map(child => create(child, element, key, options))

  return element
}

const applyGlobalTransform = (element, key, options) => {
  const { ref } = element
  const { transform } = options
  const keys = Object.keys(transform || {})
  keys.map(key => {
    const transformer = transform[key]
    ref.transform[key] = transformer(element, key)
  })
  return element
}

/**
 * Creating a DOMQL element
 */
export const create = (element, parent, key, options = OPTIONS) => [
  init,
  assignKey,
  applyTag,
  applyParent,
  applyState,
  applyExtends,
  applyProps,
  onEach,
  applyTransform,
  applyChildren,
  applyGlobalTransform
].reduce((prev, current) => current(prev, key, options, parent), element)

// create({
//   test: {
//     test2: {}
//   }
// }, null, null, {
//   transform: {
//     react: transformReact
//   }
// })