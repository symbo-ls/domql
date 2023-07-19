'use strict'

<<<<<<< HEAD
import { TREE } from './tree'
import create from './create'
import createNode from './node'
import define from './define'
import update from './update'
import parse from './parse'
import set from './set'

import { log, keys } from './methods'
import { get, remove, lookup } from '@domql/methods'

export {
  TREE,
  create,
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
=======
export * from '@domql/methods'
export * from '@domql/iterate'
export * from '@domql/update'
export * from '@domql/create'
export * from '@domql/set'
>>>>>>> feature/v2
