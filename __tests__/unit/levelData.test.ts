/**
 * Unit tests for level data validation
 * Ensures level structure is valid and playable
 */

import { LEVEL_1 } from '@/app/components/Game/levelData';
import { LevelEntity } from '@/app/components/Game/types';

describe('Level Data Validation', () => {
  describe('Basic Structure', () => {
    it('should have at least one entity', () => {
      expect(LEVEL_1.length).toBeGreaterThan(0);
    });

    it('should have all required properties for each entity', () => {
      LEVEL_1.forEach((entity, index) => {
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('x');
        expect(entity).toHaveProperty('y');
        expect(entity).toHaveProperty('w');
        expect(entity).toHaveProperty('h');
        expect(entity).toHaveProperty('type');
        
        // Ensure properties are the correct type
        expect(typeof entity.id).toBe('string');
        expect(typeof entity.x).toBe('number');
        expect(typeof entity.y).toBe('number');
        expect(typeof entity.w).toBe('number');
        expect(typeof entity.h).toBe('number');
        expect(typeof entity.type).toBe('string');
      });
    });

    it('should have unique IDs for all entities', () => {
      const ids = LEVEL_1.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Required Entities', () => {
    it('should have exactly one start position', () => {
      const startPositions = LEVEL_1.filter(e => e.type === 'start');
      expect(startPositions.length).toBe(1);
    });

    it('should have at least one goal', () => {
      const goals = LEVEL_1.filter(e => e.type === 'goal');
      expect(goals.length).toBeGreaterThanOrEqual(1);
    });

    it('should have at least one platform', () => {
      const platforms = LEVEL_1.filter(e => e.type === 'platform');
      expect(platforms.length).toBeGreaterThan(0);
    });
  });

  describe('Entity Types', () => {
    it('should only contain valid entity types', () => {
      const validTypes = ['platform', 'hazard', 'goal', 'start', 'monster'];
      LEVEL_1.forEach(entity => {
        expect(validTypes).toContain(entity.type);
      });
    });

    it('should have platforms', () => {
      const platforms = LEVEL_1.filter(e => e.type === 'platform');
      expect(platforms.length).toBeGreaterThan(0);
    });

    it('should have hazards', () => {
      const hazards = LEVEL_1.filter(e => e.type === 'hazard');
      expect(hazards.length).toBeGreaterThan(0);
    });

    it('should have monsters', () => {
      const monsters = LEVEL_1.filter(e => e.type === 'monster');
      expect(monsters.length).toBeGreaterThan(0);
    });
  });

  describe('Monster Properties', () => {
    it('should have patrol ranges for all monsters', () => {
      const monsters = LEVEL_1.filter(e => e.type === 'monster');
      monsters.forEach(monster => {
        expect(monster).toHaveProperty('patrolStart');
        expect(monster).toHaveProperty('patrolEnd');
        expect(typeof monster.patrolStart).toBe('number');
        expect(typeof monster.patrolEnd).toBe('number');
      });
    });

    it('should have valid patrol ranges (end > start)', () => {
      const monsters = LEVEL_1.filter(e => e.type === 'monster');
      monsters.forEach(monster => {
        expect(monster.patrolEnd!).toBeGreaterThan(monster.patrolStart!);
      });
    });

    it('should have speed defined for all monsters', () => {
      const monsters = LEVEL_1.filter(e => e.type === 'monster');
      monsters.forEach(monster => {
        expect(monster).toHaveProperty('speed');
        expect(typeof monster.speed).toBe('number');
        expect(monster.speed!).toBeGreaterThan(0);
      });
    });

    it('should have monster position within patrol range', () => {
      const monsters = LEVEL_1.filter(e => e.type === 'monster');
      monsters.forEach(monster => {
        expect(monster.x).toBeGreaterThanOrEqual(monster.patrolStart!);
        expect(monster.x).toBeLessThanOrEqual(monster.patrolEnd!);
      });
    });
  });

  describe('Geometric Validity', () => {
    it('should have positive dimensions for all entities', () => {
      LEVEL_1.forEach(entity => {
        // Start position can have 0 dimensions (it's just a marker)
        if (entity.type === 'start') {
          expect(entity.w).toBeGreaterThanOrEqual(0);
          expect(entity.h).toBeGreaterThanOrEqual(0);
        } else {
          expect(entity.w).toBeGreaterThan(0);
          expect(entity.h).toBeGreaterThan(0);
        }
      });
    });

    it('should have reasonable positions (not negative)', () => {
      LEVEL_1.forEach(entity => {
        expect(entity.x).toBeGreaterThanOrEqual(0);
        expect(entity.y).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have entities within reasonable bounds', () => {
      const maxX = 10000; // Reasonable level width
      const maxY = 1000;  // Reasonable level height
      
      LEVEL_1.forEach(entity => {
        expect(entity.x).toBeLessThan(maxX);
        expect(entity.y).toBeLessThan(maxY);
      });
    });
  });

  describe('Level Playability', () => {
    it('should have start position before goal position', () => {
      const start = LEVEL_1.find(e => e.type === 'start');
      const goal = LEVEL_1.find(e => e.type === 'goal');
      
      expect(start).toBeDefined();
      expect(goal).toBeDefined();
      expect(start!.x).toBeLessThan(goal!.x);
    });

    it('should have platforms distributed across the level', () => {
      const platforms = LEVEL_1.filter(e => e.type === 'platform');
      const xPositions = platforms.map(p => p.x);
      const minX = Math.min(...xPositions);
      const maxX = Math.max(...xPositions);
      
      // Platforms should span a significant distance
      expect(maxX - minX).toBeGreaterThan(1000);
    });

    it('should have goal at a reasonable height', () => {
      const goal = LEVEL_1.find(e => e.type === 'goal');
      expect(goal).toBeDefined();
      
      // Goal should be above the bottom of the screen (y < 600)
      expect(goal!.y).toBeLessThan(600);
    });
  });

  describe('Level Statistics', () => {
    it('should report level entity counts', () => {
      const stats = {
        platforms: LEVEL_1.filter(e => e.type === 'platform').length,
        hazards: LEVEL_1.filter(e => e.type === 'hazard').length,
        monsters: LEVEL_1.filter(e => e.type === 'monster').length,
        goals: LEVEL_1.filter(e => e.type === 'goal').length,
        total: LEVEL_1.length,
      };
      
      // Just verify we can calculate stats
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.platforms + stats.hazards + stats.monsters + stats.goals + 1).toBeLessThanOrEqual(stats.total);
    });
  });
});
