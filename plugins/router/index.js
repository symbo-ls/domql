'use strict'

import { triggerEventOn } from '@domql/event'
import { document, window } from '@domql/utils'

export const getActiveRoute = (level = 0, route = window.location.pathname) => {
  const routeArray = route.split('/')
  const activeRoute = routeArray[level + 1]
  if (activeRoute) return `/${activeRoute}`
}

export let lastPathname
export let lastLevel = 0

const defaultOptions = {
  level: lastLevel,
  pushState: true,
  initialRender: false,
  scrollToTop: true,
  scrollToNode: false,
  scrollNode: document && document.documentElement,
  scrollBody: false,
  useFragment: false,
  updateState: true,
  scrollToOffset: 0,
  scrollToOptions: { behavior: 'smooth' }
}

export const router = (
  path,
  element,
  state = {},
  passedOptions = {}
) => {
  const win = element.context.window || window
  const doc = element.context.document || document
  const options = { ...defaultOptions, ...element.context.routerOptions, ...passedOptions }
  lastLevel = options.lastLevel
  const contentElementKey = options.contentElementKey

  const urlObj = new win.URL(win.location.origin + path)
  const { pathname, search, hash } = urlObj

  const rootNode = element.node
  const route = getActiveRoute(options.level, pathname)
  const content = element.routes[route || '/'] || element.routes['/*']
  const scrollNode = options.scrollToNode ? rootNode : options.scrollNode
  const hashChanged = hash && hash !== win.location.hash.slice(1)
  const pathChanged = pathname !== lastPathname
  lastPathname = pathname

  if (!content || element.state.root.debugging) {
    element.state.root.debugging = false
    return
  }
  if (options.pushState) {
    win.history.pushState(state, null, pathname + (search || '') + (hash || ''))
  }

  if (pathChanged || !hashChanged) {
    if (options.updateState) {
      element.state.update({ route, hash, debugging: false }, { preventContentUpdate: true })
    }

    if (contentElementKey && options.removeOldElement) {
      element[contentElementKey].remove()
    }

    element.set({
      tag: options.useFragment && 'fragment',
      extend: content
    }, { contentElementKey })
  }

  if (options.scrollToTop) {
    scrollNode.scrollTo({
      ...(options.scrollToOptions || {}), top: 0, left: 0
    })
  }
  if (options.scrollToNode) {
    content.content.node.scrollTo({
      ...(options.scrollToOptions || {}), top: 0, left: 0
    })
  }

  if (hash) {
    const activeNode = doc.getElementById(hash)
    if (activeNode) {
      const top = activeNode.getBoundingClientRect().top + rootNode.scrollTop - options.scrollToOffset || 0
      scrollNode.scrollTo({
        ...(options.scrollToOptions || {}), top, left: 0
      })
    }
  }

  // trigger `on.routeChanged`
  triggerEventOn('routeChanged', element, options)
}

export default router
