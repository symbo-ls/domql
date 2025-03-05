import { isFunction } from '@domql/utils'

// LEGACY
export const init = (param, element, state) => {
  param(element, state)
}

export const render = (param, element, state) => {
  param(element, state)
}

// export const attachNode = (param, element, state) => {
//   param(element, state)
// }

export const createState = async (state, element) => {
  const { on, ...el } = element
  if (on && isFunction(on.createState)) {
    await on.createState(state, el)
  }
}

export const updateStateInit = async (changes, element) => {
  const { state, on, ...el } = element
  if (on && isFunction(on.updateStateInit)) {
    await on.updateStateInit(changes, state, el)
  }
}

export const updateState = async (changes, element) => {
  const { state, on } = element
  if (on && isFunction(on.updateState)) {
    await on.updateState(changes, state, element)
  }
}

export const propsUpdated = async element => {
  const { props, state, on } = element
  if (on && isFunction(on.propsUpdated)) {
    await on.propsUpdated(props, state, element)
  }
}

export const update = async (params, element, state) => {
  if (element.on && isFunction(element.on.update)) {
    await element.on.update(element, state)
  }
  return params
}
