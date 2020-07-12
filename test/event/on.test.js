'use strict'

import 'regenerator-runtime/runtime'
import create from '../../src/element/create'

test('check if all element events are firing', () => {
  create({
    on: {
      init: (element) => {
      },
      render: (element, state) => {
      },
      click: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      change: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      down: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      move: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      up: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      load: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      input: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      }
    }
  })
})
