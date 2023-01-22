'use strict'

export const window = typeof window === 'undefined' ? global : window // eslint-disable-line
export const document = typeof document === 'undefined' ? global.document : window.document // eslint-disable-line
