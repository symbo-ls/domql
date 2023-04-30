
import { exec, is, isArray, isObject, isString, deepClone, deepMerge } from '@domql/utils'
import { IGNORE_PROPS_PARAMS } from './ignore'

const objectizeStringProperty = propValue => {
  if (is(propValue)('string', 'number')) return { inheritedString: propValue }
  return propValue
}

const inheritParentProps = (element, parent) => {
  let propsStack = []
  const parentProps = exec(parent, parent.state).props

  const matchParent = parent.props && parentProps[element.key]
  const matchParentIsString = isString(matchParent)
  const matchParentChildProps = parentProps && parentProps.childProps

  if (matchParent) {
    if (matchParentIsString) {
      const inheritedStringExists = propsStack.filter(v => v.inheritedString)[0]
      if (inheritedStringExists) inheritedStringExists.inheritedString = matchParent
      else {
        propsStack = [].concat(objectizeStringProperty(matchParent), propsStack)
      }
    } else {
      propsStack.push(objectizeStringProperty(matchParent))
    }
  }
  if (matchParentChildProps) propsStack.push(matchParentChildProps)

  return propsStack
}

const createPropsStack = (element, parent) => {
  const { props, __ref } = element
  const propsStack = __ref.__props = inheritParentProps(element, parent)

  if (isObject(props)) propsStack.push(props)
  else if (props === 'inherit' && parent.props) propsStack.push(parent.props)
  else if (props) propsStack.push(props)

  if (isArray(__ref.__extend)) {
    __ref.__extend.forEach(extend => {
      if (extend.props) propsStack.push(extend.props)
    })
  }

  __ref.__props = propsStack

  return propsStack
}

export const syncProps = (props, element) => {
  element.props = {}
  const mergedProps = { update, __element: element }
  props.forEach(v => {
    if (IGNORE_PROPS_PARAMS.includes(v)) return
    const execProps = exec(v, element)
    if (isObject(execProps) && execProps.__element) return
    element.props = deepMerge(
      mergedProps,
      deepClone(execProps, IGNORE_PROPS_PARAMS),
      IGNORE_PROPS_PARAMS
    )
  })
  element.props = mergedProps
  return element.props
}

export const createProps = function (element, parent, cached) {
  const propsStack = cached || createPropsStack(element, parent)
  const { __ref } = element

  if (propsStack.length) {
    __ref.__props = propsStack
    syncProps(propsStack, element)
    element.props.update = update
  }

  return element
}

export const updateProps = (newProps, element, parent) => {
  const { __ref } = element
  let propsStack = __ref.__props

  const parentProps = inheritParentProps(element, parent)
  if (parentProps) propsStack = __ref.__props = [].concat(parentProps, propsStack)
  if (newProps) propsStack = __ref.__props = [].concat(newProps, propsStack)

  if (propsStack) syncProps(propsStack, element)

  // console.log(cachedProps)
  return element
}

function update (props, options) {
  const element = this.__element
  element.update({ props }, options)
}

export { IGNORE_PROPS_PARAMS }
