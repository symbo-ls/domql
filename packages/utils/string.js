'use strict'

export const stringIncludesAny = (str, characters) => {
  for (const char of characters) {
    if (str.includes(char)) {
      return true
    }
  }
  return false
}

export const trimStringFromSymbols = (str, characters) => {
  // Create a regular expression pattern to match the specified symbols
  const pattern = new RegExp(`[${characters.join('\\')}]`, 'g')

  // Replace matched symbols with an empty string
  return str.replace(pattern, '')
}

/**
 * Replaces placeholders in a string with corresponding {{ }} values from an object.
 *
 * @param {string} str - The string containing placeholders to replace.
 * @param {object} state - The object containing the values to substitute.
 * @returns {string} The modified string with placeholders replaced by values from the object.
 */
const brackRegex = {
  2: /\{\{\s*((?:\.\.\/)+)?([^}\s]+)\s*\}\}/g,
  3: /\{\{\{\s*((?:\.\.\/)+)?([^}\s]+)\s*\}\}\}/g
}

export const replaceLiteralsWithObjectFields = (str, state, options = {}) => {
  if (!str.includes(options.bracketsLength === 3 ? '{{{' : '{{')) return str
  const reg = brackRegex[options.bracketsLength || 2]
  return str.replace(reg, (_, parentPath, variable) => {
    if (parentPath) {
      const parentLevels = parentPath.match(options.bracketsLength === 3 ? /\.\.\.\//g : /\.\.\//g).length
      let parentState = state
      for (let i = 0; i < parentLevels; i++) {
        parentState = parentState.parent
        if (!parentState) {
          return '' // Return an empty string if the parent level doesn't exist
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

export const lowercaseFirstLetter = (inputString) => {
  return `${inputString.charAt(0).toLowerCase()}${inputString.slice(1)}`
}
