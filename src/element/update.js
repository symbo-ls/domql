'use strict'

import { overwrite, isFunction, isObject, isString, isNumber } from '../utils'
import { registry } from './params'
import * as on from '../event/on'
import { isMethod } from './methods'
import { throughUpdatedDefine, throughUpdatedExec } from './iterate'
import { merge } from '../utils/object'

const UPDATE_DEFAULT_OPTIONS = {
  changes: true,
  cleanExec: true
}

const update = function (params = {}, options = UPDATE_DEFAULT_OPTIONS) {
  const element = this

  if (isFunction(element.if) && !element.if(element, element.state)) return

  // if element is string
  if (isString(params) || isNumber(params)) {
    params = { text: params }
  }

  iterate(element, params, options)

  return this
}

const iterate = (element, params = {}, options) => {
  const { node, define } = element

  if (isFunction(element.if) && !element.if(element, element.state)) return

  const overwriteChanges = overwrite(element, params, options)
  const execChanges = throughUpdatedExec(element, options)
  const definedChanges = throughUpdatedDefine(element)

  const changes = merge(definedChanges, merge(execChanges, overwriteChanges))

  for (const param in element) {
    const prop = element[param]

    if (isMethod(param) || isObject(registry[param]) || prop === undefined) continue

    const hasDefined = define && define[param]
    const ourParam = registry[param]

    if (ourParam) {
      if (isFunction(ourParam)) ourParam(prop, element, node)
    } else if (prop && isObject(prop) && !hasDefined) {
      iterate(prop, params[prop], options)
    }
  }

  if (options.changes && element.__changes) element.__changes.push(changes)

  runOnUpdate(element)
}

const runOnUpdate = function (element) {
  if (element.on && isFunction(element.on.update)) {
    on.update(element.on.update, element)
  }
}

export default update
