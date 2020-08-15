'use strict'

import { exec } from '../utils'
import * as on from '../event/on'

export const applyDefined = element => {
  for (const param in element.define) {
    if (!element[param]) element[param] = element.define[param](void 0, element)
  }
}

export const applyEvents = element => {
  for (const param in element.on) {
    if (param === 'init' || param === 'render') continue
    var appliedFunction = element.on[param]
    var registeredFunction = on[param]
    // console.log(param, appliedFunction, registeredFunction)
    if (typeof appliedFunction === 'function' &&
        typeof registeredFunction === 'function') {
      registeredFunction(appliedFunction, element, element.node)
    }

    // var definedFunction = element.define && element.define[param]
    // else console.error('Not such function', appliedFunction, registeredFunction)
    // if (typeof appliedFunction === 'function' && typeof definedFunction === 'function') definedFunction(appliedFunction, element)
  }
}

export const throughDefine = (element) => {
  var { define } = element
  for (const param in define) {
    var execParam = exec(element[param], element)
    element.data[param] = execParam
    element[param] = define[param](execParam, element)
  }
  return element
}

export const throughTransform = element => {
  var { transform } = element
  for (const param in transform) {
    var execParam = exec(element[param], element)
    if (element.data[param]) {
      execParam = exec(element.data[param], element)
    } else {
      execParam = exec(element[param], element)
      element.data[param] = execParam
    }
    element[param] = transform[param](execParam, element)
  }
}

export const throughRegisteredParams = element => {
}
