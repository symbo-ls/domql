'use strict'

import { exec, isArray, isObject, deepClone, deepMerge } from '@domql/utils'
import { IGNORE_PROPS_PARAMS } from './ignore.js'

import { inheritParentProps } from './inherit.js'

const createPropsStack = (element, parent) => {
  const { props, __ref: ref } = element
  const propsStack = (ref.__props = inheritParentProps(element, parent))

  if (isObject(props)) propsStack.push(props)
  else if (props === 'inherit' && parent.props) propsStack.push(parent.props)
  else if (props) propsStack.push(props)

  if (isArray(ref.__extend)) {
    ref.__extend.forEach((extend) => {
      if (extend.props && extend.props !== props) propsStack.push(extend.props)
    })
  }

  ref.__props = propsStack

  return propsStack
}

export const syncProps = (props, element, opts) => {
  element.props = {}
  const mergedProps = {}

  props.forEach((v) => {
    if (IGNORE_PROPS_PARAMS.includes(v)) return
    let execProps
    try {
      execProps = exec(v, element, element.state, element.context, opts)
    } catch (e) {
      element.error(e, opts)
    }
    // TODO: check if this failing the function props merge
    // if (isObject(execProps) && execProps.__element) return
    // it was causing infinite loop at early days
    element.props = deepMerge(
      mergedProps,
      deepClone(execProps, { ignore: IGNORE_PROPS_PARAMS }),
      IGNORE_PROPS_PARAMS
    )
  })
  element.props = mergedProps

  const methods = {
    update: update.bind(element.props),
    __element: element
  }
  Object.setPrototypeOf(element.props, methods)

  return element.props
}

export const createProps = function (element, parent, options) {
  const { __ref: ref } = element

  const applyProps = () => {
    const propsStack = options.cachedProps || createPropsStack(element, parent)
    if (propsStack.length) {
      ref.__props = propsStack
      syncProps(propsStack, element, options)
    } else {
      ref.__props = options.cachedProps || []
      element.props = {}
    }
  }

  if (ref.__if) applyProps()
  else {
    try {
      applyProps()
    } catch (e) {
      element.props = {}
      ref.__props = options.cachedProps || []
      element.error('Error applying props', e, options)
    }
  }

  const methods = { update: update.bind(element.props), __element: element }
  Object.setPrototypeOf(element.props, methods)

  return element
}

async function update(props, options) {
  const element = this.__element
  await element.update({ props }, options)
}
