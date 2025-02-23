'use strict'

import { addEventInOn } from './events.js'
import { exec } from './object.js'
import { is, isFunction, isObject, isObjectLike, isString } from './types.js'

export const IGNORE_PROPS_PARAMS = ['update', '__element']

export const createProps = (element, parent, key) => {
  const { props, __ref: ref } = element
  ref.__propsStack = []
  if (props) ref.__initialProps = props
  if (!isObjectLike(props)) {
    ref.__propsStack.push(props)
    return {}
  }
  return { ...props }
}

const propMappings = [
  'attr',
  'style',
  'text',
  'html',
  'content',
  'data',
  'class',
  'state',
  'scope',
  'deps',
  'extends',
  'children',
  'childExtends',
  'childExtendsRecursive',
  'props',
  'if',
  'define',
  '__name',
  '__ref',
  '__hash',
  '__text',
  'key',
  'tag',
  'query',
  'parent',
  'node',
  'variables',
  'keys',
  'log',
  'on',
  'component',
  'context'
]

/**
 * Reorganizes and normalizes properties of an element
 * @param {Object} element - The element to process
 * @param {Object} parent - The parent context
 * @returns {Object} - The processed element
 */
export function redefineProperties (element, opts = {}) {
  const cachedKeys = []

  for (const key in element) {
    const value = element[key]

    const hasDefine = isObject(element.define?.[key])
    const hasGlobalDefine = isObject(element.context?.define?.[key])
    const isElement = /^[A-Z]/.test(key) || /^\d+$/.test(key)
    const isBuiltin = propMappings.includes(key)

    if (isElement || isBuiltin || hasDefine || hasGlobalDefine) continue

    element.props[key] = value
    delete element[key]
    cachedKeys.push(key)
  }

  for (const key in element.props) {
    const value = element.props[key]

    const isEvent = key.startsWith('on') && key.length > 2
    const isFn = isFunction(value)

    if (isEvent && isFn) {
      addEventInOn(key, element)
      delete element.props[key]
      continue
    }

    if (cachedKeys.includes(key)) continue

    const hasDefine = isObject(element.define?.[key])
    const hasGlobalDefine = isObject(element.context?.define?.[key])
    const isComponent = /^[A-Z]/.test(key)
    const isSpreadedElement = /^\d+$/.test(key)
    const isPropMapping = propMappings.includes(key)
    if (
      isComponent ||
      isSpreadedElement ||
      isPropMapping ||
      hasDefine ||
      hasGlobalDefine
    ) {
      element[key] = value
      delete element.props[key]
      continue
    }
  }

  return element
}

const objectizeStringProperty = propValue => {
  if (is(propValue)('string', 'number')) {
    return { inheritedString: propValue }
  }
  return propValue
}

export const inheritParentProps = (element, parent) => {
  let propsStack = []
  const parentProps = exec(parent, parent.state).props

  const matchParent = parent.props && parentProps[element.key]
  const matchParentIsString = isString(matchParent)
  const matchParentChildProps = parentProps && parentProps.childProps

  if (matchParent) {
    if (matchParentIsString) {
      const inheritedStringExists = propsStack.filter(v => v.inheritedString)[0]
      if (inheritedStringExists) {
        inheritedStringExists.inheritedString = matchParent
      } else {
        propsStack = [].concat(objectizeStringProperty(matchParent), propsStack)
      }
    } else {
      propsStack.push(objectizeStringProperty(matchParent))
    }
  }

  if (matchParentChildProps && !element?.props?.ignoreChildProps) {
    propsStack.push(matchParentChildProps)
  }

  return propsStack
}
