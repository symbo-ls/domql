'use strict'

var $ = require('../lib')

var now = performance.now()

for (let i = 0; i < 1000; i++) {
  var afrika = $.Element.create({
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

  var lion = $.Element.create({
    text: 'Lion',
    tag: 'span',
    style: {
      color: 'black',
      background: 'yellow'
    }
  }, afrika)

  var yay = $.Element.create('yay', afrika)

  $.Element.method.assign(lion, afrika)
}

var later = performance.now()

console.log(later - now)
// react - 517ms - https://jsfiddle.net/nikoloza/6ototeqs/
