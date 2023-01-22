'use strict'

import { document, window } from '@domql/globals'

export const getScrollPositions = () => {
  if (global.pageYOffset !== undefined) {
    return [global.pageXOffset, window.pageYOffset]
  } else {
    const d = document
    const r = d.documentElement
    const b = d.body
    const sx = r.scrollLeft || b.scrollLeft || 0
    const sy = r.scrollTop || b.scrollTop || 0
    return [sx, sy]
  }
}
