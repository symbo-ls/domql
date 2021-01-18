'use strict'

import { isObject } from '../utils'
import { registry } from './params'

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

export const log = function (...args) {
  const element = this
  const newArgs = []
  for (const param in args) {
    const key = args[param]
    if (key === '*' || key === undefined) {
      const obj = {}
      element.keys().map(v => (obj[v] = element[v]))
      newArgs.push(obj)
    } else newArgs.push(element[key])
  }
}

export const keys = function () {
  const element = this
  const keys = []
  for (const param in element) if (!isObject(registry[param])) keys.push(param)
  return keys
}

export const isMethod = function (param) {
  return param === 'set' ||
    param === 'update' ||
    param === 'remove' ||
    param === 'lookup' ||
    param === 'keys' ||
    param === 'log'
}
