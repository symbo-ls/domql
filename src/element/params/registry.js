'use strict'

import {
  proto,
  attr,
  style,
  text,
  dataset,
  classList
} from './'

var paramRegistry = {
  attr,
  style,
  text,
  data: dataset,
  class: classList,
  
  proto: {},
  key: {},
  tag: {},
  node: {},
  on: {}
}

export default paramRegistry
