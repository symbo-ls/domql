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

export const popstate = (param, element) => {
  window.addEventListener('popstate', event => param(event, element), true)
}

export const click = (param, element, node) => {
  node.addEventListener('click', event => param(event, element, node), true)
}

export const change = (param, element, node) => {
  node.addEventListener('change', event => param(event, element, node), true)
}

export const mouseDown = (param, element, node) => {
  node.addEventListener('mousedown', event => param(event, element, node), true)
}

export const mouseMove = (param, element, node) => {
  node.addEventListener('mousemove', event => param(event, element, node), true)
}

export const mouseUp = (param, element, node) => {
  node.addEventListener('mouseup', event => param(event, element, node), true)
}

export const keyDown = (param, element, node) => {
  node.addEventListener('keydown', event => param(event, element, node), true)
}

export const keyUp = (param, element, node) => {
  node.addEventListener('keyup', event => param(event, element, node), true)
}

export const load = (param, element, node) => {
  node.addEventListener('load', event => param(event, element, node), true)
}

export const input = (param, element, node) => {
  node.addEventListener('input', event => param(event, element, node), true)
}
