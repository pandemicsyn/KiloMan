/**
 * Component tests for GameContainer
 * Tests state management, game flow, and point calculation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import GameContainer from '@/app/components/Game/GameContainer';

// Mock the child components
jest.mock('@/app/components/Game/GameCanvas', () => {
  return function MockGameCanvas({ gameState, setGameState }: any) {
    return (
      <div data-testid="game-canvas">
        <button onClick={() => setGameState('won')}>Trigger Win</button>
        <button onClick={() => setGameState('lost')}>Trigger Loss</button>
        <span>Game State: {gameState}</span>
      </div>
    );
  };
});

jest.mock('@/app/components/Game/UIOverlay', () => {
  return function MockUIOverlay({ gameState, onRestart, completionData, jumpModifier, setJumpModifier }: any) {
    return (
      <div data-testid="ui-overlay">
        <span>UI State: {gameState}</span>
        <button onClick={onRestart}>Restart</button>
        {completionData && (
          <div data-testid="completion-data">
            <span>Time: {completionData.completionTime}</span>
            <span>Points: {completionData.points}</span>
          </div>
        )}
        <input
          type="range"
          value={jumpModifier}
          onChange={(e) => setJumpModifier(parseFloat(e.target.value))}
          data-testid="jump-modifier"
        />
      </div>
    );
  };
});

describe('GameContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<GameContainer />);
      expect(screen.getByTestId('game-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('ui-overlay')).toBeInTheDocument();
    });

    it('should render with correct initial state', () => {
      render(<GameContainer />);
      expect(screen.getByText('Game State: start')).toBeInTheDocument();
      expect(screen.getByText('UI State: start')).toBeInTheDocument();
    });

    it('should apply correct CSS classes', () => {
      const { container } = render(<GameContainer />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('relative', 'w-full', 'h-full', 'bg-black', 'overflow-hidden');
    });
  });

  describe('State Management', () => {
    it('should initialize with start state', () => {
      render(<GameContainer />);
      expect(screen.getByText('Game State: start')).toBeInTheDocument();
    });

    it('should initialize with jump modifier of 1.0', () => {
      render(<GameContainer />);
      const slider = screen.getByTestId('jump-modifier') as HTMLInputElement;
      expect(slider.value).toBe('1');
    });

    it('should update jump modifier when changed', () => {
      render(<GameContainer />);
      const slider = screen.getByTestId('jump-modifier') as HTMLInputElement;
      
      // Simulate changing the slider
      slider.value = '1.5';
      slider.dispatchEvent(new Event('change', { bubbles: true }));
      
      expect(slider.value).toBe('1.5');
    });
  });

  describe('Game Flow', () => {
    it('should transition to playing state on restart', () => {
      render(<GameContainer />);
      const restartButton = screen.getByText('Restart');
      
      restartButton.click();
      
      expect(screen.getByText('Game State: playing')).toBeInTheDocument();
    });

    it('should transition to won state', async () => {
      render(<GameContainer />);
      
      // Start the game first
      const restartButton = screen.getByText('Restart');
      restartButton.click();
      
      // Trigger win
      const winButton = screen.getByText('Trigger Win');
      winButton.click();
      
      await waitFor(() => {
        expect(screen.getByText('Game State: won')).toBeInTheDocument();
      });
    });

    it('should transition to lost state', async () => {
      render(<GameContainer />);
      
      // Start the game first
      const restartButton = screen.getByText('Restart');
      restartButton.click();
      
      // Trigger loss
      const lossButton = screen.getByText('Trigger Loss');
      lossButton.click();
      
      await waitFor(() => {
        expect(screen.getByText('Game State: lost')).toBeInTheDocument();
      });
    });

    it('should reset to playing state when restarting after game over', async () => {
      render(<GameContainer />);
      
      // Start game
      const restartButton = screen.getByText('Restart');
      restartButton.click();
      
      // Lose the game
      const lossButton = screen.getByText('Trigger Loss');
      lossButton.click();
      
      await waitFor(() => {
        expect(screen.getByText('Game State: lost')).toBeInTheDocument();
      });
      
      // Restart again
      restartButton.click();
      
      expect(screen.getByText('Game State: playing')).toBeInTheDocument();
    });
  });

  describe('Completion Data', () => {
    it('should not show completion data initially', () => {
      render(<GameContainer />);
      expect(screen.queryByTestId('completion-data')).not.toBeInTheDocument();
    });

    it('should calculate and display completion data on win', async () => {
      render(<GameContainer />);
      
      // Start the game
      const restartButton = screen.getByText('Restart');
      restartButton.click();
      
      // Wait a bit to simulate game time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Trigger win
      const winButton = screen.getByText('Trigger Win');
      winButton.click();
      
      await waitFor(() => {
        const completionData = screen.getByTestId('completion-data');
        expect(completionData).toBeInTheDocument();
      });
    });

    it('should show time in completion data', async () => {
      render(<GameContainer />);
      
      const restartButton = screen.getByText('Restart');
      restartButton.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const winButton = screen.getByText('Trigger Win');
      winButton.click();
      
      await waitFor(() => {
        expect(screen.getByText(/Time:/)).toBeInTheDocument();
      });
    });

    it('should show points in completion data', async () => {
      render(<GameContainer />);
      
      const restartButton = screen.getByText('Restart');
      restartButton.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const winButton = screen.getByText('Trigger Win');
      winButton.click();
      
      await waitFor(() => {
        expect(screen.getByText(/Points:/)).toBeInTheDocument();
      });
    });

    it('should clear completion data when restarting', async () => {
      render(<GameContainer />);
      
      // Start and win
      const restartButton = screen.getByText('Restart');
      restartButton.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const winButton = screen.getByText('Trigger Win');
      winButton.click();
      
      await waitFor(() => {
        expect(screen.getByTestId('completion-data')).toBeInTheDocument();
      });
      
      // Restart
      restartButton.click();
      
      // Completion data should be cleared
      expect(screen.queryByTestId('completion-data')).not.toBeInTheDocument();
    });
  });

  describe('Point Calculation', () => {
    it('should calculate high points for fast completion', async () => {
      render(<GameContainer />);
      
      const restartButton = screen.getByText('Restart');
      restartButton.click();
      
      // Win almost immediately
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const winButton = screen.getByText('Trigger Win');
      winButton.click();
      
      await waitFor(() => {
        const completionData = screen.getByTestId('completion-data');
        const pointsText = completionData.textContent || '';
        // Should be close to 10000 points
        expect(pointsText).toMatch(/Points: (9[0-9]{3}|10000)/);
      });
    });
  });
});
