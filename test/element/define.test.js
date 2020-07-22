'use strict'

import 'regenerator-runtime/runtime'
import { create, define } from '../../src/element'
import { registry } from '../../src/element/params'

define({
  stand: param => `stands ${param}min`
}, { overwrite: false })

var dude = create({
  walk: 84,
  define: {
    walk: param => `walks ${param}km`
  }
})

test('should SET element', () => {
  expect(dude.walk).toBe(`walks 84km`)
  expect(registry.stand(12)).toBe(`stands 12min`)
})
