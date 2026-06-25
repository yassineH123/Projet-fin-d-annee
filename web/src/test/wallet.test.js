import { describe, it, expect } from 'vitest';

function fmt(n) { return parseFloat(n || 0).toFixed(2); }

describe('Formatage solde wallet', () => {
  it('formate correctement les montants', () => {
    expect(fmt(100)).toBe('100.00');
    expect(fmt(99.9)).toBe('99.90');
    expect(fmt(0)).toBe('0.00');
    expect(fmt(null)).toBe('0.00');
    expect(fmt(undefined)).toBe('0.00');
  });

  it('respecte 2 décimales', () => {
    expect(fmt(1234.567)).toBe('1234.57');
  });
});

describe('Validation montant recharge', () => {
  function isValidTopUp(amount) {
    const val = parseFloat(amount);
    return !isNaN(val) && val >= 10 && val <= 5000;
  }

  it('accepte les montants valides', () => {
    expect(isValidTopUp('10')).toBe(true);
    expect(isValidTopUp('100')).toBe(true);
    expect(isValidTopUp('5000')).toBe(true);
  });

  it('rejette les montants invalides', () => {
    expect(isValidTopUp('9')).toBe(false);
    expect(isValidTopUp('5001')).toBe(false);
    expect(isValidTopUp('')).toBe(false);
    expect(isValidTopUp('abc')).toBe(false);
  });
});
