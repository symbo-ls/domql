const { createChangesByKey } = require('../dist/cjs')

test('createChangesByKey should create nested object with value', () => {
  const path = 'test/2/4/6';
  const value = { foo: 'bar' };
  const expected = {
    test: {
      2: {
        4: {
          6: value,
        },
      },
    },
  };
  expect(createChangesByKey(path, value)).toEqual(expected);
});

test('createChangesByKey should create nested object with empty object if value is not provided', () => {
  const path = 'test/2/4/6';
  const expected = {
    test: {
      2: {
        4: {
          6: {},
        },
      },
    },
  };
  expect(createChangesByKey(path)).toEqual(expected);
});

test('createChangesByKey should return empty object if path is empty', () => {
  const path = '';
  const value = { foo: 'bar' };
  const expected = { foo: 'bar' };
  expect(createChangesByKey(path, value)).toEqual(expected);
});