import { applyPrototype } from '../../src/element/proto'
import { mergeArray, flattenRecursive } from '../../src/utils'

const proto1 = {
  div1: 'div1'
}

const proto2 = {
  proto: proto1,
  div2: 'div2'
}

const proto3 = {
  proto: proto2,
  div3: {
    text: 'div3'
  }
}

const proto4 = {
  proto: proto3,
  div4: 'div4'
}

test('should FLATTEN deep prototypal inheritances', () => {
  const arr = flattenRecursive(proto4, 'proto')
  expect(arr).toStrictEqual([
    {
      div4: 'div4'
    },
    {
      div3: {
        text: 'div3'
      }
    },
    {
      div2: 'div2'
    },
    {
      div1: 'div1'
    }
  ])
})

test('should FLATTEN Array of objects as SINGLE object', () => {
  const proto = mergeArray([
    { a: 1 },
    { b: 2 },
    { c: 3 },
    {
      d: {
        a: 1
      }
    },
    { a: 4 }
  ])
  expect(proto).toStrictEqual({
    a: 1,
    b: 2,
    c: 3,
    d: {
      a: 1
    }
  })
})

test('Should FLATTEN deep level prototypes into an FLAT object', () => {
  const proto = {
    a: 1,
    proto: {
      b: 2,
      proto: {
        c: 3
      }
    }
  }

  const flatten = mergeArray(
    flattenRecursive(proto, 'proto')
  )

  expect(flatten).toStrictEqual({
    a: 1,
    b: 2,
    c: 3
  })
})

test('should not MUTATE original prototype object', () => {
  applyPrototype(proto4)

  expect(proto2).toStrictEqual({
    proto: proto1,
    div2: 'div2'
  })

  expect(proto3).toStrictEqual({
    proto: proto2,
    div3: {
      text: 'div3'
    }
  })
})

test('should apply MULTIPLE level prototypes', () => {
  expect(proto4).toStrictEqual({
    div1: 'div1',
    div2: 'div2',
    div3: {
      text: 'div3'
    },
    div4: 'div4'
  })
})

test('should MERGE prototypes with parent\'s childProtos', () => {
  const proto5 = {
    div5: 'div5'
  }

  const parent = {
    childProto: proto4,
    one: {
      proto: proto5
    }
  }
  parent.one.parent = parent

  applyPrototype(parent.one, parent)

  delete parent.one.parent

  expect(parent.one).toStrictEqual({
    div1: 'div1',
    div2: 'div2',
    div3: {
      text: 'div3'
    },
    div4: 'div4',
    div5: 'div5'
  })
})

test('should accept proto INSIDE childProto', () => {
  const text = element => element.key
  const proto = { text }
  const childProto = { proto, tag: 'li' }
  const list = {
    childProto,
    test: {}
  }
  list.test.parent = list
  applyPrototype(list.test, list)
  delete list.test.parent

  expect(list.test).toStrictEqual({
    tag: 'li',
    text
  })
})

test('should accept proto AND childProto together', () => {
  const text = element => element.key
  const proto = { text }
  const childProto = { tag: 'li' }
  const list = {
    childProto,
    test: { proto }
  }
  list.test.parent = list
  applyPrototype(list.test, list)
  delete list.test.parent

  expect(list.test).toStrictEqual({
    tag: 'li',
    text
  })
})

test('should MERGE HEAVY prototypal inheritances', () => {
  const ListItem = {
    tag: 'li'
  }

  const Dropdown = {
    tag: 'ul',
    childProto: ListItem
  }

  const Section = {
    dropdown: {
      proto: Dropdown
    }
  }

  const Page = {
    childProto: Section
  }

  const final = {
    proto: Page,
    section: {
      dropdown: {
        0: {}
      }
    }
  }

  final.section.parent = final
  final.section.dropdown.parent = final.section
  final.section.dropdown[0].parent = final.section.dropdown

  applyPrototype(final)
  applyPrototype(final.section, final)
  applyPrototype(final.section.dropdown, final.section)
  applyPrototype(final.section.dropdown[0], final.section.dropdown)

  delete final.section.parent
  delete final.section.dropdown.parent
  delete final.section.dropdown[0].parent

  expect(final).toStrictEqual({
    childProto: Section,
    section: {
      dropdown: {
        childProto: ListItem,
        tag: 'ul',
        0: {
          tag: 'li'
        }
      }
    }
  })
})

test('should apply childProto from proto', () => {
  const proto = {
    childProto: { tag: 'li' }
  }

  const list = {
    tag: 'ul',
    proto
  }

  applyPrototype(list)

  expect(list).toStrictEqual({
    tag: 'ul',
    childProto: { tag: 'li' }
  })
})

test('should apply recursive childProto', () => {
  const row = {
    tag: 'tr',
    childProto: { tag: 'td' },
    a: {},
    b: {}
  }

  const table = {
    tag: 'table',
    childProto: row,
    0: {}
  }

  const app = {
    childProto: table,
    table: {}
  }

  applyPrototype(app.table, app)
  applyPrototype(app.table[0], app.table)
  applyPrototype(app.table[0].a, app.table[0])
  applyPrototype(app.table[0].b, app.table[0])

  expect(app.table.parent).toBe(app)
  expect(app.table[0].parent).toBe(app.table)
  expect(app.table[0].a.parent).toBe(app.table[0])
  expect(app.table[0].b.parent).toBe(app.table[0])

  const expected = {
    parent: app,
    childProto: row,
    tag: 'table',
    0: {
      childProto: { tag: 'td' },
      tag: 'tr',
      a: {
        tag: 'td'
      },
      b: {
        tag: 'td'
      }
    }
  }

  expected[0].parent = expected
  expected[0].a.parent = expected[0]
  expected[0].b.parent = expected[0]

  expect(app.table).toStrictEqual(expected)
})

test('should MERGE DEEP prototypal inheritances woth ARRAYS', () => {
  const ListItem = { tag: 'li' }
  const Dropdown = {
    childProto: ListItem,
    1: {}
  }

  const Row = {
    dropdown: { proto: Dropdown }
  }

  const List = {
    list: { childProto: Row }
  }

  const sidebar = {
    proto: List,
    list: {
      0: {}
    }
  }

  applyPrototype(sidebar, {})
  applyPrototype(sidebar.list, sidebar)
  applyPrototype(sidebar.list[0], sidebar.list)
  applyPrototype(sidebar.list[0].dropdown, sidebar.list[0])
  applyPrototype(sidebar.list[0].dropdown[1], sidebar.list[0].dropdown)

  delete sidebar.parent
  delete sidebar.list.parent
  delete sidebar.list[0].parent
  delete sidebar.list[0].dropdown.parent
  delete sidebar.list[0].dropdown[1].parent

  const equal = {
    list: {
      childProto: Row,
      0: {
        dropdown: {
          childProto: ListItem,
          1: ListItem
        }
      }
    }
  }

  delete equal.list[0].dropdown.proto

  expect(sidebar).toStrictEqual(equal)
})
