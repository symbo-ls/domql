import { flattenProtosAsArray, mergeProtosArray, flattenPrototype, applyPrototype } from '../../src/element/proto'

test('should flatten Array of objects as single object', () => {
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

test('should flatten deep prototypal inheritances', () => {
  var arr = flattenProtosAsArray(proto4)
  expect(arr).toStrictEqual([
    proto4,
    proto3,
    proto2,
    proto1
  ])
})

test('should merge multiple level prototypes', () => {
  var obj = flattenPrototype(proto4)

  expect(obj).toStrictEqual({
    div1: 'div1',
    div2: 'div2',
    div3: {
      text: 'div3'
    },
    div4: 'div4'
  })
})

test('should not mutate original prototype object', () => {
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

test('should apply multiple level prototypes', () => {
  expect(proto4).toStrictEqual({
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

  var parent = {
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
    div5: 'div5'
  })
})
