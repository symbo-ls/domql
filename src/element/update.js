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

  if (isFunction(element.if)) {
    // TODO: move as fragment
    const ifPassed = element.if(element, element.state)

    // console.group('updateLoop')
    // console.log(element)
    // console.log(element.__ifFalsy)
    // console.log(ifPassed)
    // console.groupEnd('updateLoop')

    // if (element.__ifFalsy && ifPassed) {
    if (ifPassed) delete element.__ifFalsy

    if (element.__ifFalsy && ifPassed) {
      createNode(element)
      appendNode(element.node, element.__ifFragment)
    } else if (element.node && !ifPassed) {
      element.node.remove()
      element.__ifFalsy = true
    }
  }

  if (element.on && isFunction(element.on.initUpdate) && !options.ignoreInitUpdate) {
    preventUpdate = on.initUpdate(element.on.initUpdate, element, element.state)
  }

  // console.group('update')
  // console.log(element.path)
  // console.log(element)
  // if (params.props) {
    // console.log('INSIDE:')
    // console.log(params.props)
  // }
  if (!element.__ifFalsy) updateProps(params.props, element, parent)


  // const state = params.state || element.state
  // element.state = createState({ state }, parent)

  const overwriteChanges = overwrite(element, params, UPDATE_DEFAULT_OPTIONS)
  const execChanges = throughUpdatedExec(element, UPDATE_DEFAULT_OPTIONS)
  const definedChanges = throughUpdatedDefine(element)

  if (UPDATE_DEFAULT_OPTIONS.stackChanges && element.__stackChanges) {
    const stackChanges = merge(definedChanges, merge(execChanges, overwriteChanges))
    element.__stackChanges.push(stackChanges)
  }
  // const stackChanges = merge(definedChanges, merge(execChanges, overwriteChanges))
  // if (Object.keys(stackChanges).length === 0) return
  // else console.log(element.path, '\n\n', stackChanges)

  // console.log(element.key, element.__ifFalsy)
  if (element.__ifFalsy || options.preventRecursive) return element
  if (!node) {
    return
    // return createNode(element, options)
  }

  // console.warn(element.key)
  // console.groupEnd('update')

  for (const param in element) {
    const prop = element[param]

    // console.group('updateLoop')
    // console.log(param)
    // console.log(prop)
    // console.groupEnd('updateLoop')
    // if (element.key === 'span' && param === 'node') debugger

    if (options.preventContentUpdate && param === 'content') continue
    if (isMethod(param) || isObject(registry[param]) || prop === undefined) continue

    const hasDefined = define && define[param]
    const ourParam = registry[param]

    // // console.log(prop)

    if (ourParam) {
      if (isFunction(ourParam)) ourParam(prop, element, node)
    } else if (prop && isObject(prop) && !hasDefined) {
      if (!options.preventChildrenUpdate) update.call(prop, params[prop], UPDATE_DEFAULT_OPTIONS)
    }
  }

  if (element.on && isFunction(element.on.update)) {
    on.update(element.on.update, element, element.state)
  }
}

export default update
