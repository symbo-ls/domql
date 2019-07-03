'use strict'

import err from '..'

var setCurrent = (code) => {
  if (this.list.hasOwnProperty(code)) {
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
