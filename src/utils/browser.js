'use strict'

export default {
  // Safari 3.0+ "[object HTMLElementConstructor]"
  safari: /constructor/i.test(window.HTMLElement) || (
    p => p.toString() === '[object SafariRemoteNotification]'
  )(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)), // eslint-disable-line

  // Opera 8.0+
  opera: (!!window.opr && !!opr.addons) || // eslint-disable-line
    !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,

  // Firefox 1.0+
  firefox: typeof InstallTrigger !== 'undefined',

  // Internet Explorer 6-11
  IE: /* @cc_on!@ */ false || !!document.documentMode,

  // Edge 20+
  edge: (false || !!document.documentMode) && !!window.StyleMedia,

  // Chrome 1 - 71
  chrome: !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)
}
