'use strict'

import { TREE } from '@domql/tree'
import cache from './cache'
import create from './create'
import createNode from './node'
import * as assign from './assign'
import define from './define'
import update from './update'
import parse from './parse'
import set from './set'

import { log, keys } from './methods'
import { setProps, get, remove, lookup } from '@domql/methods'

export {
  TREE,
  cache,
  create,
  createNode,
  assign,
  define,
  remove,
  update,
  parse,
  lookup,
  setProps,
  set,
  get,
  log,
  keys
}
