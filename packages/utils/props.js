'use strict'

import { DOMQ_PROPERTIES, PROPS_METHODS } from './keys.js'
import { addEventFromProps } from './events.js'
import { deepClone, deepMerge, exec } from './object.js'
import { is, isArray, isFunction, isObject, isObjectLike } from './types.js'

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

  if (!parentProps) return propsStack

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

export function update (props, options) {
  const element = this.__element
  element.update({ props }, options)
}

export function setPropsPrototype (element) {
  const methods = { update: update.bind(element.props), __element: element }
  Object.setPrototypeOf(element.props, methods)
}

export const syncProps = (props, element, opts) => {
  element.props = {}
  const mergedProps = {}

  props.forEach(v => {
    if (PROPS_METHODS.includes(v)) return
    const execProps = exec(v, element)
    // let execProps
    // try {
    // execProps = exec(v, element)
    // } catch (e) { element.error(e, opts) }
    // TODO: check if this failing the function props merge
    // if (isObject(execProps) && execProps.__element) return
    // it was causing infinite loop at early days
    element.props = deepMerge(
      mergedProps,
      deepClone(execProps, { exclude: PROPS_METHODS }),
      PROPS_METHODS
    )
  })

  element.props = mergedProps

  setPropsPrototype(element)

  return element.props
}

export const createPropsStack = (element, parent) => {
  const { props, __ref: ref } = element
  const propsStack = (ref.__props = inheritParentProps(element, parent))

  if (isObject(props)) propsStack.push(props)
  else if (props === 'inherit' && parent.props) propsStack.push(parent.props)
  else if (props) propsStack.push(props)

  if (isArray(ref.__extendsStack)) {
    ref.__extendsStack.forEach(_extends => {
      if (_extends.props && _extends.props !== props) {
        propsStack.push(_extends.props)
      }
    })
  }

  ref.__props = propsStack

  return propsStack
}

export const initProps = function (element, parent, options) {
  const { __ref: ref } = element

  const applyProps = () => {
    const propsStack = options.cachedProps || createPropsStack(element, parent)
    if (propsStack.length) {
      ref.__props = propsStack
      syncProps(propsStack, element)
    } else {
      ref.__props = options.cachedProps || []
      element.props = {}
    }
  }

  if (ref.__if) applyProps()
  else {
    try {
      applyProps()
    } catch {
      element.props = {}
      ref.__props = options.cachedProps || []
    }
  }

  setPropsPrototype(element)

  return element
}

export const updateProps = (newProps, element, parent) => {
  const { __ref } = element
  let propsStack = __ref.__props

  const parentProps = inheritParentProps(element, parent)
  if (parentProps.length) {
    propsStack = __ref.__props = [].concat(parentProps, propsStack)
  }
  if (newProps) propsStack = __ref.__props = [].concat(newProps, propsStack)

  if (propsStack) {
    syncProps(propsStack, element)
    setPropsPrototype(element)
  }

  return element
}
