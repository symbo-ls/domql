'use strict'

import { overwrite, exec, isObject } from '../utils'
import { throughTransform } from './iterate'
import { registry } from './params'
import * as on from '../event/on'

const update = function (params = {}, forceIteration = false) {
  const element = this
  const { node } = element

  if (typeof element.if === 'function' && !element.if(element)) return

  // If element is string
  if (typeof params === 'string' || typeof params === 'number') {
    params = { text: params }
  }

  // TODO: check bottlecap
  overwrite(element, params)

  // iterate through define
  if (isObject(element.define)) {
    const { define } = element
    for (const param in define) {
      if (params[param] !== undefined) {
        const execParam = exec(params[param], element)
        element.data[param] = execParam
        element[param] = define[param](execParam, element)
      } else {
        element[param] = define[param](element.data[param], element)
      }
    }
  }

  // iterate through transform
  if (isObject(params.transform)) throughTransform(element)

  for (const param in (forceIteration ? element : params)) {
    if ((param === 'set' || param === 'update') || !element[param] === undefined) return

    const execParam = exec(params[param], element)
    const execElementParam = exec(element[param], element)

    const hasDefined = element.define && element.define[param]
    const registeredParam = registry[param]

    if (registeredParam) {
      // Check if it's registered param
      if (typeof registeredParam === 'function') {
        registeredParam(forceIteration ? execElementParam : execParam, element, node)
      }

      if (param === 'style') registry.class(element.class, element, node)
    } else if (element[param] && !hasDefined) {
      // Create element
      update.call(execElementParam, execParam, true)
    } // else if (element[param]) create(execParam, element, param)
  }

  // run onUpdate
  if (element.on && typeof element.on.update === 'function') {
    on.update(element.on.update, element)
  }

  return this
}

export default update
