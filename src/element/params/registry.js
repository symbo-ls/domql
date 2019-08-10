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
  define: {},
  __cached: {},
  key: {},
  tag: {},
  parent: {},
  node: {},
  on: {}
}

export default paramRegistry
