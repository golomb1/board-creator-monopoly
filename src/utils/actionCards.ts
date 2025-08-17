import { ActionCard, Player, BoardSpace } from '../store/gameSlice';

export interface ActionFunction {
  (player: Player, boardSpaces: BoardSpace[], value?: number): {
    updatedPlayer: Player;
    updatedBoardSpaces: BoardSpace[];
    message: string;
  };
}

export const actionCardDictionary: Record<ActionCard['effect'], ActionFunction> = {
  'skip-turn': (player: Player, boardSpaces: BoardSpace[], value?: number) => {
    return {
      updatedPlayer: { ...player, skipNextTurn: true },
      updatedBoardSpaces: boardSpaces,
      message: `${player.name} will skip their next turn.`
    };
  },

  'extra-turn': (player: Player, boardSpaces: BoardSpace[], value?: number) => {
    return {
      updatedPlayer: player,
      updatedBoardSpaces: boardSpaces,
      message: `${player.name} gets an extra turn!`
    };
  },

  'collect-money': (player: Player, boardSpaces: BoardSpace[], amount: number = 200) => {
    return {
      updatedPlayer: { ...player, money: player.money + amount },
      updatedBoardSpaces: boardSpaces,
      message: `${player.name} collected $${amount}!`
    };
  },

  'pay-money': (player: Player, boardSpaces: BoardSpace[], amount: number = 100) => {
    const newMoney = Math.max(0, player.money - amount);
    return {
      updatedPlayer: { ...player, money: newMoney },
      updatedBoardSpaces: boardSpaces,
      message: `${player.name} paid $${amount}.`
    };
  },

  'go-to-jail': (player: Player, boardSpaces: BoardSpace[], value?: number) => {
    return {
      updatedPlayer: { ...player, position: 10 }, // Assuming jail is at position 10
      updatedBoardSpaces: boardSpaces,
      message: `${player.name} goes to jail!`
    };
  },

  'advance-spaces': (player: Player, boardSpaces: BoardSpace[], spaces: number = 3) => {
    const newPosition = (player.position + spaces) % boardSpaces.length;
    return {
      updatedPlayer: { ...player, position: newPosition },
      updatedBoardSpaces: boardSpaces,
      message: `${player.name} advances ${spaces} spaces to ${boardSpaces[newPosition]?.name || 'unknown position'}.`
    };
  },
};

export const executeActionCard = (
  actionCard: ActionCard, 
  player: Player, 
  boardSpaces: BoardSpace[]
): ReturnType<ActionFunction> => {
  const actionFunction = actionCardDictionary[actionCard.effect];
  
  if (!actionFunction) {
    console.error(`Unknown action effect: ${actionCard.effect}`);
    return {
      updatedPlayer: player,
      updatedBoardSpaces: boardSpaces,
      message: `Unknown action: ${actionCard.title}`
    };
  }

  // Pass the value from the action card if it exists
  if (actionCard.effect === 'collect-money' || actionCard.effect === 'pay-money') {
    return actionFunction(player, boardSpaces, actionCard.value || 0);
  } else if (actionCard.effect === 'advance-spaces') {
    return actionFunction(player, boardSpaces, actionCard.value || 3);
  }

  return actionFunction(player, boardSpaces);
};