'use strict'

import { document, window } from '@domql/globals'
import { merge } from '@domql/utils'

export const getActiveRoute = (
  route = window.location.pathname, level
) => `/${route.split('/')[level + 1]}`

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
  console.warn(pathname, path, hash)

  const rootNode = element.node
  const route = getActiveRoute(pathname, options.level)
  const content = element.routes[route] || element.routes['/*']
  const scrollNode = options.scrollDocument ? document.documentElement : rootNode
  const hashChanged = hash && hash !== window.location.hash.slice(1)
  const pathChanged = pathname !== lastPathname
  lastPathname = pathname

  if (content) {
    if (options.pushState) window.history.pushState(state, null, route + (hash ? `#${hash}` : ''))

    if (pathChanged || !hashChanged) {
      element.set({ tag: options.useFragment && 'fragment', extend: content })
      if (options.updateState) {
        element.state.update({ route, hash }, {
          preventContentUpdate: !options.stateContentUpdate
        })
      }
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
  }

  console.log('HASH', hash)
  if (hash) {
    const activeNode = document.getElementById(hash)
    console.log(hash, activeNode)
    if (activeNode) {
      const top = activeNode.getBoundingClientRect().top + rootNode.scrollTop - options.scrollToOffset || 0
      scrollNode.scrollTo({
        ...(options.scrollToOptions || {}), top, left: 0
      })
    }
  }
}

export default router
