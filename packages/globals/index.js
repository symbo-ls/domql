'use strict'

const window = typeof window === 'undefined' ? global : window // eslint-disable-line
const document = typeof document === 'undefined' ? {} : window.document // eslint-disable-line

export { window, document }
