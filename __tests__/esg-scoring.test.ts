import { describe, it, expect } from 'vitest';
import { calculateEsgScore } from '../src/lib/esg-scoring';

describe('calculateEsgScore', () => {
  it('should return a basic score for empty responses', () => {
    const result = calculateEsgScore({}, 'technology');
    expect(result.overall).toBeDefined();
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.rating).toBeDefined();
  });
});
