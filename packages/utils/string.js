'use strict'

export const stringIncludesAny = (str, characters) => {
  for (const char of characters) {
    if (str.includes(char)) {
      return true
    }
  }
  return false
}
/**
 * Replaces placeholders in a string with corresponding {{ }} values from an object.
 *
 * @param {string} str - The string containing placeholders to replace.
 * @param {object} state - The object containing the values to substitute.
 * @returns {string} The modified string with placeholders replaced by values from the object.
 */

const tokenRegex = /\{\{\s*((?:\.\.\/)+)?([^}\s]+)\s*\}\}/g

export const replaceLiteralsWithObjectFields = (str, state) => {
  if (!tokenRegex.test(str)) return str

  return str.replace(tokenRegex, (_, parentPath, variable) => {
    if (parentPath) {
      const parentLevels = parentPath.match(/\.\.\//g).length
      let parentState = state

      // Cache parent states
      const parentStateCache = {}
      for (let i = 0; i < parentLevels; i++) {
        if (!parentState) {
          return '' // Return an empty string if the parent level doesn't exist
        }

        const cachedState = parentStateCache[parentState]
        if (cachedState) {
          parentState = cachedState
        } else {
          parentState = parentState.parent
          parentStateCache[parentState] = parentState
        }
      }

      const value = parentState[variable.trim()]
      return value !== undefined ? `${value}` : ''
    } else {
      const value = state[variable.trim()]
      return value !== undefined ? `${value}` : ''
    }
  })
}
