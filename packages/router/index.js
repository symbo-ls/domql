'use strict'

export const splitRoute = (route = window.location.pathname) => route.split('/')

export const router = (rootElement, path, state = {}, level = 0, pushState = true) => {
  const route = path || window.location.pathname

  if (path.slice(0, 1) === '#') {
    window.location.hash = path
  }

  const routes = splitRoute(route)
  let currentRoute = routes[level + 1]

  const hasHash = currentRoute.split('#')
  if (hasHash[1]) currentRoute = hasHash[0]

  const content = rootElement.routes[`/${currentRoute}`]

  if (content) {
    currentRoute = `/${currentRoute}`
    if (hasHash[1]) currentRoute += `#${hasHash[1]}`
    if (pushState) window.history.pushState(state, null, currentRoute)

    const newContent = rootElement.set({ proto: content }).content.node
    newContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
    console.log(newContent)
    if (hasHash[1]) {
      // window.location.hash = hasHash[1]
      document.getElementById(hasHash[1]).scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (level === 0) rootElement.state.update({ currentRoute })
}
