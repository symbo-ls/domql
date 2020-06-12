'use strict'

import Report from '..'

var setCurrent = (code) => {
  var hasProperty = Object.prototype.hasOwnProperty.call(this.list, code)
  if (hasProperty) {
    this.current = code
  }
}

var setQuickPreferences = (prefsObj) => {
  if (!prefsObj || typeof prefsObj !== 'object') {
    return err('setQuickPreferencesIsNotObject')
  }
}

export default {
  setCurrent,
  setQuickPreferences
}
