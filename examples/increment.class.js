'use strict'

const val = {
  text: 0
}

const Button = {
  tag: 'button',
  on: {
    click: (e, element) => {
      element.text === 'Increment' ? val.text++ : val.text--
    }
  }
}

const increment = {
  class: Button,
  text: 'Increment'
}

const decrement = {
  class: Button,
  text: 'Decrement'
}

export default { val, increment, decrement }
