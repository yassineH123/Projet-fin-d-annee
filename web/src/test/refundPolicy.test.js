import { describe, it, expect } from 'vitest';

// Politique de remboursement copiée du backend (bookingController.js)
function refundPolicy(hoursUntil) {
  if (hoursUntil >= 24) return 1.0;
  if (hoursUntil >= 2)  return 0.5;
  return 0;
}

describe('Politique de remboursement', () => {
  it('remboursement total si annulation > 24h avant départ', () => {
    expect(refundPolicy(48)).toBe(1.0);
    expect(refundPolicy(24)).toBe(1.0);
  });

  it('remboursement 50% si annulation entre 2h et 24h avant départ', () => {
    expect(refundPolicy(12)).toBe(0.5);
    expect(refundPolicy(2)).toBe(0.5);
  });

  it('aucun remboursement si annulation < 2h avant départ', () => {
    expect(refundPolicy(1)).toBe(0);
    expect(refundPolicy(0)).toBe(0);
  });
});
