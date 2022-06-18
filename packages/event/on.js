'use strict'

import { isFunction } from '@domql/utils'

export const init = (param, element, state) => {
  param(element, state)
}

export const render = (param, element, state) => {
  param(element, state)
}

export const initUpdate = (element) => {
  console.log(element)
  const { ref, state, on } = element
  const { props } = ref
  if (on && isFunction(on.initUpdate)) {
    on.initUpdate(props, state, ref)
  }
}

// export const attachNode = (param, element, state) => {
//   param(element, state)
// }

export const createState = (state, element) => {
  const { on, ...el } = element
  if (on && isFunction(on.createState)) {
    on.createState(state, el)
  }
}

export const updateStateInit = (changes, element) => {
  const { state, on, ...el } = element
  if (on && isFunction(on.updateStateInit)) {
    on.updateStateInit(changes, state, el)
  }
}

export const updateState = (changes, element) => {
  const { state, on } = element
  if (on && isFunction(on.updateState)) {
    on.updateState(changes, state, element)
  }
}

export const propsUpdated = (element) => {
  const { props, state, on } = element
  if (on && isFunction(on.propsUpdated)) {
    on.propsUpdated(props, state, element)
  }
}

export const update = (params, element, state) => {
  if (element.on && isFunction(element.on.update)) {
    element.on.update(element, state)
  }
  return params
}
