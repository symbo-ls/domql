'use strict'

export const init = (param, element) => {
  param(element)
}

export const render = (param, element) => {
  param(element, element.state)
}

export const update = (param, element) => {
  param(element, element.state)
}

export const click = (param, element) => {
  var { node, state } = element
  node.addEventListener('click', event => param(event, element, state), true)
}

export const change = (param, element) => {
  var { node, state } = element
  node.addEventListener('change', event => param(event, element, state), true)
}

export const mouseDown = (param, element) => {
  var { node, state } = element
  node.addEventListener('mousedown', event => param(event, element, state), true)
}

export const mouseMove = (param, element) => {
  var { node, state } = element
  node.addEventListener('mousemove', event => param(event, element, state), true)
}

export const mouseUp = (param, element) => {
  var { node, state } = element
  node.addEventListener('mouseup', event => param(event, element, state), true)
}

export const keyDown = (param, element) => {
  var { node, state } = element
  node.addEventListener('keydown', event => param(event, element, state), true)
}

export const keyUp = (param, element) => {
  var { node, state } = element
  node.addEventListener('keyup', event => param(event, element, state), true)
}

export const load = (param, element) => {
  var { node, state } = element
  node.addEventListener('load', event => param(event, element, state), true)
}

export const input = (param, element) => {
  var { node, state } = element
  node.addEventListener('input', event => param(event, element, state), true)
}
