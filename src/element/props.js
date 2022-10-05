'use strict'

import { deepClone, deepMerge, exec, isArray, isObject, isString } from '../utils'

const initProps = (element, parent) => {
  const { props } = element
  const propsStack = []

  const isMatch = isString(props) && props.indexOf('match') > -1
  const matchParent = parent.props && parent.props[element.key]
  const matchParentChild = parent.props && parent.props.childProps

  const objectizeStringProperty = propValue => {
    if (isString(propValue)) return { inheritedString: propValue }
    return propValue
  }

  if (isObject(props)) {
    propsStack.push(props)
  }

  if (matchParent && props !== 'match') propsStack.push(matchParent)
  if (matchParentChild) propsStack.push(matchParentChild)

  if (props === 'inherit') {
    if (parent.props) propsStack.push(parent.props)
  } else if (isMatch) {
    const hasArg = props.split(' ')
    let matchParentValue
    //console.log('hasArg', hasArg)
    if (hasArg[1] && parent.props[hasArg[1]]) {
      const secondArgasParentMatchProp = parent.props[hasArg[1]]
      propsStack.push(
        objectizeStringProperty(secondArgasParentMatchProp)
      )
    } else if (matchParent) {
      propsStack.push(
        objectizeStringProperty(matchParent)
      )
    }
    propsStack.push(matchParentValue)
  } else if (props) propsStack.push(props)

  if (isArray(element.__extend)) {
    element.__extend.map(extend => {
      if (extend.props) propsStack.push(extend.props)
      return extend.props
    })
  }

  return propsStack
}

const inheritProps = (element, parent) => {
  element.props = (parent && parent.props) || { update, __element: element }
}

export const syncProps = (props, element) => {
  element.props = {}
  const mergedProps = { update, __element: element }
  props.forEach(v => {
    if (v === 'update' || v === '__element') return
    element.props = deepMerge(mergedProps, deepClone(exec(v, element)))
  })
  element.props = mergedProps
  return element.props
}

const createProps = function (element, parent, cached) {
  const propsStack = cached || initProps(element, parent)

  if (propsStack.length) {
    element.__props = propsStack
    syncProps(propsStack, element)
    element.props.update = update
  } else inheritProps(element, parent)

  return element
}

export const updateProps = (newProps, element, parent) => {
  let propsStack = element.__props

  if (newProps) propsStack = element.__props = [].concat(newProps, propsStack)

  if (propsStack) syncProps(propsStack, element)
  else inheritProps(element, parent)

  // console.log(cachedProps)
  return element
}

function update (props, options) {
  const element = this.__element
  // element.update({ props })
  element.update({ props }, options)
}

export default createProps
