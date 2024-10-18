'use strict'

import { isDevelopment, merge } from '@domql/utils'

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
  variables,
  keys,
  parse,
  parseDeep,
  nextElement,
  previousElement
} from './'

import { removeContent, updateContent } from '../mixins/content'

export const addMethods = (element, parent, options) => {
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
    previousElement
  }
  if (element.context.methods) merge(proto, element.context.methods)
  if (isDevelopment()) proto.log = log
  Object.setPrototypeOf(element, proto)
}
