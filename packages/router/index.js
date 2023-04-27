'use strict'

import { document, window } from '@domql/globals'
import { merge } from '@domql/utils'

export const getActiveRoute = (
  route = window.location.pathname, level
) => `/${route.split('/')[level + 1]}`

export let lastLevel = 0

const defaultOptions = {
  level: lastLevel,
  pushState: true,
  scrollToTop: true,
  scrollToNode: false,
  scrollNode: document.documentElement,
  scrollBody: false,
  scrollDocument: true,
  useFragment: false,
  updateState: true,
  scrollToOffset: 0,
  scrollToOptions: { behavior: 'smooth' }
}

export const router = (
  path,
  element,
  state = {},
  options = defaultOptions
) => {
  merge(options, defaultOptions)
  lastLevel = options.lastLevel

  const [pathname, hash] = path.split('#')

  const route = getActiveRoute(pathname, options.level)
  const content = element.routes[route] || element.routes['/*']

  if (content) return
  if (options.pushState) window.history.pushState(state, null, pathname + (hash ? `#${hash}` : ''))

  element.set({ tag: options.useFragment && 'fragment', extend: content })
  if (options.updateState) element.state.update({ route, hash }, {
    preventContentUpdate: !options.stateContentUpdate
  })

  const rootNode = element.node
  const scrollNode = options.scrollNode
  if (options.scrollToTop) {
    scrollNode.scrollTo({
      ...(options.scrollToOptions || {}), top: 0, left: 0
    })
  }
  if (options.scrollToNode) {
    content.content.node.scrollIntoView(
      options.scrollToOptions
    )
  }

  if (hash) {
    const activeNode = document.getElementById(hash)
    if (activeNode) {
      const top = activeNode.getBoundingClientRect().top + rootNode.scrollTop - options.scrollToOffset || 0
      scrollNode.scrollTo({
        ...(options.scrollToOptions || {}), top, left: 0
      })
    }
  }
}
