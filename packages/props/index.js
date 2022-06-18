'use strict'

import { on } from '@domql/event'
import { deepMerge, exec, isArray } from '@domql/utils'

const initPropsStack = (element, parent) => {
  const propsStack = []

  if (element.props === 'inherit') {
    if (parent && parent.props) propsStack.push(parent.props)
  } else if (element.props === 'match') {
    if (parent && parent.props) propsStack.push(parent.props[element.key])
  } else if (element.props) propsStack.push(element.props)

  if (isArray(element.ref.__extend)) {
    element.ref.__extend.map(extendUnit => {
      if (extendUnit.props) propsStack.push(extendUnit.props)
      return extendUnit.props
    })
  }

  return propsStack
}

export const inheritProps = (element, parent) => {
  return (parent && parent.ref.props)
}

export const syncProps = (propsStack, element) => {
  const { ref } = element
  const mergedProps = {}
  propsStack.forEach(prop => {
    // to realtime sync props for lazy exec
    ref.props = deepMerge(mergedProps, exec(prop, element))
  })
  return mergedProps
}

export const createProps = function (element, parent, cache) {
  const { ref } = element
  if (!ref.props) ref.props = {}
  const propsStack = cache || initPropsStack(element, parent)

  if (propsStack.length) {
    ref.__props = propsStack
    return syncProps(propsStack, element)
  }

  return inheritProps(element, parent)
}

export const updateProps = (newProps, element, parent) => {
  const { ref } = element
  let propsStack = ref.__props

  if (newProps) propsStack = [].concat(newProps, propsStack)

  if (propsStack.length) {
    ref.__props = propsStack
    return syncProps(propsStack, element)
  }

  return inheritProps(element, parent)
}
