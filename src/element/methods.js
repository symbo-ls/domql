'use strict'

import { isObject } from '../utils'
import { registry } from './mixins'

// TODO: update these files
export const lookup = function (key) {
  const element = this
  let { parent } = element

  while (parent.key !== key) {
    parent = parent.parent
    if (!parent) return
  }

  return parent
}

export const remove = function (params) {
  const element = this
  element.node.remove()
  delete element.parent[element.key]
}

export const get = function (param) {
  const element = this
  return element[param]
}

export const set = function () {
}

export const update = function () {
}

export const defineSetter = (element, key, get, set) =>
  Object.defineProperty(element, key, { get, set })

export const keys = function () {
  const element = this
  const keys = []
  for (const param in element) {
    if (!isObject(registry[param])) {
      keys.push(param)
    }
  }
  return keys
}

export const parse = function () {
  const element = this
  const obj = {}
  const keys = element.keys()
  keys.forEach(v => (obj[v] = element[v]))
  return obj
}

export const log = function (...args) {
  const element = this
  console.group(element.key)
  if (args.length) {
    args.forEach(v => console.log(`%c${v}:\n`, 'font-weight: bold', element[v]))
  } else {
    console.log(element.path)
    const keys = element.keys()
    keys.forEach(v => console.log(`%c${v}:\n`, 'font-weight: bold', element[v]))
  }
  console.groupEnd(element.key)
  return element
}

export const isMethod = function (param) {
  return param === 'set' ||
    param === 'update' ||
    param === 'remove' ||
    param === 'lookup' ||
    param === 'keys' ||
    param === 'parse' ||
    param === 'if' ||
    param === 'log'
}
