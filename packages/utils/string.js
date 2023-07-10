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
      const parentLevels = parentPath.split('../').filter(Boolean).length
      let parentState = state
      for (let i = 0; i < parentLevels; i++) {
        parentState = parentState.parent
      }
      const value = parentState[variable.trim()]
      return value ? `${value}` : ''
    } else {
      const value = state[variable.trim()]
      return value ? `${value}` : ''
    }
  })
}
