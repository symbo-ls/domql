'use strict'

import { exec } from '@domql/utils'

export const DEFAULT_METHODS = {
  key: {},
  tag: {},

  if: {},
  define: {},

  attr: {},
  style: {},

  content: {},
  class: {},

  props: {},
  state: {},

  method: {},
  transform: {},

  on: {},

  ref: {},

  extends: {},
  childExtends: {},
  text: (element, state) => {
    element.ref.text = {
      tag: 'text',
      text: exec(element.text, element, state)
    }
  },

  innerHTML: {},

  set: {},
  update: {},
  remove: {}
}

// log: {}
// value: {},
// text: {},
// html: {},
// path: {},
// data: {},
// if: {},
// __hash: {},
// __cache: {},
// __defined: {},
// __exec: {},
// __changes: {},
// __trash: {},
// __root: {},
// __props: {},
// __proto: {},
// __ifFragment: {},
// __ifFalsy: {},
// parent: {},
// node: {},
// lookup: {},
// keys: {},
// parse: {},
// parseDeep: {},
