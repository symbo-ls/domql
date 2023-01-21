'use strict'

import { create, parse, set, define, tree } from './element'

const ENV = process.env.NODE_ENV
if (ENV === 'test' || ENV === 'development') global.tree = tree

export default {
  create,
  parse,
  set,
  define,
  tree
}
