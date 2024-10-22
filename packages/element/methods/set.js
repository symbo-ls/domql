'use strict'

import { merge, overwrite } from '@domql/utils'

import set, { reset } from '../set'
import update from '../update'

import {
  lookup,
  lookdown,
  lookdownAll,
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
  previousElement
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
    error
  }
  if (element.context.methods) (options.strict ? merge : overwrite)(proto, element.context.methods)
  Object.setPrototypeOf(element, proto)
}
