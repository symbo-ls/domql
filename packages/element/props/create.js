'use strict'

import { exec, isArray, isObject, deepClone, deepMerge } from '@domql/utils'
import { IGNORE_PROPS_PARAMS } from './ignore'

const createPropsStack = (element, parent) => {
  const { props, __ref } = element
  const propsStack = __ref.__props = inheritParentProps(element, parent)

  if (isObject(props)) propsStack.push(props)
  else if (props === 'inherit' && parent.props) propsStack.push(parent.props)
  else if (props) propsStack.push(props)

  if (isArray(__ref.__extend)) {
    __ref.__extend.forEach(extend => {
      if (extend.props) propsStack.push(extend.props)
    })
  }

  __ref.__props = propsStack

  return propsStack
}

export const syncProps = (props, element) => {
  element.props = {}
  const mergedProps = { update, __element: element }
  props.forEach(v => {
    if (IGNORE_PROPS_PARAMS.includes(v)) return
    const execProps = exec(v, element)
    if (isObject(execProps) && execProps.__element) return
    element.props = deepMerge(
      mergedProps,
      deepClone(execProps, IGNORE_PROPS_PARAMS),
      IGNORE_PROPS_PARAMS
    )
  })
  element.props = mergedProps
  return element.props
}

export const createProps = function (element, parent, cached) {
  const propsStack = cached || createPropsStack(element, parent)
  const { __ref } = element

  if (propsStack.length) {
    __ref.__props = propsStack
    syncProps(propsStack, element)
    element.props.update = update
  }

  return element
}