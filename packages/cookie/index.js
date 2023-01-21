'use strict'

export const isMobile = (() => /Mobi/.test(navigator.userAgent))()

export const setCookie = (cname, cvalue, exdays = 365) => {
  const d = new Date()
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
  const expires = `expires=${d.toUTCString()}`
  global.cookie = `${cname}=${cvalue};${expires};path=/`
}

export const getCookie = (cname) => {
  const name = `${cname}=`
  const decodedCookie = decodeURIComponent(global.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1)
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length)
  }
  return ''
}
