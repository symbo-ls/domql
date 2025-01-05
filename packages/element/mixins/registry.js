'use strict'

import attr from './attr.js'
import { classList } from './classList.js'
import content from './content.js'
import data from './data.js'
import html from './html.js'
import scope from './scope.js'
import state from './state.js'
import style from './style.js'
import text from './text.js'

export const REGISTRY = {
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
  reset: {},
  update: {},
  error: {},
  warn: {},
  call: {},
  setProps: {},
  remove: {},
  updateContent: {},
  removeContent: {},
  variables: {},
  lookup: {},
  lookdown: {},
  getRef: {},
  getPath: {},
  lookdownAll: {},
  setNodeStyles: {},
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

export default REGISTRY

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
