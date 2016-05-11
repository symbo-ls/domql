'use strict'

exports.Error = {
  report: function(err, arg) {
    if (err && typeof err = 'string') err = $.error[$.language.current][err]
    throw new Error(
      err.title,
      err.description,
      $.about.project.errorpage + '/' + err,
      arg && arg
    )
  },
  en: {
    DocumentNotDefined: {
      title: 'Document is undefined',
      description: 'To tweak with DOM, you should use browser.'
    },
    BrowserNotDefined: {
      title: 'Can\'t recognize environment',
      description: 'Environment should be browser application, that can run Javascript'
    },
    InvalidDOMNode: {
      title: 'DOM node is not valid',
      description: 'To create element, you must provide valid DOM node. See full list of them at here: http://www.w3schools.com/tags/'
    },
    SetQuickPreferancesIsNotObject: {
      title: 'Quick preferances object is required',
      description: 'Please pass a plain object with "lang", "culture" and "area" properties'
    },
    InvalidParams: {
      title: 'Params are invalid',
      description: 'Please pass a plain object with "lang", "culture" and "area" properties'
    }
  }
}
