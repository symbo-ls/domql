'use strict'

import { deepClone, deepMerge, exec, isArray } from '../utils'

export const cache = {
  props: []
}

export const syncProps = (props, element) => {
  element.props = {}
  const mergedProps = {}
  props.forEach(v => {
    if (v === 'update') return
    return deepMerge(mergedProps, deepClone(exec(v, element)))
  })
  element.props = mergedProps
  return element.props
}

const createProps = function (element, parent, cached) {
  const cachedProps = [] // || element.__props

  if (element.props) cachedProps.push(element.props)

  // collect props from protos
  if (isArray(element.__proto)) {
    element.__proto.map(proto => {
      if (proto.props) cachedProps.push(proto.props)
      return proto.props
    })
  }

  if (cachedProps.length) {
    element.__props = cachedProps
    syncProps(cachedProps, element)
    element.props.update = update
  } else element.props = parent.props || { update }

  return element
}

export const updateProps = (newProps, element) => {
  const cachedProps = element.__props || cache.props
  if (element.props) {
    cachedProps.push(newProps)
    syncProps(cachedProps, element)
  } else if (newProps) {
    if (cachedProps) cachedProps.push(newProps) // [newProps]
    createProps(element, element.parent, cachedProps)
  }
  // console.log(cachedProps)
  return element
}

export default createProps

function update (props) {
  const element = this
  element.update({ props })
}
