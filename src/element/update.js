'use strict'

import { overwrite, exec, isFunction } from '../utils'
import { registry } from './params'
import * as on from '../event/on'

const update = function (params = {}) {
  const element = this
  const { node } = element

  if (typeof element.if === 'function' && !element.if(element)) return

  // If element is string
  if (typeof params === 'string' || typeof params === 'number') {
    params = { text: params }
  }

  // TODO: check bottlecap
  overwrite(element, params)

  for (const param in element) {
    if (
      (
        param === 'set' ||
        param === 'update' ||
        param === 'remove' ||
        param === 'node' ||
        param === 'lookup'
      ) ||
      element[param] === undefined
    ) continue

    const hasExec = __exec && __exec[param]
    if (hasExec) {
      if (params[param]) delete __exec[param]
    }
    if (params[param] && hasExec) delete __exec[param]

    const elementParam = hasExec ? __exec[param] : element[param]

    const execParam = exec(params[param], element)
    const execElementParam = exec(elementParam, element)

    const hasDefined = element.define && element.define[param]
    const ourMethod = registry[param]

    if (ourMethod) {
      if (isFunction(ourMethod)) ourMethod(execElementParam, element, node)
      if (param === 'style') registry.class(element.class, element, node)
    } else if (element[param] && !hasDefined) {
      update.call(execElementParam, execParam, true)
    } // else if (element[param]) create(execParam, element, param)
  }

  // run onUpdate
  if (element.on && isFunction(element.on.update)) {
    on.update(element.on.update, element)
  }

  return this
}

export default update
