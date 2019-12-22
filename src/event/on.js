'use strict'

var init = (param, element) => {
  param(element)
}

var render = (param, element) => {
  param(element)
}

var click = (param, element) => {
  var { node } = element
  node.addEventListener('click', event => param(event, element), true)
}

var change = (param, element) => {
  var { node } = element
  node.addEventListener('change', event => param(event, element), true)
}

var down = (param, element) => {
  var { node } = element
  node.addEventListener('mousedown', event => param(event, element), true)
}

var move = (param, element) => {
  var { node } = element
  node.addEventListener('mousemove', event => param(event, element), true)
}

var up = (param, element) => {
  var { node } = element
  node.addEventListener('mouseup', event => param(event, element), true)
}

var load = (param, element) => {
  var { node } = element
  node.addEventListener('load', event => param(event, element), true)
}

export { init, render, click, change, down, move, up, load }
