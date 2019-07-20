'use strict'

import {
  attr,
  style,
  text,
  dataset
} from './'


var attrRegistry = {
  attr,
  style,
  text,
  data: dataset,

  key: {},
  tag: {},
  class: {},
  node: {},
  prototype: {},
  on: {}
}

export default attrRegistry
