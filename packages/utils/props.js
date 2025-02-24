'use strict'

import { addEventFromProps } from './events.js'
import { DOMQ_PROPERTIES } from './keys.js'
import { is, isFunction, isObject, isObjectLike } from './types.js'

export const IGNORE_PROPS_PARAMS = ['update', '__element']

export const createProps = (element, parent, key) => {
  const { props, __ref: ref } = element
  ref.__propsStack = []
  // if (props !== undefined) ref.__initialProps = props
  if (props) ref.__initialProps = props
  else return {}
  if (!isObjectLike(props)) {
    ref.__propsStack.push(props)
    return {}
  }
  return { ...props }
}

export function pickupPropsFromElement (element, opts = {}) {
  const cachedKeys = opts.cachedKeys || []

  for (const key in element) {
    const value = element[key]

    const hasDefine = isObject(element.define?.[key])
    const hasGlobalDefine = isObject(element.context?.define?.[key])
    const isElement = /^[A-Z]/.test(key) || /^\d+$/.test(key)
    const isBuiltin = DOMQ_PROPERTIES.includes(key)

    // If it's not a special case, move to props
    if (!isElement && !isBuiltin && !hasDefine && !hasGlobalDefine) {
      element.props[key] = value
      delete element[key]
      cachedKeys.push(key)
    }
  }

  return element
}

export function pickupElementFromProps (element, opts) {
  const cachedKeys = opts.cachedKeys || []

  for (const key in element.props) {
    const value = element.props[key]

    // Handle event handlers
    const isEvent = key.startsWith('on') && key.length > 2
    const isFn = isFunction(value)

    if (isEvent && isFn) {
      addEventFromProps(key, element)
      delete element.props[key]
      continue
    }

    // Skip if key was originally from element
    if (cachedKeys.includes(key)) continue

    const hasDefine = isObject(element.define?.[key])
    const hasGlobalDefine = isObject(element.context?.define?.[key])
    const isElement = /^[A-Z]/.test(key) || /^\d+$/.test(key)
    const isBuiltin = DOMQ_PROPERTIES.includes(key)

    // Move qualifying properties back to element root
    if (isElement || isBuiltin || hasDefine || hasGlobalDefine) {
      element[key] = value
      delete element.props[key]
    }
  }

  return element
}

// Helper function to maintain compatibility with original propertizeElement
export function propertizeElement (element, opts = {}) {
  const cachedKeys = []
  pickupPropsFromElement(element, { cachedKeys })
  pickupElementFromProps(element, { cachedKeys })
  return element
}

export const objectizeStringProperty = propValue => {
  if (is(propValue)('string', 'number')) {
    return { inheritedString: propValue }
  }
  return propValue
}

export const inheritParentProps = (element, parent) => {
  const { __ref: ref } = element
  const propsStack = ref.__propsStack
  const parentProps = parent.props
  const matchParentKeyProps = parentProps[element.key]
  const matchParentChildProps = parentProps.childProps

  const ignoreChildProps = element.props
  if (matchParentChildProps && !ignoreChildProps) {
    propsStack.push(objectizeStringProperty(matchParentChildProps))
  }

  if (matchParentKeyProps) {
    propsStack.unshift(objectizeStringProperty(matchParentKeyProps))
  }

  return propsStack
}
