'use strict'

import { createExtendsFromKeys } from './extends.js'
import { isString } from './types.js'

export const matchesComponentNaming = key => {
  const isFirstKeyString = isString(key)
  if (!isFirstKeyString) return
  const firstCharKey = key.slice(0, 1)
  return /^[A-Z]*$/.test(firstCharKey)
}

export function getCapitalCaseKeys (obj) {
  return Object.keys(obj).filter(key => /^[A-Z]/.test(key))
}

export function getSpreadChildren (obj) {
  return Object.keys(obj).filter(key => /^\d+$/.test(key))
}

export function isContextComponent (initialElement, parent, key) {
  const { context } = parent || {}
  const extendFromKey = createExtendsFromKeys(key)[0]
  return context?.components?.[extendFromKey] || context?.pages?.[extendFromKey]
}
