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
  node: {},
  on: {}
}

export default paramRegistry
