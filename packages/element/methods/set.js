'use strict'

import { isDevelopment } from '@domql/utils'

import set from '../set'
import update from '../update'

import {
  lookup,
  lookdown,
  setProps,
  remove,
  spotByPath,
  log,
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
    update: update.bind(element),
    remove: remove.bind(element),
    updateContent: updateContent.bind(element),
    removeContent: removeContent.bind(element),
    setProps: setProps.bind(element),
    lookup: lookup.bind(element),
    lookdown: lookdown.bind(element),
    spotByPath: spotByPath.bind(element),
    parse: parse.bind(element),
    parseDeep: parseDeep.bind(element),
    keys: keys.bind(element),
    nextElement: nextElement.bind(element),
    previousElement: previousElement.bind(element)
  }
  if (isDevelopment()) proto.log = log.bind(element)
  Object.setPrototypeOf(element, proto)
}
