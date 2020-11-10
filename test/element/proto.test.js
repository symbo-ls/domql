import {
  flattenProtosAsArray,
  mergeProtosArray,
  flattenPrototype,
  applyPrototype
} from '../../src/element/proto'
import { deepClone } from '../../src/utils'

// const proto1 = {
//   div1: 'div1'
// }

// const proto2 = {
//   proto: proto1,
//   div2: 'div2'
// }

// const proto3 = {
//   proto: proto2,
//   div3: {
//     text: 'div3'
//   }
// }

// const proto4 = {
//   proto: proto3,
//   div4: 'div4'
// }

// const proto5 = {
//   div5: 'div5'
// }

// let parent = {
//   childProto: proto4,
//   one: {
//     proto: proto5
//   }
// }

// test('should FLATTEN deep prototypal inheritances', () => {
//   const arr = flattenProtosAsArray(proto4)
//   expect(arr).toStrictEqual([
//     proto4,
//     proto3,
//     proto2,
//     proto1
//   ])
// })

// test('should flatten Array of objects as SINGLE object', () => {
//   const proto = mergeProtosArray([
//     { a: 1 },
//     { b: 2 },
//     { c: 3 },
//     { d: {
//       a: 1
//     } },
//     { a: 4 }
//   ])
//   expect(proto).toStrictEqual({
//     a: 1,
//     b: 2,
//     c: 3,
//     d: {
//       a: 1
//     }
//   })
// })

// test('Should flatten deep level prototypes into an FLAT object', () => {
//   const proto = {
//     a: 1,
//     proto: {
//       b: 2,
//       proto: {
//         c: 3
//       }
//     }
//   }
//   const flatten = flattenPrototype(proto)

//   expect(flatten).toStrictEqual({
//     a: 1,
//     b: 2,
//     c: 3
//   })
// })

// test('should not MUTATE original prototype object', () => {
//   applyPrototype(proto4)

//   expect(proto2).toStrictEqual({
//     proto: proto1,
//     div2: 'div2'
//   })

//   expect(proto3).toStrictEqual({
//     proto: proto2,
//     div3: {
//       text: 'div3'
//     }
//   })
// })

// test('should apply MULTIPLE level prototypes', () => {
//   expect(proto4).toStrictEqual({
//     proto: proto3,
//     div1: 'div1',
//     div2: 'div2',
//     div3: {
//       text: 'div3'
//     },
//     div4: 'div4'
//   })
// })

// test('should merge prototypes with parent\'s childProtos', () => {
//   const proto5 = {
//     div5: 'div5'
//   }

//   const parent = {
//     childProto: proto4,
//     one: {
//       proto: proto5
//     }
//   }
//   parent.one.parent = parent

//   applyPrototype(parent.one)

//   delete parent.one.parent

//   expect(parent.one).toStrictEqual({
//     div1: 'div1',
//     div2: 'div2',
//     div3: {
//       text: 'div3'
//     },
//     div4: 'div4',
//     div5: 'div5',
//     proto: proto5
//   })
// })

// test('should accept proto INSIDE childProto', () => {
//   const text = element => element.key
//   const proto = { text }
//   const childProto = { proto, tag: 'li' }
//   const list = {
//     childProto,
//     test: {}
//   }
//   list.test.parent = list
//   applyPrototype(list.test)
//   delete list.test.parent

//   expect(list.test).toStrictEqual({
//     tag: 'li',
//     text
//   })
// })

// test('should accept proto AND childProto together', () => {
//   const text = element => element.key
//   const proto = { text }
//   const childProto = { tag: 'li' }
//   const list = {
//     childProto,
//     test: { proto }
//   }
//   list.test.parent = list
//   applyPrototype(list.test)
//   delete list.test.parent

//   expect(list.test).toStrictEqual({
//     proto,
//     tag: 'li',
//     text
//   })
// })

// test('should merge HEAVY prototypal inheritances', () => {
//   const ListItem = {
//     tag: 'li'
//   }

//   const Dropdown = {
//     tag: 'ul',
//     childProto: ListItem
//   }

//   const Section = {
//     dropdown: {
//       proto: Dropdown
//     }
//   }

//   const Page = {
//     childProto: Section
//   }

//   const final = {
//     proto: Page,
//     section: {
//       dropdown: {
//         0: {}
//       }
//     }
//   }

//   final.section.parent = final
//   final.section.dropdown[0].parent = final.section.dropdown

//   applyPrototype(final)
//   applyPrototype(final.section)
//   applyPrototype(final.section.dropdown)
//   applyPrototype(final.section.dropdown[0])

//   delete final.section.parent
//   delete final.section.dropdown[0].parent

//   expect(final).toStrictEqual({
//     proto: Page,
//     childProto: Section,
//     section: {
//       dropdown: {
//         proto: Dropdown,
//         childProto: ListItem,
//         tag: 'ul',
//         0: {
//           tag: 'li'
//         }
//       }
//     }
//   })
// })

// test('should apply childProto from proto', () => {
//   const proto = {
//     childProto: { tag: 'li' }
//   }

//   const list = {
//     tag: 'ul',
//     proto
//   }

//   applyPrototype(list)

//   expect(list).toStrictEqual({
//     proto,
//     tag: 'ul',
//     childProto: { tag: 'li' }
//   })
// })

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
    tag: 'table',
    0: {
      tag: 'tr',
      a: {
        tag: 'td'
      },
      b: {
        tag: 'td'
      }
    }
  }

  console.log('================ result:')
  console.log(app.table)
  console.log('================ expected:')
  console.log(expected)

  expect(true).toBe(false)
  // expect(app.table).toStrictEqual(expected)
})

// const input = { tag: 'input' }
// const childProto = {
//   childProto: { proto: section },
//   a: {},
//   b: {
//     childProto: { proto: input },
//     input: {}
//   }
// }

// expect(app).toStrictEqual({
//   a: {
//     a: { tag: 'section' },
//     b: {
//       tag: 'section',
//       input: { tag: 'input' }
//     }
//   }
// })

// test('should merge DEEP prototypal inheritances woth ARRAYS', () => {
//   const ListItem = { tag: 'li' }
//   const Dropdown = { childProto: ListItem }

//   const Row = {
//     dropdown: {
//       proto: Dropdown,
//       define: { enabled: param => param }
//     }
//   }

//   const List = {
//     list: { childProto: Row }
//   }

//   const sidebar = applyPrototype({
//     proto: List,
//     list: [{}]
//   })

//   const equal = {
//     proto: List,
//     list: [{}]
//   }
//   equal.list.childProto = Row
//   expect(sidebar).toStrictEqual(equal)
// })
