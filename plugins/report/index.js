'use strict'

export const ERRORS_REGISTRY = {
  en: {
    DocumentNotDefined: {
      title: 'Document is undefined',
      description: 'To tweak with DOM, you should use browser.'
    },
    OverwriteToBuiltin: {
      title: 'Overwriting to builtin method',
      description:
        'Overwriting a builtin method in the window define is not possible, please choose different name'
    },
    BrowserNotDefined: {
      title: "Can't recognize environment",
      description:
        'Environment should be browser application, that can run Javascript'
    },
    SetQuickPreferancesIsNotObject: {
      title: 'Quick preferances object is required',
      description:
        'Please pass a plain object with "lang", "culture" and "area" properties'
    },
    InvalidParams: {
      title: 'Params are invalid',
      description:
        'Please pass a plain object with "lang", "culture" and "area" properties'
    },
    CantCreateWithoutNode: {
      title: 'You must provide node',
      description: "Can't create DOM element without setting node or text"
    },
    HTMLInvalidTag: {
      title: 'Element tag name (or DOM nodeName) is invalid',
      description:
        'To create element, you must provide valid DOM node. See full list of them at here: http://www.w3schools.com/tags/'
    },
    HTMLInvalidAttr: {
      title: 'Attibutes object is invalid',
      description:
        'Please pass a valid plain object to apply as an attributes for a DOM node'
    },
    HTMLInvalidData: {
      title: 'Data object is invalid',
      description:
        'Please pass a valid plain object to apply as an dataset for a DOM node'
    },
    HTMLInvalidStyles: {
      title: 'Styles object is invalid',
      description:
        'Please pass a valid plain object to apply as an style for a DOM node'
    },
    HTMLInvalidText: {
      title: 'Text string is invalid',
      description: 'Please pass a valid string to apply text to DOM node'
    },
    ElementOnStateIsNotDefined: {
      title: 'Element on state is not defined',
      description: 'Please check the element object'
    }
  }
}

export const report = (err, arg, element) => {
  const currentLang = 'en'
  let errObj
  if (err && typeof err === 'string') errObj = ERRORS_REGISTRY[currentLang][err]

  return new Error(
    `"${err}", "${arg}"\n\n`,
    `${errObj.description}`,
    element ? `\n\n${element}` : ''
  )
}
