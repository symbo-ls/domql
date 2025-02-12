'use strict'

const val = {
  text: 0
}

const Button = {
  tag: 'button'
}

const increment = {
  extend: Button,
  text: 'Increment',
  on: {
    click: (e) => {
      val.text++
    }
  }
}

const decrement = {
  extends: Button,
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
