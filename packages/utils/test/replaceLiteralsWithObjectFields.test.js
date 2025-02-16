import { replaceLiteralsWithObjectFields } from '../'

describe('replaceLiteralsWithObjectFields', () => {
  it('replaces placeholders in a string with corresponding values from an object', () => {
    const str = 'Hello, {{ name }}! Today is {{ day }}.';
    const state = {
      name: 'John',
      day: 'Monday',
    };

    const result = replaceLiteralsWithObjectFields(str, state);

    expect(result).toEqual('Hello, John! Today is Monday.');
  });

  it('returns the original string if no placeholders are present', () => {
    const str = 'Hello, world!';
    const state = {
      name: 'John',
      day: 'Monday',
    };

    const result = replaceLiteralsWithObjectFields(str, state);

    expect(result).toEqual('Hello, world!');
  });

  it('returns an empty string if the parent level does not exist', () => {
    const str = 'Hello, {{ parent.child.name }}!';
    const state = {
      parent: null,
    };

    const result = replaceLiteralsWithObjectFields(str, state);

    expect(result).toEqual('Hello, !');
  });

  // Add more test cases as needed
});
