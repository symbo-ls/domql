'use strict'

import { exec, isFunction } from '../utils'

export const applyDefined = (element, force) => {
  for (const param in element.define) {
    // if (!element[param]) element[param] = element.define[param](void 0, element)
    if (!element[param]) element[param] = element.define[param](undefined, element)
  }
}

export const applyEvents = element => {
  const { node, on } = element
  for (const param in on) {
    if (
      param === 'init' ||
      param === 'render' ||
      param === 'update'
    ) continue

    const appliedFunction = element.on[param]
    if (isFunction(appliedFunction)) {
      node.addEventListener(param, event =>
        appliedFunction(event, element, element.state),
      true)
    }
  }
}

export const throughDefine = (element) => {
  const { define } = element
  for (const param in define) {
    let prop = element[param]
    if (isFunction(prop)) {
      element.__exec[param] = prop
      prop = exec(prop, element)
    }
    element.__cached[param] = prop
    element[param] = define[param](prop, element, element.state)
  }
  return element
}

export const throughTransform = element => {
  const { transform } = element
  for (const param in transform) {
    let execParam = exec(element[param], element)
    if (element.__cached[param]) {
      execParam = exec(element.__cached[param], element)
    } else {
      execParam = exec(element[param], element)
      element.__cached[param] = execParam
    }
    element[param] = transform[param](execParam, element)
  }
}

export const throughRegisteredParams = element => {
}
