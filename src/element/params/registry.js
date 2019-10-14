'use strict'

import {
  attr,
  style,
  text,
  html,
  content,
  dataset,
  classList
} from './'

var paramRegistry = {
  attr,
  style,
  text,
  html,
  content,
  data: dataset,
  class: classList,

  proto: {},
  childProto: {},
  if: {},
  define: {},
  transform: {},
  __cached: {},
  key: {},
  tag: {},
  parent: {},
  node: {},
  set: {},
  update: {},
  on: {}
}

export default paramRegistry
