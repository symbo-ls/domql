'use strict'

import { overwrite, exec, isFunction, isObject } from '../utils'
import { registry } from './params'
import * as on from '../event/on'

const update = function (params = {}) {
  const element = this
  const { node, state } = element

  if (!element.log) {
    console.log('---log', element)
    debugger
  }
  element.log('key', '*')

  if (isFunction(element.if) && !element.if(element, element.state)) return

  // If element is string
  if (typeof params === 'string' || typeof params === 'number') {
    params = { text: params }
  }

  // TODO: check bottlecap
  overwrite(element, params)

  for (const param in element) {
    let prop = element[param]

    if (isObject(registry[param]) || prop === undefined) continue

    const hasExec = element.__exec[param]
    if (hasExec) {
      console.log('--hasExec:1', hasExec, prop, param)
      element[param] = prop = hasExec(element, state)
      console.log('--hasExec:2', prop, param)
    }

    const hasDefined = element.define && element.define[param]
    if (hasDefined) {
      console.log('--hasDefined:1', prop, param)
      element[param] = prop = hasDefined(prop, element, state)
      console.log('--hasDefined:2', prop, param)
    }

    // if (isFunction(prop)) debugger // console.log('--isfunction', prop)

    const execParam = exec(params[param], element)
    const ourMethod = registry[param]
    if (ourMethod) {
      if (isFunction(ourMethod)) ourMethod(prop, element, node)
      if (param === 'style') registry.class(element.class, element, node)
    } else if (prop && !hasDefined) {
      console.log('--prop', prop, param, element)
      update.call(prop, execParam, true)
    }
  }

  // run onUpdate
  if (element.on && isFunction(element.on.update)) {
    on.update(element.on.update, element)
  }

  console.groupEnd()

  return this
}

export default update
