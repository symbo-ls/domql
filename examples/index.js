'use strict'

import DOM from '../packages/domql'

import header from './header'
import footer from './footer'
import Icon from './icon'

const icon = {
  proto: Icon,
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
  list,

  icon,
  footer
}

const transformReact = (element, key) => {
  const { ref } = element
  const { tag, props, children, ...rest } = ref
  return {
    type: tag,
    props,
    children
  }
}

DOM.create(root, null, null, {
  transform: {
    react: transformReact
  }
})

// const later = performance.now()
// console.log(later - now)
