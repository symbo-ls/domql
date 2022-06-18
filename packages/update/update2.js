
export const update2 = (element, params, options) => {
  // const execChanges = throughUpdatedExec(element, UPDATE_DEFAULT_OPTIONS)

  // if (UPDATE_DEFAULT_OPTIONS.stackChanges) {
  //   const stackChanges = merge(execChanges, overwriteChanges)
  //   const { __changes } = ref
  //   if (!__changes) ref.__changes = []
  //   __changes.push(stackChanges)
  // }

  for (const param in element) {
    const prop = element[param]
    const defaultMethod = DEFAULT_METHODS[param]

    if (isMethod(param) || isObject(defaultMethod) || prop === undefined) continue

    if (defaultMethod && isFunction(defaultMethod)) defaultMethod(prop, element)
    if (prop && isObject(prop)) {
      update(prop, params[prop], UPDATE_DEFAULT_OPTIONS)
    }
  }

  if (element.on && isFunction(element.on.update)) {
    on.update(element.on.update, element, element.state)
  }

  return element
}

export function updateMethod (params = {}, options = UPDATE_DEFAULT_OPTIONS) {
  const element = this
  update(element, params, options)
}
