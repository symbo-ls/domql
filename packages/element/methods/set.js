'use strict'

import { merge, overwrite } from '@domql/utils'

import { set, reset } from '../set'
import { update } from '../update'

import {
  lookup,
  lookdown,
  lookdownAll,
  getRef,
  getPath,
  setNodeStyles,
  setProps,
  remove,
  spotByPath,
  log,
  verbose,
  warn,
  error,
  variables,
  keys,
  parse,
  parseDeep,
  nextElement,
  previousElement,
  call
} from './'

import { removeContent, updateContent } from '../mixins/content'

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
    call
  }
  if (element.context.methods) (options.strict ? merge : overwrite)(proto, element.context.methods)
  Object.setPrototypeOf(element, proto)
}
