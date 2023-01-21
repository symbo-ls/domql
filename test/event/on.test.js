'use strict'

import create from '../../src/element/create'

test('check if all element events are firing', () => {
  var events = {
    on: {
      init: (element) => {
        expect(element).toStrictEqual(events)
      },
      render: (element, state) => {
        expect(element).toStrictEqual(events)
      },
      click: (event, element) => {
        expect(event).toBeInstanceOf(global.Event)
      },
      change: (event, element) => {
        expect(event).toBeInstanceOf(global.Event)
      },
      mouseDown: (event, element) => {
        expect(event).toBeInstanceOf(global.Event)
      },
      mouseMove: (event, element) => {
        expect(event).toBeInstanceOf(global.Event)
      },
      mouseUp: (event, element) => {
        expect(event).toBeInstanceOf(global.Event)
      },
      keyDown: (event, element) => {
        expect(event).toBeInstanceOf(global.Event)
      },
      keyUp: (event, element) => {
        expect(event).toBeInstanceOf(global.Event)
      },
      load: (event, element) => {
        expect(event).toBeInstanceOf(global.Event)
      },
      input: (event, element) => {
        expect(event).toBeInstanceOf(global.Event)
      }
    }
  }
  create(events)
})
