const { deepStringifyFunctions } = require('../dist/cjs')

const testObject1 = {
  a: 'hello',
  b: 123,
  c: true,
  d: {
    e: [1, 2, 3],
    f: {
      g: 'world'
    }
  },
  h: function () {
    console.log('test')
  }
}

const testObject2 = {
  name: 'John',
  age: 30,
  hobbies: ['reading', 'music'],
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345'
  },
  sayHello: function () {
    return 'Hello'
  }
}

describe('deepStringifyFunctions', () => {
  test('should convert functions to string', () => {
    const obj = {
      a: 1,
      b: function () {
        return 'test'
      }
    }
    const expected = {
      a: 1,
      b: `function () {
        return 'test';
      }`
    }
    expect(deepStringifyFunctions(obj)).toEqual(expected)
  })

  test('should stringify nested objects', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3
        }
      }
    }
    const expected = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3
        }
      }
    }
    expect(deepStringifyFunctions(obj)).toEqual(expected)
  })

  test('should stringify arrays', () => {
    const obj = {
      a: 1,
      b: [
        1,
        2,
        function () {
          return 'test'
        }
      ]
    }
    const expected = {
      a: 1,
      b: [
        1,
        2,
        `function () {
        return 'test';
      }`
      ]
    }
    expect(deepStringifyFunctions(obj)).toEqual(expected)
  })

  test('should stringify testObject1', () => {
    const expected = {
      a: 'hello',
      b: 123,
      c: true,
      d: {
        e: [1, 2, 3],
        f: {
          g: 'world'
        }
      },
      h: `function () {
    console.log('test');
  }`
    }
    expect(deepStringifyFunctions(testObject1)).toEqual(expected)
  })

  test('should stringify testObject2', () => {
    const expected = {
      name: 'John',
      age: 30,
      hobbies: ['reading', 'music'],
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345'
      },
      sayHello: `function () {
    return 'Hello';
  }`
    }
    expect(deepStringifyFunctions(testObject2)).toEqual(expected)
  })
})
