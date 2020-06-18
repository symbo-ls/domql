'use strict'

var init = (param, element) => {
  param(element)
}

var render = (param, element) => {
  param(element, element.state)
}

var click = (param, element) => {
  var { node, state } = element
  node.addEventListener('click', event => param(event, element, state), true)
}

var change = (param, element) => {
  var { node, state } = element
  node.addEventListener('change', event => param(event, element, state), true)
}

var down = (param, element) => {
  var { node, state } = element
  node.addEventListener('mousedown', event => param(event, element, state), true)
}

var move = (param, element) => {
  var { node, state } = element
  node.addEventListener('mousemove', event => param(event, element, state), true)
}

var up = (param, element) => {
  var { node, state } = element
  node.addEventListener('mouseup', event => param(event, element, state), true)
}

var load = (param, element) => {
  var { node, state } = element
  node.addEventListener('load', event => param(event, element, state), true)
}

var input = (param, element) => {
  var { node, state } = element
  node.addEventListener('input', event => param(event, element, state), true)
}

export { init, render, click, change, down, move, up, load, input }
