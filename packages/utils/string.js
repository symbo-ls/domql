'use strict'

export const stringIncludesAny = (str, characters) => {
  for (const char of characters) {
    if (str.includes(char)) {
      return true
    }
  }
  return false
}

export const replaceLiteralsWithObjectFields = (str, state) => {
  return str.replace(/\{\{\s*((?:\.\.\/)+)?([^}\s]+)\s*\}\}/g, (_, parentPath, variable) => {
    if (parentPath) {
      const parentLevels = parentPath.match(/\.\.\//g).length
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
