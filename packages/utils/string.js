'use strict'

export const stringIncludesAny = (str, characters) => {
  for (const char of characters) {
    if (str.includes(char)) {
      return true;
    }
  }
  return false;
}