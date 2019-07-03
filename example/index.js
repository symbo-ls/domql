'use strict'

import DOM from '../src'

var { performance } = window
var now = performance.now()

for (let i = 0; i < 1000; i++) {
  var afrika = DOM.create({
    text: 'Hello Afrika - ' + parseInt(Math.random() * 100),
    attr: {
      align: 'right'
    },
    style: {
      background: 'black',
      color: 'white',
      padding: '10px'
    }
  })

  DOM.create({
    text: 'Lion',
    tag: 'span',
    style: {
      color: 'black',
      opacity: Math.random(),
      background: 'yellow'
    }
  }, afrika)

  DOM.create('yay', afrika)
}

var later = performance.now()

console.log(later - now)
