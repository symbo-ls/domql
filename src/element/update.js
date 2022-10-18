'use strict'

import { overwrite, isFunction, isObject, isString, isNumber, createSnapshotId, merge } from '../utils'
import { registry } from './mixins'
import { on } from '../event'
import { isMethod } from './methods'
import { throughUpdatedDefine, throughUpdatedExec } from './iterate'
import { appendNode } from './assign'
import { createNode } from './node'
import { updateProps } from './props'

const snapshot = {
  snapshotId: createSnapshotId()
}

const UPDATE_DEFAULT_OPTIONS = {
  stackChanges: false,
  cleanExec: true,
  preventRecursive: false,
  currentSnapshot: false,
  calleeElement: false
}

const update = function (params = {}, options = UPDATE_DEFAULT_OPTIONS) {
  const element = this
  const { define, parent, node } = element

  const { currentSnapshot, calleeElement } = options
  if (!calleeElement) {
    element.__currentSnapshot = snapshot.snapshotId.next().value
  }
  const snapshotOnCallee = element.__currentSnapshot || calleeElement && calleeElement.__currentSnapshot
  if (snapshotOnCallee && currentSnapshot < snapshotOnCallee) {
    // console.log(calleeElement)
    // console.log(currentSnapshot, snapshotOnCallee, 'cancelling')
    // return
  }

  if (isString(params) || isNumber(params)) {
    params = { text: params }
  }

  if (isFunction(element.if)) {
    // TODO: move as fragment
    const ifPassed = element.if(element, element.state)

    if (ifPassed) delete element.__ifFalsy
    if (element.__ifFalsy && ifPassed) {
      createNode(element)
      appendNode(element.node, element.__ifFragment)
    } else if (element.node && !ifPassed) {
      element.node.remove()
      element.__ifFalsy = true
    }
  }

  if (!element.__ifFalsy && !options.preventPropsUpdate) updateProps(params.props, element, parent)

  const overwriteChanges = overwrite(element, params, UPDATE_DEFAULT_OPTIONS)
  const execChanges = throughUpdatedExec(element, UPDATE_DEFAULT_OPTIONS)
  const definedChanges = throughUpdatedDefine(element)

  if (options.stackChanges && element.__stackChanges) {
    const stackChanges = merge(definedChanges, merge(execChanges, overwriteChanges))
    element.__stackChanges.push(stackChanges)
  }

  if (element.__ifFalsy) return false
  if (!node) {
    // return createNode(element, options)
    return
  }

  if (element.on && isFunction(element.on.initUpdate) && !options.ignoreInitUpdate) {
    const whatinitreturns = on.initUpdate(element.on.initUpdate, element, element.state)
    if (whatinitreturns === false) return
  }

  for (const param in element) {
    const prop = element[param]

    if (
      options.preventDefineUpdate === true || options.preventDefineUpdate === param ||
      options.preventContentUpdate && param === 'content' ||
      options.preventStateUpdate && param === 'state' ||
      isMethod(param) || isObject(registry[param]) || prop === undefined
    ) continue
    if (options.preventStateUpdate === 'once') options.preventStateUpdate = false

    const hasDefined = define && define[param]
    const ourParam = registry[param]

    if (ourParam) {
      if (isFunction(ourParam)) {
        ourParam(prop, element, node)
      }
    } else if (prop && isObject(prop) && !hasDefined) {
      if (!options.preventRecursive) {
        const childUpdateCall = () => update.call(prop, params[prop], {  
          ...options,
          currentSnapshot: snapshotOnCallee,
          calleeElement: element 
        })
        if (element.props.lazyLoad || options.lazyLoad) {
          window.requestAnimationFrame(() => childUpdateCall())
        } else childUpdateCall()
      }
    }
  }

  if (!options.preventUpdate && element.on && isFunction(element.on.update)) {
    on.update(element.on.update, element, element.state)
  }
}

export default update
