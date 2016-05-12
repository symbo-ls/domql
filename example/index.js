'use strict'

var $ = require('../lib')

var now = performance.now()

for (let i = 0; i < 1000; i++) {
  var afrika = $.Element.create({
    'nodeName': 'div',
    'text': 'Hello Afrika',
    'attr': {
      'align': 'right'
    },
    'styles': {
      'background': 'black',
      'color': 'white',
      'padding': '10px'
    }
  })
}

var later = performance.now()

console.log(later - now)
// react - 517ms - https://jsfiddle.net/nikoloza/6ototeqs/
