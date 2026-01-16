import { calculatePoints } from '../app/components/Game/gameLogic';

describe('Game Logic', () => {
  describe('calculatePoints', () => {
    it('should return maximum points (10000) for instant completion (0 seconds)', () => {
      expect(calculatePoints(0)).toBe(10000);
    });

    it('should return 9000 points for 10 second completion', () => {
      // 10000 - (10 * 100) = 9000
      expect(calculatePoints(10)).toBe(9000);
    });

    it('should return 5000 points for 50 second completion', () => {
      // 10000 - (50 * 100) = 5000
      expect(calculatePoints(50)).toBe(5000);
    });

    it('should return minimum points (1000) for 90 second completion', () => {
      // 10000 - (90 * 100) = 1000
      expect(calculatePoints(90)).toBe(1000);
    });

    it('should return minimum points (1000) for 100 second completion', () => {
      // 10000 - (100 * 100) = 0, but minimum is 1000
      expect(calculatePoints(100)).toBe(1000);
    });

    it('should return minimum points (1000) for very long completion times', () => {
      expect(calculatePoints(200)).toBe(1000);
      expect(calculatePoints(500)).toBe(1000);
      expect(calculatePoints(1000)).toBe(1000);
    });

    it('should handle decimal time values correctly', () => {
      // 10000 - floor(45.7 * 100) = 10000 - 4570 = 5430
      expect(calculatePoints(45.7)).toBe(5430);
      
      // 10000 - floor(25.3 * 100) = 10000 - 2530 = 7470
      expect(calculatePoints(25.3)).toBe(7470);
    });

    it('should floor the time calculation correctly', () => {
      // 10000 - floor(10.9 * 100) = 10000 - 1090 = 8910
      expect(calculatePoints(10.9)).toBe(8910);
      
      // 10000 - floor(10.1 * 100) = 10000 - 1010 = 8990
      expect(calculatePoints(10.1)).toBe(8990);
    });

    it('should handle edge case of exactly reaching minimum threshold', () => {
      // At 90 seconds: 10000 - (90 * 100) = 1000 (exactly at minimum)
      expect(calculatePoints(90)).toBe(1000);
    });

    it('should handle negative time values gracefully', () => {
      // Negative time should still return valid points
      // 10000 - floor(-10 * 100) = 10000 - (-1000) = 11000
      expect(calculatePoints(-10)).toBe(11000);
    });

    it('should handle zero and very small time values', () => {
      expect(calculatePoints(0)).toBe(10000);
      expect(calculatePoints(0.1)).toBe(9990);
      expect(calculatePoints(0.5)).toBe(9950);
    });

    it('should calculate points correctly for typical game completion times', () => {
      // Fast completion (30 seconds)
      expect(calculatePoints(30)).toBe(7000);
      
      // Average completion (60 seconds)
      expect(calculatePoints(60)).toBe(4000);
      
      // Slow completion (80 seconds)
      expect(calculatePoints(80)).toBe(2000);
    });
  });
});
