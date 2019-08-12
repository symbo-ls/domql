import applyPrototype from '../../src/element/proto'

test('should merge multiple level prototypes', () => {
  var proto1 = {
    div1: 'div1'
  }

  var proto2 = {
    proto: proto1,
    div2: 'div2'
  }

  var proto3 = {
    proto: proto2,
    div3: 'div3'
  }

  var proto4 = {
    proto: proto3,
    div4: 'div4'
  }

  applyPrototype(proto4)

  expect(proto4).toStrictEqual({
    proto: proto3,
    div1: 'div1',
    div2: 'div2',
    div3: 'div3',
    div4: 'div4'
  })

  var proto5 = {
    div5: 'div5'
  }

  var parent = {
    childProto: proto4,
    one: {
      proto: proto5
    }
  }

  applyPrototype(parent.one, parent)

  expect(parent.one).toStrictEqual({
    proto: proto5,
    div1: 'div1',
    div2: 'div2',
    div3: 'div3',
    div4: 'div4',
    div5: 'div5'
  })
})
