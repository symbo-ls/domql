'use strict'

import { isUndefined } from './types'
import { document } from '@domql/utils'

export const isMobile = (() => typeof navigator === 'undefined'
  ? false
  : /Mobi/.test(navigator.userAgent))()

export const setCookie = (cname, cvalue, exdays = 365) => {
  if (isUndefined(document) || isUndefined(document.cookie)) return
  const d = new Date()
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
  const expires = `expires=${d.toUTCString()}`
  document.cookie = `${cname}=${cvalue};${expires};path=/`
}

export const getCookie = (cname) => {
  if (isUndefined(document) || isUndefined(document.cookie)) return
  const name = `${cname}=`
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1)
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length)
  }
  return ''
}

export const removeCookie = (cname) => {
  if (isUndefined(document) || isUndefined(document.cookie)) return
  document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}
