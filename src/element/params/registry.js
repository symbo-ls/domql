'use strict'

import {
  proto,
  attr,
  style,
  text,
  html,
  dataset,
  classList
} from './'

var paramRegistry = {
  attr,
  style,
  text,
  html,
  data: dataset,
  class: classList,
  
  proto: {},
  childProto: {},
  key: {},
  tag: {},
  parent: {},
  node: {},
  on: {}
}

export default paramRegistry
