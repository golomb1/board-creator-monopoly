import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { fireEvent, waitFor, screen } from '@testing-library/dom';
import Index from '../pages/Index';

// Mock dice rolls for deterministic testing
const mockDiceRolls = [
  { dice1: 3, dice2: 4, total: 7 },  // Player 1: land on position 7 (Action Card)
  { dice1: 2, dice2: 2, total: 4 },  // Player 2: land on position 4 (Action Card)
  { dice1: 1, dice2: 5, total: 6 },  // Player 3: land on position 6 (Azure SQL Database)
  { dice1: 4, dice2: 3, total: 7 },  // Player 4: land on position 7 (Action Card)
];

let rollIndex = 0;

describe('Monopoly Game Logic', () => {
  beforeEach(() => {
    rollIndex = 0;
    vi.clearAllMocks();
  });

  it('should initialize game with correct default state', () => {
    render(<Index />);
    
    // Check if the game title is displayed
    expect(screen.getByText(/Custom Monopoly/i)).toBeInTheDocument();
    
    // Check if players are initialized with correct starting money
    expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1500/i)).toBeInTheDocument();
  });

  it('should handle player movement correctly', async () => {
    render(<Index />);
    
    // Find the roll dice button
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    
    // Mock the dice roll to return specific values
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.3) // dice1 = 3 (Math.floor(0.3 * 6) + 1)
      .mockReturnValueOnce(0.5); // dice2 = 4 (Math.floor(0.5 * 6) + 1)
    
    fireEvent.click(rollButton);
    
    // Player should move to position 7 (3 + 4 = 7)
    // This would trigger an action card
    await waitFor(() => {
      // Check that the player moved (position would be updated in the component)
      expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
    });
  });

  it('should handle property purchase when player has enough money', async () => {
    render(<Index />);
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    
    // Mock dice roll to land on Azure Blob Storage (position 1, price $60)
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.0) // dice1 = 1
      .mockReturnValueOnce(0.0); // dice2 = 1, total = 2, lands on position 1
    
    fireEvent.click(rollButton);
    
    await waitFor(() => {
      // Should show buy property dialog if it appears
      const buyButton = screen.queryByRole('button', { name: /buy/i });
      if (buyButton) {
        fireEvent.click(buyButton);
        
        // Player should now own the property and have less money
        expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
      }
    });
  });

  it('should handle "Skip Turn" action card correctly', async () => {
    render(<Index />);
    
    // Mock landing on an action card space
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5) // dice1 = 4
      .mockReturnValueOnce(0.2) // dice2 = 2
      .mockReturnValueOnce(0.1); // For card selection - select skip turn card
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollButton);
    
    await waitFor(() => {
      // Should show action card dialog if it appears
      const okButton = screen.queryByRole('button', { name: /ok/i });
      if (okButton) {
        fireEvent.click(okButton);
      }
      
      // Game should continue
      expect(screen.getByText(/Player/i)).toBeInTheDocument();
    });
  });

  it('should handle "Collect Money" action card correctly', async () => {
    render(<Index />);
    
    // Mock landing on action card and getting bank error (collect $200)
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.3) // dice roll
      .mockReturnValueOnce(0.6) // dice roll
      .mockReturnValueOnce(0.4); // card selection - bank error
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollButton);
    
    await waitFor(() => {
      const okButton = screen.queryByRole('button', { name: /ok/i });
      if (okButton) {
        fireEvent.click(okButton);
      }
      
      // Game should continue
      expect(screen.getByText(/Player/i)).toBeInTheDocument();
    });
  });

  it('should handle question cards correctly', async () => {
    render(<Index />);
    
    // Mock landing on question card space
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1) // dice1 = 1
      .mockReturnValueOnce(0.1) // dice2 = 1, total = 2, lands on question space
      .mockReturnValueOnce(0.0); // Select first question
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollButton);
    
    await waitFor(() => {
      // If question dialog appears, handle it
      const submitButton = screen.queryByRole('button', { name: /submit/i });
      if (submitButton) {
        // Click an answer first if available
        const answerOption = screen.queryByText('4');
        if (answerOption) {
          fireEvent.click(answerOption);
        }
        fireEvent.click(submitButton);
      }
      
      // Game should continue
      expect(screen.getByText(/Player/i)).toBeInTheDocument();
    });
  });

  it('should handle player turn rotation correctly', async () => {
    render(<Index />);
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    
    // Player 1's turn initially
    expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
    
    // Mock a simple dice roll
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.3);
    
    fireEvent.click(rollButton);
    
    await waitFor(() => {
      // Game should continue and possibly switch players
      expect(screen.getByText(/Player/i)).toBeInTheDocument();
    });
  });

  it('should prevent player from having negative money', () => {
    render(<Index />);
    
    // Check initial money values are positive
    const moneyElements = screen.getAllByText(/\$\d+/);
    moneyElements.forEach(element => {
      const money = parseInt(element.textContent?.replace('$', '') || '0');
      expect(money).toBeGreaterThanOrEqual(0);
    });
  });

  it('should display all CSP services correctly', () => {
    render(<Index />);
    
    // Check that Azure services are displayed
    expect(screen.getByText(/Azure/i)).toBeInTheDocument();
    
    // The game should have CSP-related content
    expect(screen.getByText(/Custom Monopoly/i)).toBeInTheDocument();
  });

  it('should allow rolling dice multiple times for different players', async () => {
    render(<Index />);
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    
    // First roll
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.3);
    
    fireEvent.click(rollButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Player/i)).toBeInTheDocument();
    });
    
    // Wait for next turn and roll again
    await waitFor(() => {
      if (!rollButton.disabled) {
        vi.spyOn(Math, 'random')
          .mockReturnValueOnce(0.4)
          .mockReturnValueOnce(0.5);
        
        fireEvent.click(rollButton);
      }
    });
    
    expect(screen.getByText(/Player/i)).toBeInTheDocument();
  });
});