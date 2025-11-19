export type EntityType = 'platform' | 'hazard' | 'goal' | 'start' | 'monster';

export interface LevelEntity {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: EntityType;
  // Visual properties
  color?: string;
  // Monster specific properties
  patrolStart?: number;
  patrolEnd?: number;
  speed?: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 1 | -1; // 1 = right, -1 = left
  frame: number; // Animation frame counter
}

export interface MonsterState {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  patrolStart: number;
  patrolEnd: number;
  speed: number;
}

export type GameStatus = 'start' | 'playing' | 'won' | 'lost';

export interface CompletionData {
  completionTime: number; // Time in seconds
  points: number;
}

export interface GameConfig {
  gravity: number;
  friction: number;
  moveSpeed: number;
  maxSpeed: number;
  baseJumpForce: number;
  levelWidth: number;
}