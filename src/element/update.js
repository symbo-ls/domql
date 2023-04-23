'use strict'

import { window } from '@domql/globals'
import { diff, isFunction, isNumber, isObject, isString, createSnapshotId } from '@domql/utils'
import { applyEvent, triggerEventOn } from '@domql/event'
import { merge, overwrite } from '../utils'

import { on } from '../event'
import create from './create'
import { throughUpdatedDefine, throughUpdatedExec } from './iterate'
import { isMethod } from './methods'
import { registry } from './mixins'
import { updateProps } from './props'
import createState from './state'
import { applyParam } from './applyParam'

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
  const { parent, node, key } = element

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

  const ifFails = checkIfOnUpdate(element, options)
  if (ifFails) return

  const inheritState = inheritStateUpdates(element, options)
  if (inheritState === false) return

  // if (__ref.__state) {
  //   const keyInParentState = parent.state[__ref.__state]
  //   if (keyInParentState) {
  //     const newState = __ref.__stateType === 'string'
  //       ? createState(element, parent)
  //       : createState(element, parent)
  //     const changes = diff(newState.parse(), element.state.parse())

  //     // run `on.stateUpdated`
  //     if (element.on && isFunction(element.on.initStateUpdated)) {
  //       const initReturns = on.initStateUpdated(element.on.initStateUpdated, element, element.state, changes)
  //       if (initReturns === false) return
  //     }

  //     element.state = newState

  //     if (!options.preventUpdateListener && element.on && isFunction(element.on.stateUpdated)) {
  //       on.stateUpdated(element.on.stateUpdated, element, element.state, changes)
  //     }
  //   }
  // } else if (!__ref.__hasRootState) element.state = (parent && parent.state) || {}

  if (__ref.__if && !options.preventPropsUpdate) {
    const hasParentProps = parent.props && (parent.props[key] || parent.props.childProps)
    // if (hasParentProps) console.log(hasParentProps.value)
    updateProps(params.props || (hasParentProps && {}), element, parent)
  }

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

    const isElement = applyParam(param, element, options)
    if (isElement) {
      const { hasDefine, hasContextDefine } = isElement
      const canUpdate = isObject(prop) && !hasDefine && !hasContextDefine && !options.preventRecursive

      if (canUpdate) {
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

  if (!options.preventUpdateListener) triggerEventOn('update', element)
}

const checkIfOnUpdate = (element, options) => {
  if (!isFunction(element.if)) return

  const __ref = element.__ref
  const ifPassed = element.if(element, element.state)
  const itWasFalse = __ref.__if !== true

  if (ifPassed) {
    __ref.__if = true
    if (itWasFalse) {
      delete element.__hash
      delete element.extend
      if (!__ref.__hasRootState) {
        delete element.state
      }
      if (__ref.__state) {
        element.state = __ref.__state
      }
      const created = create(element, element.parent, element.key)
      if (!options.preventUpdate && element.on && isFunction(element.on.update)) {
        applyEvent(element.on.update, created, created.state)
      }
      return created
    }
  } else if (element.node && !ifPassed) {
    element.node.remove()
    delete __ref.__if
  }
}

const inheritStateUpdates = (element, options) => {
  const { parent } = element
  const __ref = element.__ref
  const stateKey = __ref.__state
  if (stateKey) {
    const parentState = parent.state
    const keyInParentState = parentState && parentState[stateKey]

    if (keyInParentState) {
      const newState = createState(element, parent)
      const changes = diff(newState.parse(), element.state.parse())

      // run `on.stateUpdated`
      const { on } = element
      if (on?.initStateUpdated) {
        const initReturns = on.initStateUpdated(on.initStateUpdated, element, element.state, changes)
        if (initReturns === false) return false
      }

      element.state = newState

      if (!options.preventUpdateListener && on?.stateUpdated) {
        on.stateUpdated(on.stateUpdated, element, element.state, changes)
      }
    }
  } else if (!__ref.__hasRootState) {
    element.state = parent?.state || {}
  }
}

export default update
