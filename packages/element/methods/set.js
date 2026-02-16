'use strict'

import { merge, overwrite } from '@domql/utils'

import { set, reset } from '../set.js'
import { update } from '../update.js'

import { removeContent, updateContent } from '../mixins/content.js'
import {
  call,
  error,
  getPath,
  getRef,
  keys,
  log,
  lookdown,
  lookdownAll,
  lookup,
  nextElement,
  parse,
  parseDeep,
  previousElement,
  remove,
  setNodeStyles,
  setProps,
  spotByPath,
  variables,
  verbose,
  append,
  warn
} from './index.js'
import {
  getContext,
  getRoot,
  getRootContext,
  getRootData,
  getRootState
} from './root.js'

export const addMethods = (element, parent, options = {}) => {
  const proto = {
    set,
    reset,
    update,
    variables,
    remove,
    updateContent,
    removeContent,
    setProps,
    lookup,
    lookdown,
    lookdownAll,
    getRef,
    getRootState,
    getRoot,
    getRootData,
    getRootContext,
    getContext,
    getPath,
    setNodeStyles,
    spotByPath,
    parse,
    parseDeep,
    keys,
    nextElement,
    previousElement,
    log,
    verbose,
    warn,
    error,
    append,
    call
  }
  if (element.context.methods)
    (options.strict ? merge : overwrite)(proto, element.context.methods)
  Object.setPrototypeOf(element, proto)
}
