'use strict'

import { overwrite, isFunction, isObject, isString, isNumber } from '../utils'
import { registry } from './params'
import * as on from '../event/on'
import { isMethod } from './methods'
import { throughUpdatedDefine, throughUpdatedExec } from './iterate'
import { merge } from '../utils/object'
import cacheNode from './cache'
import { appendNode } from './assign'

const UPDATE_DEFAULT_OPTIONS = {
  changes: true,
  cleanExec: true
}

const update = function (params = {}, options = UPDATE_DEFAULT_OPTIONS) {
  const element = this
  const { define } = element
  let { node } = element

  // if params is string
  if (isString(params) || isNumber(params)) {
    params = { text: params }
  }

  const overwriteChanges = overwrite(element, params, options)
  const execChanges = throughUpdatedExec(element, options)
  const definedChanges = throughUpdatedDefine(element)

  if (Object.prototype.hasOwnProperty.call(element, 'if')) {
    // TODO: trash and insertbefore
    if (element.if === true && !element.node) {
      element.node = node = cacheNode(element)
      appendNode(node, element.parent.node)
    } else if (element.if === false && element.node) {
      delete element.node
      node.remove()
      return
    }
  }

  if (!node) return

  const changes = merge(definedChanges, merge(execChanges, overwriteChanges))

  for (const param in element) {
    const prop = element[param]

    if (isMethod(param) || isObject(registry[param]) || prop === undefined) continue

    const hasDefined = define && define[param]
    const ourParam = registry[param]

    if (ourParam) {
      if (isFunction(ourParam)) ourParam(prop, element, node)
    } else if (prop && isObject(prop) && !hasDefined) {
      update.call(prop, params[prop], options)
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
