/**
 * Component tests for UIOverlay
 * Tests UI rendering and user interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UIOverlay from '@/app/components/Game/UIOverlay';
import { CompletionData } from '@/app/components/Game/types';

describe('UIOverlay', () => {
  const mockSetJumpModifier = jest.fn();
  const mockOnRestart = jest.fn();

  const defaultProps = {
    gameState: 'start' as const,
    jumpModifier: 1.0,
    setJumpModifier: mockSetJumpModifier,
    onRestart: mockOnRestart,
    completionData: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<UIOverlay {...defaultProps} />);
      expect(screen.getByText('KILO MAN')).toBeInTheDocument();
    });

    it('should display game title', () => {
      render(<UIOverlay {...defaultProps} />);
      expect(screen.getByText('KILO MAN')).toBeInTheDocument();
    });

    it('should display controls instructions', () => {
      render(<UIOverlay {...defaultProps} />);
      expect(screen.getByText('ARROWS: Move')).toBeInTheDocument();
      expect(screen.getByText('SPACE: Jump')).toBeInTheDocument();
    });
  });

  describe('Start Screen', () => {
    it('should show start screen when gameState is start', () => {
      render(<UIOverlay {...defaultProps} gameState="start" />);
      expect(screen.getByText('START GAME')).toBeInTheDocument();
    });

    it('should display start instructions', () => {
      render(<UIOverlay {...defaultProps} gameState="start" />);
      expect(screen.getByText(/Use Arrow Keys to Move/)).toBeInTheDocument();
      expect(screen.getByText(/Space to Jump/)).toBeInTheDocument();
    });

    it('should call onRestart when start button is clicked', () => {
      render(<UIOverlay {...defaultProps} gameState="start" />);
      const startButton = screen.getByText('START GAME');
      fireEvent.click(startButton);
      expect(mockOnRestart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Playing State', () => {
    it('should not show game over screen when playing', () => {
      render(<UIOverlay {...defaultProps} gameState="playing" />);
      expect(screen.queryByText('MISSION COMPLETE')).not.toBeInTheDocument();
      expect(screen.queryByText('GAME OVER')).not.toBeInTheDocument();
    });

    it('should not show start screen when playing', () => {
      render(<UIOverlay {...defaultProps} gameState="playing" />);
      expect(screen.queryByText('START GAME')).not.toBeInTheDocument();
    });
  });

  describe('Jump Modifier Control', () => {
    it('should display current jump power percentage', () => {
      render(<UIOverlay {...defaultProps} jumpModifier={1.0} />);
      expect(screen.getByText('Jump Power: 100%')).toBeInTheDocument();
    });

    it('should display jump power for different values', () => {
      const { rerender } = render(<UIOverlay {...defaultProps} jumpModifier={1.5} />);
      expect(screen.getByText('Jump Power: 150%')).toBeInTheDocument();

      rerender(<UIOverlay {...defaultProps} jumpModifier={0.5} />);
      expect(screen.getByText('Jump Power: 50%')).toBeInTheDocument();
    });

    it('should render jump modifier slider', () => {
      render(<UIOverlay {...defaultProps} />);
      const slider = screen.getByLabelText(/Jump Power:/);
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('type', 'range');
    });

    it('should have correct slider attributes', () => {
      render(<UIOverlay {...defaultProps} jumpModifier={1.0} />);
      const slider = screen.getByLabelText(/Jump Power:/) as HTMLInputElement;
      
      expect(slider.min).toBe('0.5');
      expect(slider.max).toBe('2');
      expect(slider.step).toBe('0.1');
      expect(slider.value).toBe('1');
    });

    it('should call setJumpModifier when slider changes', () => {
      render(<UIOverlay {...defaultProps} />);
      const slider = screen.getByLabelText(/Jump Power:/);
      
      fireEvent.change(slider, { target: { value: '1.5' } });
      
      expect(mockSetJumpModifier).toHaveBeenCalledWith(1.5);
    });
  });

  describe('Win Screen', () => {
    const completionData: CompletionData = {
      completionTime: 45.67,
      points: 5433,
    };

    it('should show win screen when gameState is won', () => {
      render(<UIOverlay {...defaultProps} gameState="won" completionData={completionData} />);
      expect(screen.getByText('MISSION COMPLETE')).toBeInTheDocument();
    });

    it('should display completion time', () => {
      render(<UIOverlay {...defaultProps} gameState="won" completionData={completionData} />);
      expect(screen.getByText(/Time: 45\.67s/)).toBeInTheDocument();
    });

    it('should display points earned', () => {
      render(<UIOverlay {...defaultProps} gameState="won" completionData={completionData} />);
      expect(screen.getByText('5,433')).toBeInTheDocument();
      expect(screen.getByText('POINTS EARNED')).toBeInTheDocument();
    });

    it('should display win message', () => {
      render(<UIOverlay {...defaultProps} gameState="won" completionData={completionData} />);
      expect(screen.getByText(/Excellent work, Kilo Man/)).toBeInTheDocument();
    });

    it('should show retry button', () => {
      render(<UIOverlay {...defaultProps} gameState="won" completionData={completionData} />);
      expect(screen.getByText('RETRY MISSION')).toBeInTheDocument();
    });

    it('should call onRestart when retry button is clicked', () => {
      render(<UIOverlay {...defaultProps} gameState="won" completionData={completionData} />);
      const retryButton = screen.getByText('RETRY MISSION');
      fireEvent.click(retryButton);
      expect(mockOnRestart).toHaveBeenCalledTimes(1);
    });

    it('should format large point values with commas', () => {
      const largePointsData: CompletionData = {
        completionTime: 10,
        points: 10000,
      };
      render(<UIOverlay {...defaultProps} gameState="won" completionData={largePointsData} />);
      expect(screen.getByText('10,000')).toBeInTheDocument();
    });
  });

  describe('Loss Screen', () => {
    it('should show loss screen when gameState is lost', () => {
      render(<UIOverlay {...defaultProps} gameState="lost" />);
      expect(screen.getByText('GAME OVER')).toBeInTheDocument();
    });

    it('should display loss message', () => {
      render(<UIOverlay {...defaultProps} gameState="lost" />);
      expect(screen.getByText(/Kilo Man has fallen/)).toBeInTheDocument();
    });

    it('should show retry button on loss', () => {
      render(<UIOverlay {...defaultProps} gameState="lost" />);
      expect(screen.getByText('RETRY MISSION')).toBeInTheDocument();
    });

    it('should call onRestart when retry button is clicked on loss', () => {
      render(<UIOverlay {...defaultProps} gameState="lost" />);
      const retryButton = screen.getByText('RETRY MISSION');
      fireEvent.click(retryButton);
      expect(mockOnRestart).toHaveBeenCalledTimes(1);
    });

    it('should not show completion data on loss', () => {
      render(<UIOverlay {...defaultProps} gameState="lost" />);
      expect(screen.queryByText('POINTS EARNED')).not.toBeInTheDocument();
      expect(screen.queryByText(/Time:/)).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply yellow color to win title', () => {
      const completionData: CompletionData = {
        completionTime: 30,
        points: 7000,
      };
      render(<UIOverlay {...defaultProps} gameState="won" completionData={completionData} />);
      const title = screen.getByText('MISSION COMPLETE');
      expect(title).toHaveClass('text-yellow-400');
    });

    it('should apply red color to loss title', () => {
      render(<UIOverlay {...defaultProps} gameState="lost" />);
      const title = screen.getByText('GAME OVER');
      expect(title).toHaveClass('text-red-500');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null completion data gracefully', () => {
      render(<UIOverlay {...defaultProps} gameState="won" completionData={null} />);
      expect(screen.getByText('MISSION COMPLETE')).toBeInTheDocument();
      expect(screen.queryByText('POINTS EARNED')).not.toBeInTheDocument();
    });

    it('should handle zero completion time', () => {
      const zeroTimeData: CompletionData = {
        completionTime: 0,
        points: 10000,
      };
      render(<UIOverlay {...defaultProps} gameState="won" completionData={zeroTimeData} />);
      expect(screen.getByText(/Time: 0\.00s/)).toBeInTheDocument();
    });

    it('should handle minimum points', () => {
      const minPointsData: CompletionData = {
        completionTime: 100,
        points: 1000,
      };
      render(<UIOverlay {...defaultProps} gameState="won" completionData={minPointsData} />);
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });
  });
});
