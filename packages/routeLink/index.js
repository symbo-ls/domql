'use strict'

import { Link } from '@rackai/symbols'
import { deepMerge } from '@domql/utils'
import { router } from '@domql/router'

const RouteLink = {
  on: {
    click: (event, element, state) => {
      const root = element.lookup('app')
      const { href } = element.props
      const firstThree = href[0] + href[1] + href[2]
      if (href && firstThree !== 'htt' && firstThree !== 'ske') {
        router(root, href, {})
        event.preventDefault()
      }
    }
  }
}

deepMerge(Link, RouteLink)

export default RouteLink
