'use strict'

var val = {
  text: 0
}

var Button = {
  tag: 'button'
}

var increment = {
  extend: Button,
  text: 'Increment',
  on: {
    click: (e) => {
      val.text++
    }
  }
}

var decrement = {
  extend: Button,
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
