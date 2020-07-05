import { applyPrototype } from '../../src/element/proto'

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

test('should not mutate prototype object', () => {
  applyPrototype(proto4)

  expect(proto3).toStrictEqual({
    proto: proto2,
    div3: {
      text: 'div3'
    }
  })
})

test('should merge multiple level prototypes', () => {
  expect(proto4).toStrictEqual({
    div1: 'div1',
    div2: 'div2',
    div3: {
      text: 'div3'
    },
    div4: 'div4'
  })
})

test('should merge prototypes with parent\'s child protos', () => {
  var proto5 = {
    div5: 'div5'
  }

  var parent = {
    childProto: proto4,
    one: {
      proto: proto5
    }
  }

  applyPrototype(parent.one)

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
