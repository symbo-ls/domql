'use strict'

import { isFunction, isObject, isObjectLike } from '../utils'
import { registry } from './mixins'
import { removeContentElement } from './set'

const ENV = process.env.NODE_ENV

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
  if (isFunction(element.node.remove)) element.node.remove()
  else if (ENV === 'test' || ENV === 'development') {
    console.warn('This item cant be removed')
    element.log()
  }
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

export const setProps = function (param, options) {
  const element = this
  if (!param || !element.props) return
  element.update({ props: param }, options)
  return element.props
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

export const parseDeep = function (param) {
  const element = this
  const orig = param || element
  const obj = {}
  const keys = orig.keys && orig.keys()
  if (!keys) return
  keys.forEach(v => {
    const prop = orig[v]
    if (isObjectLike(prop)) parseDeep(prop)
    else obj[v] = prop
  })
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
    param === 'removeContent' ||
    param === 'lookup' ||
    param === 'keys' ||
    param === 'parse' ||
    param === 'setProps' ||
    param === 'parseDeep' ||
    param === 'if' ||
    param === 'log'
}
