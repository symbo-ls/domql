'use strict'

import {
  isArray,
  deepClone,
  isFunction,
  isObject,
  isString,
  removeFromArray,
  removeFromObject,
  overwriteDeep,
  createNestedObject,
  getInObjectByPath,
  removeNestedKeyByPath,
  setInObjectByPath,
  deepMerge
} from '@domql/utils'

import { IGNORE_STATE_PARAMS } from './ignore.js'

export const parse = function () {
  const state = this
  if (isObject(state)) {
    const obj = {}
    for (const param in state) {
      if (!IGNORE_STATE_PARAMS.includes(param)) {
        obj[param] = state[param]
      }
    }
    return obj
  } else {
  }
}

export const clean = async function (options = {}) {
  const state = this
  for (const param in state) {
    if (
      !IGNORE_STATE_PARAMS.includes(param) &&
      Object.hasOwnProperty.call(state, param)
    ) {
      delete state[param]
    }
  }
  if (!options.preventStateUpdate) {
    await state.update(state, { replace: true, ...options })
  }
  return state
}

export const destroy = async function (options = {}) {
  const state = this
  const element = state.__element

  const stateKey = element.__ref.__state
  if (isString(stateKey)) {
    await element.parent.state.remove(stateKey, { isHoisted: true, ...options })
    return element.state
  }

  delete element.state
  element.state = state.parent

  if (state.parent) {
    delete state.parent.__children[element.key]
  }

  if (state.__children) {
    for (const key in state.__children) {
      const child = state.__children[key]
      if (child.state) {
        if (isArray(child.state)) {
          Object.defineProperty(child.state, 'parent', {
            value: state.parent,
            enumerable: false, // Set this to true if you want the method to appear in for...in loops
            configurable: true, // Set this to true if you want to allow redefining/removing the property later
            writable: true // Set this to true if you want to allow changing the function later
          })
        } else {
          Object.setPrototypeOf(child, { parent: state.parent })
        }
      }
    }
  }

  await element.state.update({}, { isHoisted: true, ...options })
  return element.state
}

export const parentUpdate = async function (obj, options = {}) {
  const state = this
  if (!state || !state.parent) return
  return await state.parent.update(obj, { isHoisted: true, ...options })
}

export const rootUpdate = async function (obj, options = {}) {
  const state = this
  if (!state) return
  const rootState = state.__element.__ref.root.state
  return await rootState.update(obj, { isHoisted: false, ...options })
}

export const add = async function (value, options = {}) {
  const state = this
  if (isArray(state)) {
    await state.push(value)
    return await state.update(state.parse(), { overwrite: true, ...options })
  } else if (isObject(state)) {
    const key = Object.keys(state).length
    return await state.update({ [key]: value }, options)
  }
}

export const toggle = async function (key, options = {}) {
  const state = this
  return await state.update({ [key]: !state[key] }, options)
}

export const remove = async function (key, options = {}) {
  const state = this
  if (isArray(state)) removeFromArray(state, key)
  if (isObject(state)) removeFromObject(state, key)
  if (options.applyReset)
    return await state.set(state.parse(), { replace: true, ...options })
  return await state.update()
}

export const set = async function (val, options = {}) {
  const state = this
  const value = deepClone(val)
  await state.clean({ preventStateUpdate: true, ...options })
  await state.replace(value, options)
  return state
}

export const setByPath = async function (path, val, options = {}) {
  const state = this
  const value = deepClone(val)
  if (!options.preventReplace) setInObjectByPath(state, path, val)
  const update = createNestedObject(path, value)
  if (options.preventStateUpdate) return update
  return await state.update(update, options)
}

export const setPathCollection = async function (changes, options = {}) {
  const state = this
  const update = await changes.reduce(async (promacc, change) => {
    const acc = await promacc
    if (change[0] === 'update') {
      const result = await setByPath.call(state, change[1], change[2], {
        ...options,
        preventStateUpdate: true
      })
      return overwriteDeep(acc, result)
    } else if (change[0] === 'delete') {
      await removeByPath.call(state, change[1], options)
      // we are doing this to create empty nested
      // by removed path to show as changed property
      const removedFromPath = change[1].slice(0, -1)
      const removedFromValue = getInObjectByPath(state, removedFromPath)
      const result = createNestedObject(
        removedFromPath,
        isObject(removedFromValue) ? {} : []
      )
      return deepMerge(acc, result)
    }
    return acc
  }, {})
  return await state.update(update, options)
}

export const removeByPath = async function (path, options = {}) {
  const state = this
  removeNestedKeyByPath(state, path)
  if (options.preventUpdate) return path
  return await state.update({}, options)
}

export const removePathCollection = async function (changes, options = {}) {
  const state = this
  changes.forEach(async (item) => {
    await removeByPath(item, { preventUpdate: true })
  })
  return await state.update({}, options)
}

export const getByPath = function (path, options = {}) {
  const state = this
  return getInObjectByPath(state, path)
}

export const reset = async function (options = {}) {
  const state = this
  const value = deepClone(state.parse())
  return await state.set(value, { replace: true, ...options })
}

export const apply = async function (func, options = {}) {
  const state = this
  if (isFunction(func)) {
    const value = func(state)
    return await state.update(value, { replace: true, ...options })
  }
}

export const applyReplace = async function (func, options = {}) {
  const state = this
  if (isFunction(func)) {
    const value = func(state)
    return await state.replace(value, options)
  }
}

export const applyFunction = async function (func, options = {}) {
  const state = this
  if (isFunction(func)) {
    const result = func(state)
    if (result instanceof Promise) await result
    else result
    return await state.update(state.parse(), { replace: true, ...options })
  }
}

export const quietUpdate = async function (obj, options = {}) {
  const state = this
  return await state.update(obj, { preventUpdate: true, ...options })
}

export const replace = async function (obj, options = {}) {
  const state = this

  for (const param in obj) {
    state[param] = obj[param]
  }

  return await state.update(obj, options)
}

export const quietReplace = async function (obj, options = {}) {
  const state = this
  return await state.replace(obj, { preventUpdate: true, ...options })
}

export const keys = function (obj, options = {}) {
  const state = this
  return Object.keys(state)
}

export const values = function (obj, options = {}) {
  const state = this
  return Object.values(state)
}
