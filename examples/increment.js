'use strict'

const val = {
  text: 0
}

const Button = {
  tag: 'button'
}

const increment = {
  extends: Button,
  text: 'Increment',
  onClick: e => {
    val.text++
  }
}

const decrement = {
  extends: Button,
  text: 'Decrement',
  onClick: e => {
    val.text--
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
