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
    let prop = element[param]

    if (
      (
        param === 'set' ||
        param === 'update' ||
        param === 'remove' ||
        param === 'node' ||
        param === 'lookup'
      ) ||
      prop === undefined
    ) continue

    const hasExec = element.__exec[param]
    if (hasExec) prop = exec(hasExec, element)

    const execParam = exec(params[param], element)

    const hasDefined = element.define && element.define[param]
    const ourMethod = registry[param]

    if (hasDefined)
      prop = element.define[param](prop, element, element.state)

    if (ourMethod) {
      if (isFunction(ourMethod)) ourMethod(prop, element, node)
      if (param === 'style') registry.class(element.class, element, node)
    } else if (element[param] && !hasDefined) {
      update.call(prop, execParam, true)
    } // else if (element[param]) create(execParam, element, param)
  }

  // run onUpdate
  if (element.on && isFunction(element.on.update)) {
    on.update(element.on.update, element)
  }

  return this
}

export default update
