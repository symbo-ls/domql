'use strict'

import {
  exec,
  isArray,
  isObject,
  deepClone,
  deepMerge,
  inheritParentProps,
  PROPS_METHODS
} from '@domql/utils'

const createPropsStack = (element, parent) => {
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
      deepClone(execProps, { ignore: PROPS_METHODS }),
      PROPS_METHODS
    )
  })
  element.props = mergedProps

  const methods = { update: update.bind(element.props), __element: element }
  Object.setPrototypeOf(element.props, methods)

  return element.props
}

export const createProps = function (element, parent, options) {
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

  const methods = { update: update.bind(element.props), __element: element }
  Object.setPrototypeOf(element.props, methods)

  return element
}

function update (props, options) {
  const element = this.__element
  element.update({ props }, options)
}
