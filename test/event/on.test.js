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
        expect(event).toBeInstanceOf(window.Event)
      },
      change: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      mouseDown: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      mouseMove: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      mouseUp: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      keyDown: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      keyUp: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      load: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      },
      input: (event, element) => {
        expect(event).toBeInstanceOf(window.Event)
      }
    }
  }
  create(events)
})
