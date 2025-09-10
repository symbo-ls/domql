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

export const addMethods = (element, parent, options = {}) => {
  const proto = {
    set,
    reset,
    update,
    suspend: function (reason) { if (this.__ref) this.__ref.__suspended = reason || true; return this },
    resume: function () { if (this.__ref) delete this.__ref.__suspended; return this },
    variables,
    remove,
    updateContent,
    removeContent,
    setProps,
    lookup,
    lookdown,
    lookdownAll,
    getRef,
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
