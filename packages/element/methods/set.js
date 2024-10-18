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

export const addMethods = (element, parent) => {
  const proto = {
    set: set.bind(element),
    reset: reset.bind(element),
    update: update.bind(element),
    variables: variables.bind(element),
    remove: remove.bind(element),
    updateContent: updateContent.bind(element),
    removeContent: removeContent.bind(element),
    setProps: setProps.bind(element),
    lookup: lookup.bind(element),
    lookdown: lookdown.bind(element),
    lookdownAll: lookdownAll.bind(element),
    setNodeStyles: setNodeStyles.bind(element),
    spotByPath: spotByPath.bind(element),
    parse: parse.bind(element),
    parseDeep: parseDeep.bind(element),
    keys: keys.bind(element),
    nextElement: nextElement.bind(element),
    previousElement: previousElement.bind(element)
  }
  if (element.context.methods) merge(proto, element.context.methods)
  if (isDevelopment()) proto.log = log.bind(element)
  Object.setPrototypeOf(element, proto)
}
