'use strict'

export const init = (param, element) => {
  param(element)
}

export const render = (param, element) => {
  param(element, element.state)
}

export const update = (param, element, node) => {
  param(element, node)
}
