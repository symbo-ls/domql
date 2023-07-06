'use strict'

import { TREE } from '@domql/tree'
import createNode from './node'
import define from './define'
import update from './update'
import parse from './parse'
import set from './set'

import { log, keys } from './methods'
import { get, remove, lookup } from '@domql/methods'

export { create } from './create'

export {
  TREE,
  createNode,
  define,
  remove,
  update,
  parse,
  lookup,
  set,
  get,
  log,
  keys
}
