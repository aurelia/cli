const applicable = require('../../../lib/workflow/applicable');

describe('The applicable func', () => {
  it('supports logical not', () => {
    expect(applicable(['a', 'b'], 'not_c')).toBeTruthy();
    expect(applicable(['a', 'b'], 'not_a')).toBeFalsy();
    expect(applicable(['a', 'b'], 'not_b')).toBeFalsy();
    expect(applicable(['a', 'b'], '!c')).toBeTruthy();
    expect(applicable(['a', 'b'], '!a')).toBeFalsy();
    expect(applicable(['a', 'b'], '!b')).toBeFalsy();
    expect(applicable(['a', 'b'], '! c')).toBeTruthy();
    expect(applicable(['a', 'b'], '! a')).toBeFalsy();
    expect(applicable(['a', 'b'], '! b')).toBeFalsy();
  });

  it('supports logical and', () => {
    expect(applicable(['a', 'b'], 'a_and_b')).toBeTruthy();
    expect(applicable(['a', 'b'], 'a_and_c')).toBeFalsy();
    expect(applicable(['a', 'b'], 'c_and_b')).toBeFalsy();
    expect(applicable(['a', 'b'], 'c_and_d')).toBeFalsy();
    expect(applicable(['a', 'b'], 'a&&b')).toBeTruthy();
    expect(applicable(['a', 'b'], 'a&&c')).toBeFalsy();
    expect(applicable(['a', 'b'], 'c&&b')).toBeFalsy();
    expect(applicable(['a', 'b'], 'c&&d')).toBeFalsy();
    expect(applicable(['a', 'b'], 'a && b')).toBeTruthy();
    expect(applicable(['a', 'b'], 'a && c')).toBeFalsy();
    expect(applicable(['a', 'b'], 'c && b')).toBeFalsy();
    expect(applicable(['a', 'b'], 'c && d')).toBeFalsy();
  });

  it('supports logical or', () => {
    expect(applicable(['a', 'b'], 'a_or_b')).toBeTruthy();
    expect(applicable(['a', 'b'], 'a_or_c')).toBeTruthy();
    expect(applicable(['a', 'b'], 'c_or_b')).toBeTruthy();
    expect(applicable(['a', 'b'], 'c_or_d')).toBeFalsy();
    expect(applicable(['a', 'b'], 'a||b')).toBeTruthy();
    expect(applicable(['a', 'b'], 'a||c')).toBeTruthy();
    expect(applicable(['a', 'b'], 'c||b')).toBeTruthy();
    expect(applicable(['a', 'b'], 'c||d')).toBeFalsy();
    expect(applicable(['a', 'b'], 'a || b')).toBeTruthy();
    expect(applicable(['a', 'b'], 'a || c')).toBeTruthy();
    expect(applicable(['a', 'b'], 'c || b')).toBeTruthy();
    expect(applicable(['a', 'b'], 'c || d')).toBeFalsy();
  });

  it('supports long logical expression', () => {
    expect(applicable(['a-c', 'b'], 'not_a-c_or_b')).toBeTruthy();
    expect(applicable(['a-c', 'b'], 'not_a-c_or_c')).toBeFalsy();
    expect(applicable(['a-c', 'b'], 'not_c_or_b')).toBeTruthy();
    expect(applicable(['a-c', 'b'], 'not_c_or_d')).toBeTruthy();
    expect(applicable(['a-c', 'b'], 'not_a-c_and_b')).toBeFalsy();
    expect(applicable(['a-c', 'b'], 'not_a_and_c')).toBeFalsy();
    expect(applicable(['a-c', 'b'], 'not_c_and_b')).toBeTruthy();
    expect(applicable(['a-c', 'b'], 'not_c_and_d')).toBeFalsy();

    expect(applicable(['a-c', 'b'], '!a-c||b')).toBeTruthy();
    expect(applicable(['a-c', 'b'], '!a-c||c')).toBeFalsy();
    expect(applicable(['a-c', 'b'], '!c||b')).toBeTruthy();
    expect(applicable(['a-c', 'b'], '!c||d')).toBeTruthy();
    expect(applicable(['a-c', 'b'], '!a-c&&b')).toBeFalsy();
    expect(applicable(['a-c', 'b'], '!a-c&&c')).toBeFalsy();
    expect(applicable(['a-c', 'b'], '!c&&b')).toBeTruthy();
    expect(applicable(['a-c', 'b'], '!c&&d')).toBeFalsy();

    expect(applicable(['a-c', 'b'], '! a-c || b')).toBeTruthy();
    expect(applicable(['a-c', 'b'], '! a-c || c')).toBeFalsy();
    expect(applicable(['a-c', 'b'], '! c || b')).toBeTruthy();
    expect(applicable(['a-c', 'b'], '! c || d')).toBeTruthy();
    expect(applicable(['a-c', 'b'], '! a-c && b')).toBeFalsy();
    expect(applicable(['a-c', 'b'], '! a-c && c')).toBeFalsy();
    expect(applicable(['a-c', 'b'], '! c && b')).toBeTruthy();
    expect(applicable(['a-c', 'b'], '! c && d')).toBeFalsy();
  });
});
