/**
 * Integration tests for game flow
 * Tests complete game scenarios and state transitions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import GameContainer from '@/app/components/Game/GameContainer';

// Mock GameCanvas to simulate game events
jest.mock('@/app/components/Game/GameCanvas', () => {
  return function MockGameCanvas({ gameState, setGameState }: any) {
    // Expose methods to trigger game events for testing
    React.useEffect(() => {
      if (gameState === 'playing') {
        // Store setGameState in window for test access
        (window as any).triggerWin = () => setGameState('won');
        (window as any).triggerLoss = () => setGameState('lost');
      }
    }, [gameState, setGameState]);

    return <canvas data-testid="game-canvas" />;
  };
});

jest.mock('@/app/components/Game/UIOverlay', () => {
  return function MockUIOverlay({ gameState, onRestart, completionData }: any) {
    return (
      <div data-testid="ui-overlay">
        <div data-testid="game-state">{gameState}</div>
        {gameState === 'start' && (
          <button onClick={onRestart} data-testid="start-button">Start Game</button>
        )}
        {(gameState === 'won' || gameState === 'lost') && (
          <>
            <button onClick={onRestart} data-testid="restart-button">Restart</button>
            {completionData && (
              <div data-testid="completion-data">
                <span data-testid="completion-time">{completionData.completionTime}</span>
                <span data-testid="completion-points">{completionData.points}</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };
});

describe('Game Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).triggerWin;
    delete (window as any).triggerLoss;
  });

  describe('Complete Game Flow: Start → Play → Win', () => {
    it('should complete full win flow', async () => {
      render(<GameContainer />);

      // Initial state should be 'start'
      expect(screen.getByTestId('game-state')).toHaveTextContent('start');

      // Click start button
      const startButton = screen.getByTestId('start-button');
      startButton.click();

      // Should transition to 'playing'
      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });

      // Simulate winning the game
      await waitFor(() => {
        expect((window as any).triggerWin).toBeDefined();
      });
      (window as any).triggerWin();

      // Should transition to 'won'
      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('won');
      });

      // Should show completion data
      expect(screen.getByTestId('completion-data')).toBeInTheDocument();
    });

    it('should calculate completion time on win', async () => {
      render(<GameContainer />);

      const startButton = screen.getByTestId('start-button');
      startButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });

      // Wait a bit to simulate game time
      await new Promise(resolve => setTimeout(resolve, 100));

      await waitFor(() => {
        expect((window as any).triggerWin).toBeDefined();
      });
      (window as any).triggerWin();

      await waitFor(() => {
        const completionTime = screen.getByTestId('completion-time');
        const time = parseFloat(completionTime.textContent || '0');
        // Should have some time elapsed (at least 0.1 seconds)
        expect(time).toBeGreaterThan(0);
      });
    });

    it('should calculate points on win', async () => {
      render(<GameContainer />);

      const startButton = screen.getByTestId('start-button');
      startButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });

      await waitFor(() => {
        expect((window as any).triggerWin).toBeDefined();
      });
      (window as any).triggerWin();

      await waitFor(() => {
        const completionPoints = screen.getByTestId('completion-points');
        const points = parseInt(completionPoints.textContent || '0');
        // Should have points between 1000 and 10000
        expect(points).toBeGreaterThanOrEqual(1000);
        expect(points).toBeLessThanOrEqual(10000);
      });
    });
  });

  describe('Complete Game Flow: Start → Play → Lose', () => {
    it('should complete full loss flow', async () => {
      render(<GameContainer />);

      // Start the game
      const startButton = screen.getByTestId('start-button');
      startButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });

      // Simulate losing the game
      await waitFor(() => {
        expect((window as any).triggerLoss).toBeDefined();
      });
      (window as any).triggerLoss();

      // Should transition to 'lost'
      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('lost');
      });
    });

    it('should not show completion data on loss', async () => {
      render(<GameContainer />);

      const startButton = screen.getByTestId('start-button');
      startButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });

      await waitFor(() => {
        expect((window as any).triggerLoss).toBeDefined();
      });
      (window as any).triggerLoss();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('lost');
      });

      // Should not show completion data
      expect(screen.queryByTestId('completion-data')).not.toBeInTheDocument();
    });
  });

  describe('Restart Functionality', () => {
    it('should restart after winning', async () => {
      render(<GameContainer />);

      // Start and win
      const startButton = screen.getByTestId('start-button');
      startButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });

      await waitFor(() => {
        expect((window as any).triggerWin).toBeDefined();
      });
      (window as any).triggerWin();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('won');
      });

      // Restart
      const restartButton = screen.getByTestId('restart-button');
      restartButton.click();

      // Should go back to playing
      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });
    });

    it('should restart after losing', async () => {
      render(<GameContainer />);

      // Start and lose
      const startButton = screen.getByTestId('start-button');
      startButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });

      await waitFor(() => {
        expect((window as any).triggerLoss).toBeDefined();
      });
      (window as any).triggerLoss();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('lost');
      });

      // Restart
      const restartButton = screen.getByTestId('restart-button');
      restartButton.click();

      // Should go back to playing
      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });
    });

    it('should clear completion data on restart', async () => {
      render(<GameContainer />);

      // Start and win
      const startButton = screen.getByTestId('start-button');
      startButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });

      await waitFor(() => {
        expect((window as any).triggerWin).toBeDefined();
      });
      (window as any).triggerWin();

      await waitFor(() => {
        expect(screen.getByTestId('completion-data')).toBeInTheDocument();
      });

      // Restart
      const restartButton = screen.getByTestId('restart-button');
      restartButton.click();

      // Completion data should be cleared
      expect(screen.queryByTestId('completion-data')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Game Sessions', () => {
    it('should handle multiple win sessions', async () => {
      render(<GameContainer />);

      // First session
      screen.getByTestId('start-button').click();
      await waitFor(() => expect(screen.getByTestId('game-state')).toHaveTextContent('playing'));
      await waitFor(() => expect((window as any).triggerWin).toBeDefined());
      (window as any).triggerWin();
      await waitFor(() => expect(screen.getByTestId('game-state')).toHaveTextContent('won'));

      // Second session
      screen.getByTestId('restart-button').click();
      await waitFor(() => expect(screen.getByTestId('game-state')).toHaveTextContent('playing'));
      await waitFor(() => expect((window as any).triggerWin).toBeDefined());
      (window as any).triggerWin();
      await waitFor(() => expect(screen.getByTestId('game-state')).toHaveTextContent('won'));

      // Should show completion data for second session
      expect(screen.getByTestId('completion-data')).toBeInTheDocument();
    });

    it('should handle win then loss sessions', async () => {
      render(<GameContainer />);

      // Win first
      screen.getByTestId('start-button').click();
      await waitFor(() => expect(screen.getByTestId('game-state')).toHaveTextContent('playing'));
      await waitFor(() => expect((window as any).triggerWin).toBeDefined());
      (window as any).triggerWin();
      await waitFor(() => expect(screen.getByTestId('game-state')).toHaveTextContent('won'));

      // Lose second
      screen.getByTestId('restart-button').click();
      await waitFor(() => expect(screen.getByTestId('game-state')).toHaveTextContent('playing'));
      await waitFor(() => expect((window as any).triggerLoss).toBeDefined());
      (window as any).triggerLoss();
      await waitFor(() => expect(screen.getByTestId('game-state')).toHaveTextContent('lost'));

      // Should not show completion data after loss
      expect(screen.queryByTestId('completion-data')).not.toBeInTheDocument();
    });
  });

  describe('Timer Accuracy', () => {
    it('should track time accurately across game session', async () => {
      render(<GameContainer />);

      const startButton = screen.getByTestId('start-button');
      startButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });

      const startTime = Date.now();
      
      // Wait for a specific duration
      await new Promise(resolve => setTimeout(resolve, 200));

      await waitFor(() => {
        expect((window as any).triggerWin).toBeDefined();
      });
      (window as any).triggerWin();

      const endTime = Date.now();
      const expectedTime = (endTime - startTime) / 1000;

      await waitFor(() => {
        const completionTime = screen.getByTestId('completion-time');
        const actualTime = parseFloat(completionTime.textContent || '0');
        
        // Should be within 100ms of expected time
        expect(Math.abs(actualTime - expectedTime)).toBeLessThan(0.1);
      });
    });
  });
});
