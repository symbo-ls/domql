'use strict'

var val = {
  text: 0
}

var Button = {
  tag: 'button',
  attr: {
    class: 'ui-button'
  },
  on: {
    click: (e, element) => {
      element.text === 'Increment' ? val.text++ : val.text--
    }
  }
}

var increment = {
  class: Button,
  text: 'Increment',
}

var decrement = {
  class: Button,
  text: 'Decrement',
}

export default { val, increment, decrement }
