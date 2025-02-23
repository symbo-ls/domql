'use strict'

import { isString } from './types.js'

export const matchesComponentNaming = key => {
  const isFirstKeyString = isString(key)
  if (!isFirstKeyString) return
  const firstCharKey = key.slice(0, 1)
  return /^[A-Z]*$/.test(firstCharKey)
}

export const extractComponentKeyFromElementKey = key => {
  if (key.includes('+')) {
    return key.split('+')
  }

  if (key.includes('_')) {
    return [key.split('_')[0]]
  }

  if (key.includes('.') && !matchesComponentNaming(key.split('.')[1])) {
    return [key.split('.')[0]]
  }

  return [key]
}

export function getCapitalCaseKeys (obj) {
  return Object.keys(obj).filter(key => /^[A-Z]/.test(key))
}

export function getSpreadChildren (obj) {
  return Object.keys(obj).filter(key => /^\d+$/.test(key))
}
