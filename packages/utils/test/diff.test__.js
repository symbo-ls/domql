import { deepDiff } from '../'

describe('diff', () => {
  it('should return an empty object when comparing identical simple objects', () => {
    const original = { a: 1, b: 'hello' };
    const objToDiff = { a: 1, b: 'hello' };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({});
  });

  it('should correctly identify differences in simple objects', () => {
    const original = { a: 1, b: 'hello' };
    const objToDiff = { a: 2, b: 'world' };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({ a: 2, b: 'world' });
  });

  it('should handle identical nested objects', () => {
    const original = { a: { x: 1, y: 2 }, b: { z: 3 } };
    const objToDiff = { a: { x: 1, y: 2 }, b: { z: 3 } };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({});
  });

  it('should correctly identify differences in nested objects', () => {
    const original = { a: { x: 1, y: 2 }, b: { z: 3 } };
    const objToDiff = { a: { x: 1, y: 4 }, b: { w: 5 } };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({ a: { y: 4 }, b: { w: 5 } });
  });

  it('should handle identical arrays', () => {
    const original = [1, 2, 3];
    const objToDiff = [1, 2, 3];
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({});
  });

  it('should correctly identify differences in arrays', () => {
    const original = [1, 2, 3];
    const objToDiff = [1, 2, 4];
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({"2": 4});
  });

  it('should handle arrays with nested objects', () => {
    const original = [{ x: 1 }, { y: 2 }];
    const objToDiff = [{ x: 1 }, { z: 3 }];
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({"1": {"y": undefined,"z": 3}});
  });

  it('should handle arrays with objects and primitive values', () => {
    const original = [1, { x: 2 }, 3];
    const objToDiff = [1, { x: 3 }, 4];
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({"1": {"x": 3}, "2": 4});
  });

  it('should handle properties that only exist in objToDiff', () => {
    const original = { a: 1 };
    const objToDiff = { a: 1, b: 2 };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({ b: 2 });
  });

  it('should handle properties that only exist in original', () => {
    const original = { a: 1, b: 2 };
    const objToDiff = { a: 1 };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({ b: undefined });
  });

  it('should handle null values in objects', () => {
    const original = { a: null };
    const objToDiff = { a: 1 };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({ a: 1 });
  });

  it('should handle undefined values in objects', () => {
    const original = { a: undefined };
    const objToDiff = { a: 1 };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({ a: 1 });
  });

  it('should handle nested undefined values in objects', () => {
    const original = { a: { b: undefined } };
    const objToDiff = { a: { b: 2 } };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({ a: { b: 2 } });
  });

  it('should handle properties with different types', () => {
    const original = { a: 1 };
    const objToDiff = { a: 'one' };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({ a: 'one' });
  });

  it('should handle empty objects', () => {
    const original = {};
    const objToDiff = { a: 1, b: 2 };
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should handle empty arrays', () => {
    const original = [];
    const objToDiff = [1, 2, 3];
    const result = deepDiff(original, objToDiff);
    expect(result).toEqual({"0": 1, "1": 2, "2": 3});
  });

  it('should handle non-object values', () => {
    const original = 'hello';
    const objToDiff = 'world';
    const result = deepDiff(original, objToDiff);
    expect(result).toBe('world');
  });
});
