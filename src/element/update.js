'use strict'

import { window } from '@domql/globals'
import { isFunction, isNumber, isObject, isString } from '@domql/utils'
import { applyEvent, triggerEventOn } from '@domql/event'
import { isMethod } from '@domql/methods'
import { createSnapshotId } from '@domql/key'

import { merge, overwrite } from '../utils'
import create from './create'
import { throughUpdatedDefine, throughUpdatedExec } from './iterate'
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

  const [snapshotOnCallee, calleeElement, snapshotHasUpdated] = captureSnapshot(element, options)
  if (snapshotHasUpdated) return

  if (isString(params) || isNumber(params)) {
    params = { text: params }
  }

  const ifFails = checkIfOnUpdate(element, options)
  if (ifFails) return

  const inheritState = inheritStateUpdates(element, options)
  if (inheritState === false) return

  if (__ref.__if && !options.preventPropsUpdate) {
    const hasParentProps = parent.props && (parent.props[key] || parent.props.childProps)
    const props = params.props || hasParentProps
    if (props) updateProps(props, element, parent)
  }

  if (!options.preventInitUpdateListener) {
    const initUpdateReturns = triggerEventOn('initUpdate', element, params)
    if (initUpdateReturns === false) return element
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
      if (!canUpdate) continue

      const childUpdateCall = () => update.call(prop, params[prop], {
        ...options,
        currentSnapshot: snapshotOnCallee,
        calleeElement: calleeElement
      })

      if ((element.props && element.props.lazyLoad) || options.lazyLoad) {
        window.requestAnimationFrame(() => childUpdateCall())
      } else childUpdateCall()
    }
  }

  if (!options.preventUpdateListener) triggerEventOn('update', element)
}

const captureSnapshot = (element, options) => {
  const __ref = element.__ref

  const { currentSnapshot, calleeElement } = options
  const isCallee = calleeElement === element
  if (!calleeElement || isCallee) {
    const createdStanpshot = snapshot.snapshotId()
    __ref.__currentSnapshot = createdStanpshot
    return [createdStanpshot, element]
  }

  const snapshotOnCallee = calleeElement.__ref.__currentSnapshot
  if (currentSnapshot < snapshotOnCallee) {
    return [snapshotOnCallee, calleeElement, true]
  }

  return [snapshotOnCallee, calleeElement]
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
  const { __ref } = element
  const stateKey = __ref.__state
  const { parent } = element

  if (!stateKey && !__ref.__hasRootState) {
    element.state = parent?.state || {}
    return
  }

  const parentState = parent?.state || {}
  const keyInParentState = parentState[stateKey]

  if (!keyInParentState) return

  const initStateReturns = triggerEventOn('initStateUpdated', element, keyInParentState)
  if (initStateReturns === false) return element

  const newState = createState(element, parent)
  element.state = newState

  triggerEventOn('stateUpdated', element, newState.parse())
}

export default update
