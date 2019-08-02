'use strict'

import {
  proto,
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
  key: {},
  tag: {},
  parent: {},
  node: {},
  on: {}
}

export default paramRegistry
