'use strict'

import attr from './attr'
import { classList } from './classList'
import setContent from './content'
import data from './data'
import html from './html'
import scope from './scope'
import state from './state'
import style from './style'
import text from './text'

export const REGISTRY = {
  attr,
  style,
  text,
  html,
  setContent,
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
