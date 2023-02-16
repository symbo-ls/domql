'use strict'

import { window } from '@domql/globals'
import { diff } from '@domql/utils'
import { on } from '../event'
import { createSnapshotId, isFunction, isNumber, isObject, isString, merge, overwrite } from '../utils'
import create from './create'
import { throughUpdatedDefine, throughUpdatedExec } from './iterate'
import { isMethod } from './methods'
import { registry } from './mixins'
import { updateProps } from './props'
import createState from './state'

const snapshot = {
  snapshotId: createSnapshotId
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
  const { parent, node, context } = element

  let __ref = element.__ref
  if (!__ref) __ref = element.__ref = {}

  const { currentSnapshot, calleeElement } = options
  if (!calleeElement) {
    __ref.__currentSnapshot = snapshot.snapshotId()
  }

  const snapshotOnCallee = __ref.__currentSnapshot ||
    (calleeElement && calleeElement.__ref && calleeElement.__currentSnapshot)
  if (snapshotOnCallee && currentSnapshot < snapshotOnCallee) {
    // TODO: stop previous update
  }

  if (isString(params) || isNumber(params)) {
    params = { text: params }
  }

  if (isFunction(element.if)) {
    // TODO: move as fragment
    const ifPassed = element.if(element, element.state)
    const itWasFalse = !__ref.__if

    if (ifPassed) __ref.__if = true
    if (itWasFalse && ifPassed) {
      delete element.__hash
      if (!__ref.__hasRootState || __ref.__state) delete element.state
      const created = create(element, element.parent, element.key)
      if (!options.preventUpdate && element.on && isFunction(element.on.update)) {
        on.update(element.on.update, created, created.state)
      }
      return created
    } else if (element.node && !ifPassed) {
      element.node.remove()
      delete __ref.__if
    }
  }

  if (__ref.__state) {
    const keyInParentState = parent.state[__ref.__state]
    if (keyInParentState) {
      const newState = __ref.__stateType === 'string'
        ? createState(element, parent)
        : createState(element, parent)
      const changes = diff(newState.parse(), element.state.parse())

      // run `on.stateUpdated`
      if (element.on && isFunction(element.on.initStateUpdated)) {
        const initReturns = on.initStateUpdated(element.on.initStateUpdated, element, element.state, changes)
        if (initReturns === false) return
      }

      element.state = newState

      if (!options.preventUpdateListener && element.on && isFunction(element.on.stateUpdated)) {
        on.stateUpdated(element.on.stateUpdated, element, element.state, changes)
      }
    }
  } else if (!__ref.__hasRootState) element.state = (parent && parent.state) || {}

  if (__ref.__if && !options.preventPropsUpdate) updateProps(params.props, element, parent)

  if (element.on && isFunction(element.on.initUpdate) && !options.ignoreInitUpdate) {
    const whatinitreturns = on.initUpdate(element.on.initUpdate, element, element.state)
    if (whatinitreturns === false) return
  }

  const overwriteChanges = overwrite(element, params, UPDATE_DEFAULT_OPTIONS)
  const execChanges = throughUpdatedExec(element, UPDATE_DEFAULT_OPTIONS)
  const definedChanges = throughUpdatedDefine(element)

  if (options.stackChanges && element.__stackChanges) {
    const stackChanges = merge(definedChanges, merge(execChanges, overwriteChanges))
    element.__stackChanges.push(stackChanges)
  }

  if (!__ref.__if) return false
  if (!node) {
    // return createNode(element, options)
    return
  }

  for (const param in element) {
    const prop = element[param]

    if (
      options.preventDefineUpdate === true ||
      options.preventDefineUpdate === param ||
      (options.preventContentUpdate && param === 'content') ||
      (options.preventStateUpdate && param) === 'state' ||
      isMethod(param) || isObject(registry[param]) || prop === undefined
    ) continue
    if (options.preventStateUpdate === 'once') options.preventStateUpdate = false

    const DOMQLProperty = registry[param]
    const DOMQLPropertyFromContext = context && context.registry && context.registry[param]
    const isGlobalTransformer = DOMQLPropertyFromContext || DOMQLProperty

    const hasDefine = element.define && element.define[param]
    const hasContextDefine = context && context.define && context.define[param]

    if (isGlobalTransformer && !hasContextDefine) {
      if (isFunction(isGlobalTransformer)) isGlobalTransformer(prop, element, node, options)
    } else if (prop && isObject(prop) && !hasDefine && !hasContextDefine) {
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
