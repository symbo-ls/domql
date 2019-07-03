'use strict'

var errors = {
  en: {
    DocumentNotDefined: {
      title: 'Document is undefined',
      description: 'To tweak with DOM, you should use browser.'
    },
    BrowserNotDefined: {
      title: 'Can\'t recognize environment',
      description: 'Environment should be browser application, that can run Javascript'
    },
    SetQuickPreferancesIsNotObject: {
      title: 'Quick preferances object is required',
      description: 'Please pass a plain object with "lang", "culture" and "area" properties'
    },
    InvalidParams: {
      title: 'Params are invalid',
      description: 'Please pass a plain object with "lang", "culture" and "area" properties'
    },
    CantCreateWithoutNode: {
      title: 'You must provide node',
      description: 'Can\'t create DOM element without setting node or text'
    },
    HTMLInvalidTag: {
      title: 'Element tag name (or DOM nodeName) is invalid',
      description: 'To create element, you must provide valid DOM node. See full list of them at here: http://www.w3schools.com/tags/'
    },
    HTMLInvalidAttr: {
      title: 'Attibutes object is invalid',
      description: 'Please pass a valid plain object to apply as an attributes for a DOM node'
    },
    HTMLInvalidStyles: {
      title: 'Styles object is invalid',
      description: 'Please pass a valid plain object to apply as an style for a DOM node'
    },
    HTMLInvalidText: {
      title: 'Text string is invalid',
      description: 'Please pass a valid string to apply text to DOM node'
    }
  }
}

var report = (err, arg) => {
  var currentLang = 'en'
  var errObj
  if (err && typeof err === 'string') errObj = errors[currentLang][err]

  throw new Error(
    err + '. ' +
    errObj.title + '. ' +
    errObj.description + ' -> ' +
    (arg && JSON.stringify(arg))
  )
}

export default report
