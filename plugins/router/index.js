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
  const options = { ...defaultOptions, ...element.context.routerOptions, ...passedOptions }
  lastLevel = options.lastLevel
  const newElementKey = options.newElementKey

  const [pathname, hash] = path.split('#')

  const rootNode = element.node
  const route = getActiveRoute(options.level, pathname)
  const content = element.routes[route || '/'] || element.routes['/*']
  const scrollNode = options.scrollToNode ? rootNode : options.scrollNode
  const hashChanged = hash && hash !== window.location.hash.slice(1)
  const pathChanged = pathname !== lastPathname
  lastPathname = pathname

  if (!content) return
  if (options.pushState) {
    window.history.pushState(state, null, pathname + (hash ? `#${hash}` : ''))
  }

  if (pathChanged || !hashChanged) {
    if (options.updateState) {
      element.state.update({ route, hash }, { preventContentUpdate: true })
    }

    if (newElementKey && options.removeOldElement) {
      element[newElementKey].remove()
    }
    element.set({
      tag: options.useFragment && 'fragment',
      extend: content
    }, { newElementKey })
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
    const activeNode = document.getElementById(hash)
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
