import { Player, BoardSpace, ActionCard, QuestionCard } from '../contexts/GameContext';
import { executeActionCard } from './actionCards';

export interface GameEngineResult {
  updatedPlayer: Player;
  updatedBoardSpaces: BoardSpace[];
  message: string;
  extraTurn?: boolean;
  shouldEndGame?: boolean;
  winner?: Player;
}

export interface WinCondition {
  type: 'money' | 'properties' | 'monopoly' | 'last-standing';
  threshold?: number;
  description: string;
}

const DEFAULT_WIN_CONDITIONS: WinCondition[] = [
  { type: 'money', threshold: 5000, description: 'First to reach $5,000' },
  { type: 'properties', threshold: 10, description: 'Own 10 properties' },
  { type: 'last-standing', description: 'Last player with money remaining' }
];

export class GameEngine {
  private winConditions: WinCondition[];

  constructor(winConditions: WinCondition[] = DEFAULT_WIN_CONDITIONS) {
    this.winConditions = winConditions;
  }

  // Handle player landing on a space
  handleSpaceLanding(
    player: Player, 
    space: BoardSpace, 
    allPlayers: Player[], 
    boardSpaces: BoardSpace[]
  ): GameEngineResult {
    let updatedPlayer = { ...player };
    let updatedBoardSpaces = [...boardSpaces];
    let message = `${player.name} landed on ${space.name}`;
    let extraTurn = false;

    switch (space.type) {
      case 'property':
        if (space.ownerId && space.ownerId !== player.id && space.rent) {
          // Pay rent to owner
          const owner = allPlayers.find(p => p.id === space.ownerId);
          if (owner) {
            const rentAmount = Math.min(space.rent, updatedPlayer.money);
            updatedPlayer.money -= rentAmount;
            message = `${player.name} paid $${rentAmount} rent to ${owner.name} for ${space.name}`;
          }
        }
        break;

      case 'corner':
        if (space.id === '0') { // GO space
          updatedPlayer.money += 200;
          message = `${player.name} landed on GO and collected $200!`;
        } else if (space.id === '30') { // Go to Jail
          updatedPlayer.position = 10; // Jail position
          message = `${player.name} goes to jail!`;
        }
        break;

      case 'jail':
        // Just visiting unless sent here
        message = `${player.name} is just visiting jail`;
        break;
    }

    const winCheck = this.checkWinConditions(updatedPlayer, allPlayers);
    
    return {
      updatedPlayer,
      updatedBoardSpaces,
      message,
      extraTurn,
      shouldEndGame: winCheck.hasWon,
      winner: winCheck.hasWon ? updatedPlayer : undefined
    };
  }

  // Execute action card effects
  executeActionCard(
    actionCard: ActionCard,
    player: Player,
    boardSpaces: BoardSpace[]
  ): GameEngineResult {
    const result = executeActionCard(actionCard, player, boardSpaces);
    
    return {
      updatedPlayer: result.updatedPlayer,
      updatedBoardSpaces: result.updatedBoardSpaces,
      message: result.message,
      extraTurn: actionCard.effect === 'extra-turn'
    };
  }

  // Handle question card answers
  handleQuestionAnswer(
    questionCard: QuestionCard,
    selectedAnswer: number,
    player: Player,
    boardSpaces: BoardSpace[]
  ): GameEngineResult {
    let updatedPlayer = { ...player };
    let message = '';

    if (selectedAnswer === questionCard.correctAnswer) {
      updatedPlayer.money += questionCard.reward;
      message = `Correct! ${player.name} earned $${questionCard.reward}`;
    } else {
      updatedPlayer.money = Math.max(0, updatedPlayer.money - questionCard.penalty);
      message = `Wrong answer. ${player.name} lost $${questionCard.penalty}`;
    }

    const winCheck = this.checkWinConditions(updatedPlayer, [player]);

    return {
      updatedPlayer,
      updatedBoardSpaces: boardSpaces,
      message,
      shouldEndGame: winCheck.hasWon,
      winner: winCheck.hasWon ? updatedPlayer : undefined
    };
  }

  // Check if player has won
  checkWinConditions(player: Player, allPlayers: Player[]): { hasWon: boolean; condition?: WinCondition } {
    for (const condition of this.winConditions) {
      switch (condition.type) {
        case 'money':
          if (condition.threshold && player.money >= condition.threshold) {
            return { hasWon: true, condition };
          }
          break;

        case 'properties':
          if (condition.threshold && player.properties.length >= condition.threshold) {
            return { hasWon: true, condition };
          }
          break;

        case 'monopoly':
          // Check if player owns all properties of any color group
          const colorGroups = this.getColorGroups(player.properties);
          const hasMonopoly = Object.values(colorGroups).some(count => count >= 3); // Assuming 3+ properties = monopoly
          if (hasMonopoly) {
            return { hasWon: true, condition };
          }
          break;

        case 'last-standing':
          const playersWithMoney = allPlayers.filter(p => p.money > 0);
          if (playersWithMoney.length === 1 && playersWithMoney[0].id === player.id) {
            return { hasWon: true, condition };
          }
          break;
      }
    }

    return { hasWon: false };
  }

  // Helper to group properties by color
  private getColorGroups(propertyIds: string[]): Record<string, number> {
    // This would need to be implemented based on your property structure
    // For now, returning empty object
    return {};
  }

  // Check if any player is bankrupt
  checkBankruptcy(players: Player[]): Player[] {
    return players.filter(player => player.money <= 0);
  }

  // Handle GO space bonus
  handlePassingGO(player: Player): Player {
    return {
      ...player,
      money: player.money + 200
    };
  }

  // Get game status summary
  getGameStatus(players: Player[]): {
    activePlayers: Player[];
    bankruptPlayers: Player[];
    gameEnded: boolean;
    winner?: Player;
  } {
    const activePlayers = players.filter(p => p.money > 0);
    const bankruptPlayers = players.filter(p => p.money <= 0);
    
    // Check for winner
    let winner: Player | undefined;
    
    // Last standing wins
    if (activePlayers.length === 1) {
      winner = activePlayers[0];
    } else {
      // Check other win conditions
      for (const player of activePlayers) {
        const winCheck = this.checkWinConditions(player, players);
        if (winCheck.hasWon) {
          winner = player;
          break;
        }
      }
    }

    return {
      activePlayers,
      bankruptPlayers,
      gameEnded: !!winner || activePlayers.length <= 1,
      winner
    };
  }
}

export const gameEngine = new GameEngine();