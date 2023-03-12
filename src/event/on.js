'use strict'

export const beforeClassAssign = (param, element, state) => {
  return param(element, state)
}

export const initUpdate = (param, element, state) => {
  return param(element, state)
}

export const initStateUpdated = (param, element, state, changes) => {
  return param(element, state, changes)
}

export const stateUpdated = (param, element, state, changes) => {
  return param(element, state, changes)
}

export const update = (param, element, state) => {
  return param(element, state)
}
