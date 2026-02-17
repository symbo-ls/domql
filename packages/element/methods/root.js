export function getRootState(param) {
  let state = null
  const hasRootState = (obj) => obj.__element && obj.root?.isRootState
  if (!this) {
    state = window.platformState || window.smblsApp?.state
  } else if (hasRootState(this)) {
    state = this.root
  } else if (this.__ref && this.__ref.path) {
    const hasPlatformState = this.state && hasRootState(this.state)
    const hasPlatformStateOnParent =
      this.call('isFunction', this.state) &&
      this.parent.state &&
      hasRootState(this.parent.state)
    if (hasPlatformState || hasPlatformStateOnParent) {
      state = this.state.root || this.parent.state.root
    }
  }
  if (!state) {
    state = window.platformState || window.smblsApp?.state
  }
  return param ? state[param] : state
}

export function getRef(key) {
  if (key) {
    return this.__ref && this.__ref[key]
  }
  return this.__ref
}

export function getChildren() {
  const __children = this.getRef('__children')
  return __children?.map((k) => this[k])
}

export function getRoot(key) {
  const rootElem = this.getRootState()?.__element
  return rootElem && Object.keys(rootElem).length > 0 && key
    ? rootElem[key]
    : rootElem
}

export function getRootData(key) {
  return this.getRoot('data') &&
    Object.keys(this.getRoot('data')).length > 0 &&
    key
    ? this.getRoot('data')[key]
    : this.getRoot('data')
}

export function getRootContext(key) {
  const ctx = this.getRoot()?.context
  return key ? ctx[key] : ctx
}

export function getContext(key) {
  const ctx = this.context
  return key ? ctx[key] : ctx
}
