'use strict'

var val = {
  text: 0
}

var Button = {
  tag: 'button'
}
// <button></button>

var increment = {
  class: Button,
  text: 'Increment',
  on: {
    click: (e) => {
      val.text++
    }
  }
}

var decrement = {
  class: Button,
  text: 'Decrement',
  on: {
    click: (e) => {
      val.text--
    }
  }
}

export default {
  style: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  val,
  increment,
  decrement
}
