'use strict'

import {
  attr, classList, content,
  data, html, state, style,
  text
} from '.'

export default {
  attr,
  style,
  text,
  html,
  content,
  data,
  class: classList,
  state,

  extend: {},
  childExtend: {},
  childExtendRecursive: {},
  props: {},
  path: {},
  if: {},
  define: {},
  transform: {},
  __ref: {},
  __hash: {},
  __text: {},
  nextElement: {},
  previousElement: {},
  key: {},
  tag: {},
  query: {},
  parent: {},
  node: {},
  set: {},
  update: {},
  setProps: {},
  remove: {},
  removeContent: {},
  lookup: {},
  spotByPath: {},
  keys: {},
  log: {},
  parse: {},
  parseDeep: {},
  on: {},
  component: {},
  context: {}
}

// List of keys for .parse() and .parseDeep() to include in the result.
// Keys not in the array are excluded.
export const parseFilters = {
  elementKeys: [
    'tag', 'text', 'style', 'attr', 'class', 'state', 'props',
    'data', 'content', 'html', 'on', 'key'
  ],
  propsKeys: ['__element', 'update'],
  stateKeys: []
}
