import { flattenProtosAsArray, mergeProtosArray, flattenPrototype, applyPrototype } from '../../src/element/proto'

var proto1 = {
  div1: 'div1'
}

var proto2 = {
  proto: proto1,
  div2: 'div2'
}

var proto3 = {
  proto: proto2,
  div3: {
    text: 'div3'
  }
}

var proto4 = {
  proto: proto3,
  div4: 'div4'
}

var proto5 = {
  div5: 'div5'
}

var parent = {
  childProto: proto4,
  one: {
    proto: proto5
  }
}

test('should FLATTEN deep prototypal inheritances', () => {
  var arr = flattenProtosAsArray(proto4)
  expect(arr).toStrictEqual([
    proto4,
    proto3,
    proto2,
    proto1
  ])
})

test('should flatten Array of objects as SINGLE object', () => {
  var proto = mergeProtosArray([
    { a: 1 },
    { b: 2 },
    { c: 3 },
    { d: {
      a: 1
    } },
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

test('Should flatten deep level prototypes into an FLAT object', () => {
  var proto = {
    a: 1,
    proto: {
      b: 2,
      proto: {
        c: 3
      }
    }
  }
  var flatten = flattenPrototype(proto)

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
    proto: proto3,
    div1: 'div1',
    div2: 'div2',
    div3: {
      text: 'div3'
    },
    div4: 'div4'
  })
})

test('should merge prototypes with parent\'s childProtos', () => {
  var proto5 = {
    div5: 'div5'
  }

  const parent = {
    childProto: proto4,
    one: {
      proto: proto5
    }
  }
  parent.one.parent = parent

  applyPrototype(parent.one)

  delete parent.one.parent

  expect(parent.one).toStrictEqual({
    div1: 'div1',
    div2: 'div2',
    div3: {
      text: 'div3'
    },
    div4: 'div4',
    div5: 'div5',
    proto: proto5
  })
})

test('should accept proto INSIDE childProto', () => {
  var text = element => element.key
  var proto = { text }
  var childProto = { proto, tag: 'li' }
  var list = {
    childProto,
    test: {}
  }
  list.test.parent = list
  applyPrototype(list.test)
  delete list.test.parent

  expect(list.test).toStrictEqual({
    tag: 'li',
    text
  })
})

test('should accept proto AND childProto together', () => {
  var text = element => element.key
  var proto = { text }
  var childProto = { tag: 'li' }
  var list = {
    childProto,
    test: { proto }
  }
  list.test.parent = list
  applyPrototype(list.test)
  delete list.test.parent

  expect(list.test).toStrictEqual({
    proto,
    tag: 'li',
    text
  })
})

test('should merge HEAVY prototypal inheritances', () => {
  var ListItem = {
    tag: 'li'
  }

  var Dropdown = {
    tag: 'ul',
    childProto: ListItem
  }

  var Section = {
    dropdown: {
      proto: Dropdown
    }
  }

  var Page = {
    childProto: Section
  }

  var final = {
    proto: Page,
    section: {
      dropdown: {
        0: {}
      }
    }
  }

  final.section.parent = final
  final.section.dropdown[0].parent = final.section.dropdown

  applyPrototype(final)
  applyPrototype(final.section)
  applyPrototype(final.section.dropdown)
  applyPrototype(final.section.dropdown[0])

  delete final.section.parent
  delete final.section.dropdown[0].parent

  expect(final).toStrictEqual({
    proto: Page,
    childProto: Section,
    section: {
      dropdown: {
        proto: Dropdown,
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
  var proto = {
    childProto: { tag: 'li' }
  }

  var list = {
    tag: 'ul',
    proto
  }

  applyPrototype(list)

  expect(list).toStrictEqual({
    proto,
    tag: 'ul',
    childProto: { tag: 'li' }
  })
})

test('should merge DEEP prototypal inheritances woth ARRAYS', () => {
  var ListItem = { tag: 'li' }
  var Dropdown = { childProto: ListItem }

  var Row = {
    dropdown: {
      proto: Dropdown,
      define: { enabled: param => param }
    }
  }

  var List = {
    list: { childProto: Row }
  }

  var sidebar = applyPrototype({
    proto: List,
    list: [{}]
  })

  var equal = {
    proto: List,
    list: [{}]
  }
  equal.list['childProto'] = Row
  expect(sidebar).toStrictEqual(equal)
})
