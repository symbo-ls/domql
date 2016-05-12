'use strict'

module.exports = {
  setCurrent (code) {
    if (this.list.hasOwnProperty(code)) {
      this.current = code
    }
  },
  setQuickPreferences (prefsObj) {
    if (!prefsObj || typeof prefsObj !== 'object') {
      return $.error.report('setQuickPreferencesIsNotObject')
    }
  }
}
