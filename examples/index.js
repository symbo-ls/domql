'use strict'

import DOM from '../packages/all'

import header from './header'
import footer from './footer'
import Icon from './icon'
// import { transformReact } from '../packages/transform-react'

const icon = {
  extend: Icon,
  name: 'toke'
}

const { performance } = window
const now = performance.now()

const list = []

for (let i = 0; i < 35; i++) {
  const afrika = {
    text: 'Hello Afrika - ' + parseInt(Math.random() * 100),
    tag: 'li',
    attr: {
      align: 'right'
    },
    style: {
      background: 'black',
      color: 'white',
      padding: 10
    }
  }

  const lion = {
    text: 'Lion',
    style: {
      color: 'black',
      opacity: Math.random(),
      background: 'yellow'
    }
  }

  const yay = 'yay'

  afrika[lion] = lion
  afrika[yay] = yay

  list[i] = afrika
}

const root = {
  header,
  // list,

  // icon,
  footer
}

const app = DOM.create(root, null, null, {
  // transform: { react: transformReact }
  transform: {
    showMeKeys: (a, b, c, d) => Object.keys(a).map(v => v + ' hello')
  }
})
console.log(app)
// const later = performance.now()
// console.log(later - now)
