import { applyExtendtype } from '../../src/element/extend'
import { mergeArray, flattenRecursive } from '../../src/utils'

const extend1 = {
  div1: 'div1'
}

const extend2 = {
  extend: extend1,
  div2: 'div2'
}

const extend3 = {
  extend: extend2,
  div3: {
    text: 'div3'
  }
}

const extend4 = {
  extend: extend3,
  div4: 'div4'
}

test('should FLATTEN deep extendtypal inheritances', () => {
  const arr = flattenRecursive(extend4, 'extend')
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
  const extend = mergeArray([
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
  expect(extend).toStrictEqual({
    a: 1,
    b: 2,
    c: 3,
    d: {
      a: 1
    }
  })
})

test('Should FLATTEN deep level extends into an FLAT object', () => {
  const extend = {
    a: 1,
    extend: {
      b: 2,
      extend: {
        c: 3
      }
    }
  }

  const flatten = mergeArray(
    flattenRecursive(extend, 'extend')
  )

  expect(flatten).toStrictEqual({
    a: 1,
    b: 2,
    c: 3
  })
})

test('should not MUTATE original extend object', () => {
  applyExtendtype(extend4)

  expect(extend2).toStrictEqual({
    extend: extend1,
    div2: 'div2'
  })

  expect(extend3).toStrictEqual({
    extend: extend2,
    div3: {
      text: 'div3'
    }
  })
})

test('should apply MULTIPLE level extends', () => {
  expect(extend4).toStrictEqual({
    div1: 'div1',
    div2: 'div2',
    div3: {
      text: 'div3'
    },
    div4: 'div4'
  })
})

test('should MERGE extends with parent\'s childExtends', () => {
  const extend5 = {
    div5: 'div5'
  }

  const parent = {
    childExtend: extend4,
    one: {
      extend: extend5
    }
  }
  parent.one.parent = parent

  applyExtendtype(parent.one, parent)

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

test('should accept extend INSIDE childExtend', () => {
  const text = element => element.key
  const extend = { text }
  const childExtend = { extend, tag: 'li' }
  const list = {
    childExtend,
    test: {}
  }
  list.test.parent = list
  applyExtendtype(list.test, list)
  delete list.test.parent

  expect(list.test).toStrictEqual({
    tag: 'li',
    text
  })
})

test('should accept extend AND childExtend together', () => {
  const text = element => element.key
  const extend = { text }
  const childExtend = { tag: 'li' }
  const list = {
    childExtend,
    test: { extend }
  }
  list.test.parent = list
  applyExtendtype(list.test, list)
  delete list.test.parent

  expect(list.test).toStrictEqual({
    tag: 'li',
    text
  })
})

test('should MERGE HEAVY extendtypal inheritances', () => {
  const ListItem = {
    tag: 'li'
  }

  const Dropdown = {
    tag: 'ul',
    childExtend: ListItem
  }

  const Section = {
    dropdown: {
      extend: Dropdown
    }
  }

  const Page = {
    childExtend: Section
  }

  const final = {
    extend: Page,
    section: {
      dropdown: {
        0: {}
      }
    }
  }

  final.section.parent = final
  final.section.dropdown.parent = final.section
  final.section.dropdown[0].parent = final.section.dropdown

  applyExtendtype(final)
  applyExtendtype(final.section, final)
  applyExtendtype(final.section.dropdown, final.section)
  applyExtendtype(final.section.dropdown[0], final.section.dropdown)

  delete final.section.parent
  delete final.section.dropdown.parent
  delete final.section.dropdown[0].parent

  expect(final).toStrictEqual({
    childExtend: Section,
    section: {
      dropdown: {
        childExtend: ListItem,
        tag: 'ul',
        0: {
          tag: 'li'
        }
      }
    }
  })
})

test('should apply childExtend from extend', () => {
  const extend = {
    childExtend: { tag: 'li' }
  }

  const list = {
    tag: 'ul',
    extend
  }

  applyExtendtype(list)

  expect(list).toStrictEqual({
    tag: 'ul',
    childExtend: { tag: 'li' }
  })
})

test('should apply recursive childExtend', () => {
  const row = {
    tag: 'tr',
    childExtend: { tag: 'td' },
    a: {},
    b: {}
  }

  const table = {
    tag: 'table',
    childExtend: row,
    0: {}
  }

  const app = {
    childExtend: table,
    table: {}
  }

  applyExtendtype(app.table, app)
  applyExtendtype(app.table[0], app.table)
  applyExtendtype(app.table[0].a, app.table[0])
  applyExtendtype(app.table[0].b, app.table[0])

  expect(app.table.parent).toBe(app)
  expect(app.table[0].parent).toBe(app.table)
  expect(app.table[0].a.parent).toBe(app.table[0])
  expect(app.table[0].b.parent).toBe(app.table[0])

  const expected = {
    parent: app,
    childExtend: row,
    tag: 'table',
    0: {
      childExtend: { tag: 'td' },
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

test('should MERGE DEEP extendtypal inheritances woth ARRAYS', () => {
  const ListItem = { tag: 'li' }
  const Dropdown = {
    childExtend: ListItem,
    1: {}
  }

  const Row = {
    dropdown: { extend: Dropdown }
  }

  const List = {
    list: { childExtend: Row }
  }

  const sidebar = {
    extend: List,
    list: {
      0: {}
    }
  }

  applyExtendtype(sidebar, {})
  applyExtendtype(sidebar.list, sidebar)
  applyExtendtype(sidebar.list[0], sidebar.list)
  applyExtendtype(sidebar.list[0].dropdown, sidebar.list[0])
  applyExtendtype(sidebar.list[0].dropdown[1], sidebar.list[0].dropdown)

  delete sidebar.parent
  delete sidebar.list.parent
  delete sidebar.list[0].parent
  delete sidebar.list[0].dropdown.parent
  delete sidebar.list[0].dropdown[1].parent

  const equal = {
    list: {
      childExtend: Row,
      0: {
        dropdown: {
          childExtend: ListItem,
          1: ListItem
        }
      }
    }
  }

  delete equal.list[0].dropdown.extend

  expect(sidebar).toStrictEqual(equal)
})
