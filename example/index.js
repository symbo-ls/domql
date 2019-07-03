'use strict'

<<<<<<< HEAD
import DOM from '../src'

var { performance } = window
var now = performance.now()

for (let i = 0; i < 1000; i++) {
  var afrika = DOM.create({
=======
var $ = require('../lib')

var now = performance.now()

for (let i = 0; i < 1000; i++) {
  var afrika = $.Element.create({
>>>>>>> 966f98521373dfa2901abdda7210eaa80a46ac31
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

<<<<<<< HEAD
  DOM.create({
=======
  var lion = $.Element.create({
>>>>>>> 966f98521373dfa2901abdda7210eaa80a46ac31
    text: 'Lion',
    tag: 'span',
    style: {
      color: 'black',
      opacity: Math.random(),
      background: 'yellow'
    }
  }, afrika)

<<<<<<< HEAD
  DOM.create('yay', afrika)
=======
  var yay = $.Element.create('yay', afrika)
>>>>>>> 966f98521373dfa2901abdda7210eaa80a46ac31
}

var later = performance.now()

console.log(later - now)
