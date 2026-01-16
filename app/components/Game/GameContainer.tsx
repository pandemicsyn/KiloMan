'use client';

import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './GameCanvas';
import UIOverlay from './UIOverlay';
import { GameStatus, CompletionData } from './types';
import { calculatePoints } from './gameLogic';

const GameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<GameStatus>('start');
  const [jumpModifier, setJumpModifier] = useState<number>(1.0);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const startTimeRef = useRef<number>(0);

  // Track game start time
  useEffect(() => {
    if (gameState === 'playing') {
      startTimeRef.current = Date.now();
      setCompletionData(null);
    }
  }, [gameState]);

  // Calculate completion data when game is won
  useEffect(() => {
    if (gameState === 'won' && startTimeRef.current > 0) {
      const completionTime = (Date.now() - startTimeRef.current) / 1000; // Convert to seconds
      const points = calculatePoints(completionTime);
      setCompletionData({
        completionTime,
        points
      });
    }
  }, [gameState]);

  const handleRestart = () => {
    setGameState('playing');
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <GameCanvas
        gameState={gameState}
        setGameState={setGameState}
        jumpModifier={jumpModifier}
      />
      <UIOverlay
        gameState={gameState}
        jumpModifier={jumpModifier}
        setJumpModifier={setJumpModifier}
        onRestart={handleRestart}
        completionData={completionData}
      />
    </div>
  );
};

export default GameContainer;