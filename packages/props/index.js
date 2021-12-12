'use strict'

import { deepClone, deepMerge, exec, isArray } from '@domql/utils'

const initProps = (element, parent) => {
  const propsStack = []
  if (element.props) propsStack.push(element.props)

  if (isArray(element.ref.__extendStack)) {
    element.ref.__extendStack.map(extendUnit => {
      if (extendUnit.props) propsStack.push(extendUnit.props)
      return extendUnit.props
    })
  }

  return propsStack
}

const inheritProps = (element, parent) => {
  element.ref.props = (parent && parent.ref.props)
}

export const syncProps = (props, element) => {
  element.ref.props = {}
  const mergedProps = {}
  props.forEach(v => {
    element.ref.props = deepMerge(mergedProps, exec(v, element))
  })
  element.ref.props = mergedProps
  return element.ref.props
}

export const createProps = function (element, parent, cached) {
  const propsStack = cached || initProps(element, parent)

  if (propsStack.length) {
    element.ref.__propsStack = propsStack
    syncProps(propsStack, element)
  } else inheritProps(element, parent)

  return element.ref.props || {}
}

export const updateProps = (newProps, element, parent) => {
  let propsStack = element.__props

  if (newProps) propsStack = element.__props = [].concat(newProps, propsStack)

  if (propsStack) syncProps(propsStack, element)
  else inheritProps(element, parent)

  return element
}

function update (props) {
  const element = this.__element
  // element.update({ props })
  element.update()
}
