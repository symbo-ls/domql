'use strict'

import { exec, isArray, isObject, deepClone, deepMerge } from '@domql/utils'
import { IGNORE_PROPS_PARAMS } from './ignore'

import { inheritParentProps } from './inherit'

const createPropsStack = (element, parent) => {
  const { props, __ref } = element
  const propsStack = __ref.__props = inheritParentProps(element, parent)

  if (isObject(props)) propsStack.push(props)
  else if (props === 'inherit' && parent.props) propsStack.push(parent.props)
  else if (props) propsStack.push(props)

  if (isArray(__ref.__extend)) {
    __ref.__extend.forEach(extend => {
      if (extend.props && extend.props !== props) propsStack.push(extend.props)
    })
  }

  __ref.__props = propsStack

  return propsStack
}

export const syncProps = (props, element) => {
  element.props = {}
  const mergedProps = {}

  props.forEach(v => {
    if (IGNORE_PROPS_PARAMS.includes(v)) return
    const execProps = exec(v, element)
    // TODO: check if this failing the function props merge
    // if (isObject(execProps) && execProps.__element) return
    // it was causing infinite loop at early days
    element.props = deepMerge(
      mergedProps,
      deepClone(execProps, IGNORE_PROPS_PARAMS),
      IGNORE_PROPS_PARAMS
    )
  })
  element.props = mergedProps

  const methods = { update: update.bind(element.props), __element: element }
  Object.setPrototypeOf(element.props, methods)

  return element.props
}

export const createProps = function (element, parent, cached) {
  const { __ref: ref } = element

  // if (element.parent.key === '0' && element.key === 'editor') {
  //   debugger
  // }

  const applyProps = () => {
    const propsStack = cached || createPropsStack(element, parent)
    if (propsStack.length) {
      ref.__props = propsStack
      syncProps(propsStack, element)
    } else {
      ref.__props = cached || []
      element.props = {}
    }
  }

  if (ref.__if) applyProps()
  else {
    try {
      applyProps()
    } catch {
      element.props = {}
      ref.__props = cached || []
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
