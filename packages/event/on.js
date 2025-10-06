'use strict'

import { isFunction, isString, getContextFunction } from '@domql/utils'

const getOnOrPropsEvent = (param, element) => {
  const onEvent = element.on?.[param]
  const onPropEvent =
    element.props?.['on' + param.slice(0, 1).toUpperCase() + param.slice(1)]
  return onEvent || onPropEvent
}

export const applyEvent = (fnValue, element, state, context, options) => {
  if (isString(fnValue)) fnValue = getContextFunction.call(element, fnValue)
  if (!fnValue.call) element.warn(`Event is not executable: ${fnValue}`)

  // console.log('2.1. applyEvent:')
  // console.log(element.__ref.path?.join('.'))
  // console.log(element, options)

  return fnValue.call(
    element,
    element,
    state || element.state,
    context || element.context,
    options
  )
}

export const triggerEventOn = async (param, element, options) => {
  const appliedFunction = getOnOrPropsEvent(param, element)

  // console.log('----')
  // console.log('1. trigger update', param)
  // console.log(element, options, options.calleeElement)

  if (appliedFunction) {
    const { state, context } = element
    return await applyEvent(appliedFunction, element, state, context, options)
  }
}

export const applyEventUpdate = (
  fnValue,
  updatedObj,
  element,
  state,
  context,
  options
) => {
  if (isString(fnValue)) fnValue = getContextFunction.call(element, fnValue)
  if (!fnValue.call) element.warn(`Event is not executable: ${fnValue}`)

  // console.log('2.1. applyEventUpdate:')
  // console.log(element.__ref.path?.join('.'))
  // console.log(element, options)

  return fnValue.call(
    element,
    updatedObj,
    element,
    state || element.state,
    context || element.context,
    options
  )
}

export const triggerEventOnUpdate = async (
  param,
  updatedObj,
  element,
  options
) => {
  // console.log('----')
  // console.log('2. trigger update', param)
  // console.log(element, options, options.calleeElement)

  const appliedFunction = getOnOrPropsEvent(param, element)
  if (appliedFunction) {
    const { state, context } = element
    return await applyEventUpdate(
      appliedFunction,
      updatedObj,
      element,
      state,
      context,
      { calleeElement: element, ...options }
    )
  }
}

export const applyEventsOnNode = (element, options) => {
  const { node, on } = element
  for (const param in on) {
    if (
      param === 'init' ||
      param === 'beforeClassAssign' ||
      param === 'render' ||
      param === 'renderRouter' ||
      param === 'attachNode' ||
      param === 'stateInit' ||
      param === 'stateCreated' ||
      param === 'beforeStateUpdate' ||
      param === 'stateUpdate' ||
      param === 'beforeUpdate' ||
      param === 'done' ||
      param === 'create' ||
      param === 'complete' ||
      param === 'frame' ||
      param === 'update'
    )
      continue

    let fnValue = getOnOrPropsEvent(param, element)
    if (isString(fnValue)) {
      fnValue = getContextFunction.call(element, fnValue)
    }
    if (isFunction(fnValue)) {
      node.addEventListener(param, async (event) => {
        const { state, context } = element
        await fnValue.call(element, event, element, state, context, options)
      })
    }
  }
}
