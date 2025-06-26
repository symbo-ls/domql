'use strict'

import {
  isObject,
  isFunction,
  isNumber,
  isString,
  matchesComponentNaming,
  isContextComponent,
  isMethod,
  overwrite,
  exec
} from '@domql/utils'

export const throughInitialExec = (element, exclude = {}) => {
  const { __ref: ref } = element
  for (const param in element) {
    if (exclude[param]) continue
    const prop = element[param]
    if (isFunction(prop) && !isMethod(param, element)) {
      ref.__exec[param] = prop
      const result = prop(element, element.state, element.context)
      if (result && typeof result.then === 'function') {
        result.then(resolved => {
          element[param] = resolved
        })
      } else {
        element[param] = result
      }
    }
  }
}

export const throughUpdatedExec = (element, options = {}) => {
  const { __ref: ref } = element
  const changes = {}

  for (const param in ref.__exec) {
    const prop = element[param]

    const isDefinedParam = ref.__defineCache[param]
    if (isDefinedParam) continue

    const newExec = ref.__exec[param](element, element.state, element.context)
    if (newExec && typeof newExec.then === 'function') {
      newExec.then(resolved => {
        element[param] = resolved
      })
      continue
    }
    const execReturnsString = isString(newExec) || isNumber(newExec)
    // if (prop && prop.node && execReturnsString) {
    if (prop && prop.node && execReturnsString) {
      overwrite(prop, { text: newExec })
    } else if (newExec !== prop) {
      if (matchesComponentNaming(param)) {
        const { extends: extend, ...newElem } = isContextComponent(
          newExec,
          element,
          param
        )
        overwrite(prop, newElem)
      } else {
        changes[param] = prop
        element[param] = newExec
      }
    }
  }

  return changes
}

export const throughExecProps = element => {
  const { __ref: ref } = element
  const { props } = element
  for (const k in props) {
    const isDefine =
      k.startsWith('is') || k.startsWith('has') || k.startsWith('use')
    const cachedExecProp = ref.__execProps[k]
    if (isFunction(cachedExecProp)) {
      const result = exec(cachedExecProp, element)
      if (result && typeof result.then === 'function') {
        result.then(resolved => {
          props[k] = resolved
        })
      } else {
        props[k] = result
      }
    } else if (isDefine && isFunction(props[k])) {
      ref.__execProps[k] = props[k]
      const result = exec(props[k], element)
      if (result && typeof result.then === 'function') {
        result.then(resolved => {
          props[k] = resolved
        })
      } else {
        props[k] = result
      }
    }
  }
}

export const isPropertyInDefines = (key, element) => {}

export const throughInitialDefine = element => {
  const { define, context, __ref: ref } = element

  let defineObj = {}
  const hasGlobalDefine = context && isObject(context.define)
  if (isObject(define)) defineObj = { ...define }
  if (hasGlobalDefine) defineObj = { ...defineObj, ...context.define }

  for (const param in defineObj) {
    let elementProp = element[param]

    if (isFunction(elementProp) && !isMethod(param, element)) {
      ref.__exec[param] = elementProp
      let execParam = exec(elementProp, element)
      if (execParam && typeof execParam.then === 'function') {
        execParam.then(resolved => {
          elementProp = element[param] =
            resolved && resolved.parse ? resolved.parse() : resolved
          if (resolved) {
            ref.__defineCache[param] = elementProp
          }
        })
      } else {
        elementProp = element[param] =
          execParam && execParam.parse ? execParam.parse() : execParam
        if (execParam) {
          ref.__defineCache[param] = elementProp
        }
      }
    }

    const execParam = defineObj[param](
      elementProp,
      element,
      element.state,
      element.context
    )
    if (execParam && typeof execParam.then === 'function') {
      execParam.then(resolved => {
        if (resolved) element[param] = resolved
      })
    } else if (execParam) {
      element[param] = execParam
    }
  }
  return element
}

export const throughUpdatedDefine = element => {
  const { context, define, __ref: ref } = element
  const changes = {}

  let obj = {}
  if (isObject(define)) obj = { ...define }
  if (isObject(context && context.define)) obj = { ...obj, ...context.define }

  for (const param in obj) {
    const execParam = ref.__exec[param]
    if (execParam) {
      const result = execParam(element, element.state, element.context)
      if (result && typeof result.then === 'function') {
        result.then(resolved => {
          ref.__defineCache[param] = resolved
        })
      } else {
        ref.__defineCache[param] = result
      }
    }
    const cached = exec(ref.__defineCache[param], element)
    if (cached && typeof cached.then === 'function') {
      cached.then(resolved => {
        // Optionally assign or use resolved value if needed
      })
      continue
    }
    const newExecParam =
      typeof obj[param] === 'function'
        ? obj[param](cached, element, element.state, element.context)
        : undefined
    if (newExecParam && typeof newExecParam.then === 'function') {
      newExecParam.then(resolved => {
        element[param] = resolved
      })
    } else if (newExecParam) {
      element[param] = newExecParam
    }
  }
  return changes
}
