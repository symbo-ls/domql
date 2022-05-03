'use strict'

import { overwrite, isFunction, isObject, isString, isNumber } from '../utils'
import { registry } from './mixins'
import * as on from '../event/on'
import { isMethod } from './methods'
import { throughUpdatedDefine, throughUpdatedExec } from './iterate'
import { merge } from '../utils/object'
import { appendNode } from './assign'
import { createNode } from '.'
import { updateProps } from './createProps'
import createState from './createState'

const UPDATE_DEFAULT_OPTIONS = {
  stackChanges: false,
  cleanExec: true,
  preventRecursive: false
}

const update = function (params = {}, options = UPDATE_DEFAULT_OPTIONS) {
  const element = this
  const { define, parent, node } = element

  if (isString(params) || isNumber(params)) {
    params = { text: params }
  }

  if (element.on && isFunction(element.on.initUpdate)) {
    on.initUpdate(element.on.initUpdate, element, element.state)
  }

  updateProps(params.props, element, parent)

  // const state = params.state || element.state
  // element.state = createState({ state }, parent)

  const overwriteChanges = overwrite(element, params, UPDATE_DEFAULT_OPTIONS)
  const execChanges = throughUpdatedExec(element, UPDATE_DEFAULT_OPTIONS)
  const definedChanges = throughUpdatedDefine(element)

  if (UPDATE_DEFAULT_OPTIONS.stackChanges && element.__stackChanges) {
    const stackChanges = merge(definedChanges, merge(execChanges, overwriteChanges))
    element.__stackChanges.push(stackChanges)
  }

  if (isFunction(element.if)) {
    // TODO: move as fragment
    const ifPassed = element.if(element, element.state)
    if (element.__ifFalsy && ifPassed) {
      createNode(element)
      appendNode(element.node, element.__ifFragment)
      delete element.__ifFalsy
    } else if (element.node && !ifPassed) {
      element.node.remove()
      element.__ifFalsy = true
    }
  }

  if (!node || options.preventRecursive) return

  for (const param in element) {
    const prop = element[param]

    if (isMethod(param) || isObject(registry[param]) || prop === undefined) continue

    const hasDefined = define && define[param]
    const ourParam = registry[param]

    // // console.log(prop)

    if (ourParam) {
      if (isFunction(ourParam)) ourParam(prop, element, node)
    } else if (prop && isObject(prop) && !hasDefined) {
      update.call(prop, params[prop], UPDATE_DEFAULT_OPTIONS)
    }
  }

  if (element.on && isFunction(element.on.update)) {
    on.update(element.on.update, element, element.state)
  }
}

export default update
