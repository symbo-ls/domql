'use strict'

import { addEventInOn } from './events.js'
import { isFunction, isObject } from './types.js'

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
export function redefineProperties (element) {
  if (!element.props) element.props = {}
  if (!element.on) element.on = {}
  const cachedKeys = []

  for (const key in element) {
    const value = element[key]

    const hasDefine = isObject(element.define?.[key])
    const hasGlobalDefine = isObject(element.context?.define?.[key])
    const isElement = /^[A-Z]/.test(key) || /^\d+$/.test(key)
    const isPropMapping = propMappings.includes(key)

    if (!isElement && !isPropMapping && !hasDefine && !hasGlobalDefine) {
      element.props[key] = value
      delete element[key]
      cachedKeys.push(key)
      continue
    }
  }

  for (const key in element.props) {
    const value = element.props[key]

    const isEvent = key.startsWith('on')
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
