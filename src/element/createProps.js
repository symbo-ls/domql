'use strict'

import { deepClone, deepMerge, exec } from '../utils'

export const cache = {
  props: []
}

const update = el => el.update()

export const syncProps = (props, element) => {
  element.props = {}
  const mergedProps = {}
  props.reverse().map(v => (
    element.props = deepMerge(mergedProps, deepClone(exec(v, element)))
  ))
  element.props = mergedProps
  console.log(element.props)
  return element.props
}

const createProps = function (element, parent, cached) {
  const cachedProps = cached || element.__props || cache.props

  if (element.props) cachedProps.push(element.props)

  if (cachedProps.length) {
    element.__props = cachedProps
    syncProps(cachedProps, element)
    element.props.update = update
  } else element.props = parent.props || { update }

  return element
}

window.createProps = createProps

export const updateProps = (newProps, element) => {
  const cachedProps = element.__props || cache.props
  if (element.props) {
    cachedProps.push(newProps)
    syncProps(cachedProps, element)
  } else if (newProps) {
    element.__props = [newProps]
    createProps(element, element.parent, element.__props)
  }
  return element
}

export default createProps
