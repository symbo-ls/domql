'use strict'

import { overwrite, exec, isFunction, isObject } from '../utils'
import { registry } from './params'
import * as on from '../event/on'
import { isMethod } from './methods'

const update = function (params = {}) {
  const element = this
  const { node, state, __exec, define } = element

  if (isFunction(element.if) && !element.if(element, element.state)) return

  // If element is string
  if (typeof params === 'string' || typeof params === 'number') {
    params = { text: params }
  }

  // console.log(params, element)

  overwrite(element, params)

  if (typeof element === 'string') return

  for (const param in element) {
    let prop = element[param]

    if (isMethod(param) || isObject(registry[param]) || prop === undefined) continue

    const hasExec = __exec && __exec[param]
    if (hasExec) element[param] = prop = hasExec(element, state)

    const hasDefined = define && define[param]
    if (hasDefined) element[param] = prop = hasDefined(prop, element, state)

    const execParam = exec(params[param], element)
    const ourParam = registry[param]
    if (ourParam) {
      if (isFunction(ourParam)) ourParam(prop, element, node)
      if (param === 'style') registry.class(element.class, element, node)
    } else if (prop && !hasDefined) {
      update.call(prop, execParam)
    }
  }

  // run onUpdate
  if (element.on && isFunction(element.on.update)) {
    on.update(element.on.update, element)
  }

  return this
}

export default update
