'use strict'

import {
  attr, classList, content,
  data, html, state, style,
  text, scope
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
  scope,

  deps: (param, el) => param || el.parent.deps,

  extend: {},
  childExtend: {},
  childExtendRecursive: {},
  props: {},
  path: {},
  if: {},
  define: {},
  transform: {},
  __name: {},
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
  updateContent: {},
  removeContent: {},
  lookup: {},
  lookdown: {},
  spotByPath: {},
  keys: {},
  log: {},
  parse: {},
  parseDeep: {},
  on: {},
  component: {},
  context: {},
  $collection: {},
  $stateCollection: {},
  $propsCollection: {},
  $setCollection: {},
  $setStateCollection: {},
  $setPropsCollection: {}
}

// List of keys for .parse() and .parseDeep() to include in the result.
// Keys not in the array are excluded.
export const parseFilters = {
  elementKeys: [
    'tag', 'text', 'style', 'attr', 'class', 'state', 'props',
    'data', 'content', 'html', 'on', 'key', 'extend', 'childExtend',
    'childExtendRecursive', 'scope', 'query',
    '$collection', '$stateCollection', '$propsCollection'
  ],
  propsKeys: ['__element', 'update'],
  stateKeys: []
}

export const collectionFilters = ['$collection', '$stateCollection', '$propsCollection']
