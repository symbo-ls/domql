'use strict'

export const getScrollPositions = () => {
  if (window.pageYOffset !== undefined) {
    return [window.pageXOffset, window.pageYOffset]
  } else {
    var d = document
    var r = d.documentElement
    var b = d.body
    var sx = r.scrollLeft || b.scrollLeft || 0
    var sy = r.scrollTop || b.scrollTop || 0
    return [sx, sy]
  }
}
