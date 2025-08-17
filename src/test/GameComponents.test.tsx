import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { fireEvent, screen } from '@testing-library/dom';
import GameBoard from '../components/GameBoard';
import GameSettings from '../components/GameSettings';
import DiceRoller from '../components/DiceRoller';

const mockPlayers = [
  { id: '1', name: 'Player 1', color: '#e74c3c', position: 0, money: 1500, lockedMoney: 0, properties: [] },
  { id: '2', name: 'Player 2', color: '#3498db', position: 5, money: 1200, lockedMoney: 0, properties: ['1'] },
  { id: '3', name: 'Player 3', color: '#2ecc71', position: 10, money: 800, lockedMoney: 200, properties: ['3', '6'] },
  { id: '4', name: 'Player 4', color: '#f39c12', position: 15, money: 2000, lockedMoney: 0, properties: [] },
];

const mockBoardSpaces = [
  { id: '0', name: 'START', type: 'corner' as const },
  { id: '1', name: 'Azure Blob Storage', type: 'property' as const, color: 'azure', price: 60, rent: 8 },
  { id: '2', name: 'Question Card', type: 'question' as const },
  { id: '3', name: 'Azure Virtual Machines', type: 'property' as const, color: 'azure', price: 100, rent: 12 },
  { id: '4', name: 'Action Card', type: 'action' as const },
  { id: '5', name: 'Cloud Railroad', type: 'property' as const, price: 200, rent: 25 },
];

const mockProperties = [
  { id: '1', name: 'Azure Blob Storage', color: 'azure', price: 60, rent: 8, description: 'Object storage' },
  { id: '3', name: 'Azure Virtual Machines', color: 'azure', price: 100, rent: 12, description: 'VM service' },
];

const mockQuestionCards = [
  { id: 'q1', question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: 1, reward: 100, penalty: 50 },
];

const mockActionCards = [
  { id: 'a1', title: 'Skip Turn', description: 'Skip your next turn', effect: 'skip-turn' as const },
];

describe('GameBoard Component', () => {
  const defaultProps = {
    players: mockPlayers,
    boardSpaces: mockBoardSpaces,
    currentPlayer: 0,
    buyRequests: [],
    onRollDice: vi.fn(),
    onOpenSettings: vi.fn(),
    onUpdatePlayers: vi.fn(),
    onNextPlayer: vi.fn(),
    onUpdateBoardSpaces: vi.fn(),
    onUpdateBuyRequests: vi.fn(),
    gameTitle: 'Test Game',
    questionCards: mockQuestionCards,
    actionCards: mockActionCards,
    getRandomCard: vi.fn(),
  };

  it('should render game board with correct title', () => {
    render(<GameBoard {...defaultProps} />);
    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });

  it('should display all players with correct information', () => {
    render(<GameBoard {...defaultProps} />);
    
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('Player 3')).toBeInTheDocument();
    expect(screen.getByText('Player 4')).toBeInTheDocument();
  });

  it('should display board spaces correctly', () => {
    render(<GameBoard {...defaultProps} />);
    
    expect(screen.getByText('START')).toBeInTheDocument();
    expect(screen.getByText('Azure Blob Storage')).toBeInTheDocument();
    expect(screen.getByText('Question Card')).toBeInTheDocument();
    expect(screen.getByText('Azure Virtual Machines')).toBeInTheDocument();
    expect(screen.getByText('Action Card')).toBeInTheDocument();
  });

  it('should call onRollDice when dice is rolled', () => {
    const mockOnRollDice = vi.fn();
    render(<GameBoard {...defaultProps} onRollDice={mockOnRollDice} />);
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollButton);
    
    expect(mockOnRollDice).toHaveBeenCalled();
  });

  it('should call onOpenSettings when settings button is clicked', () => {
    const mockOnOpenSettings = vi.fn();
    render(<GameBoard {...defaultProps} onOpenSettings={mockOnOpenSettings} />);
    
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);
    
    expect(mockOnOpenSettings).toHaveBeenCalled();
  });
});

describe('GameSettings Component', () => {
  const defaultProps = {
    onBack: vi.fn(),
    properties: mockProperties,
    boardSpaces: mockBoardSpaces,
    onSaveProperties: vi.fn(),
    onSaveBoardSpaces: vi.fn(),
    gameTitle: 'Test Game',
    onSaveGameTitle: vi.fn(),
    numberOfPlayers: 4,
    onSaveNumberOfPlayers: vi.fn(),
  };

  it('should render settings form', () => {
    render(<GameSettings {...defaultProps} />);
    
    // Check that the settings component renders
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    const mockOnBack = vi.fn();
    render(<GameSettings {...defaultProps} onBack={mockOnBack} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should display properties in settings', () => {
    render(<GameSettings {...defaultProps} />);
    
    // Check that properties are displayed
    expect(screen.getByText('Azure Blob Storage')).toBeInTheDocument();
    expect(screen.getByText('Azure Virtual Machines')).toBeInTheDocument();
  });
});

describe('DiceRoller Component', () => {
  it('should render roll dice button', () => {
    const mockOnRoll = vi.fn();
    render(<DiceRoller onRoll={mockOnRoll} />);
    
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
  });

  it('should call onRoll with dice values when clicked', () => {
    const mockOnRoll = vi.fn();
    
    // Mock Math.random to return specific values
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5) // dice1 = 4
      .mockReturnValueOnce(0.8); // dice2 = 5
    
    render(<DiceRoller onRoll={mockOnRoll} />);
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollButton);
    
    expect(mockOnRoll).toHaveBeenCalledWith(9, 4, 5);
  });

  it('should display dice results after rolling', () => {
    const mockOnRoll = vi.fn();
    
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2) // dice1 = 2
      .mockReturnValueOnce(0.4); // dice2 = 3
    
    render(<DiceRoller onRoll={mockOnRoll} />);
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollButton);
    
    // Should display the dice values
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Total: 5')).toBeInTheDocument();
  });
});