'use strict'

const global = globalThis
const self = globalThis
const window = globalThis
const document = (this || window).document // eslint-disable-line

export { global, self, window, document }
