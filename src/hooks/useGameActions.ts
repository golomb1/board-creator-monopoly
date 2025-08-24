import { useGame } from '@/contexts/GameContext';
import type { Player, BuyRequest, BoardSpace, GameSettings } from '@/contexts/GameContext';

export const useGameActions = () => {
  const { dispatch } = useGame();

  const movePlayer = (playerId: string, steps: number) => {
    dispatch({ type: 'MOVE_PLAYER', payload: { playerId, steps } });
  };

  const updatePlayerMoney = (playerId: string, amount: number) => {
    dispatch({ type: 'UPDATE_PLAYER_MONEY', payload: { playerId, amount } });
  };

  const setPlayerSkipTurn = (playerId: string, skip: boolean) => {
    dispatch({ type: 'SET_PLAYER_SKIP_TURN', payload: { playerId, skip } });
  };

  const addPropertyToPlayer = (playerId: string, propertyId: string) => {
    dispatch({ type: 'ADD_PROPERTY_TO_PLAYER', payload: { playerId, propertyId } });
  };

  const removePropertyFromPlayer = (playerId: string, propertyId: string) => {
    dispatch({ type: 'REMOVE_PROPERTY_FROM_PLAYER', payload: { playerId, propertyId } });
  };

  const nextPlayer = () => {
    dispatch({ type: 'NEXT_PLAYER' });
  };

  const setCurrentView = (view: 'game' | 'settings') => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  };

  const updateSettings = (settings: Partial<GameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const updatePlayers = (players: Player[]) => {
    dispatch({ type: 'UPDATE_PLAYERS', payload: players });
  };

  const updateBuyRequests = (buyRequests: BuyRequest[]) => {
    dispatch({ type: 'UPDATE_BUY_REQUESTS', payload: buyRequests });
  };

  const updateBoardSpaces = (boardSpaces: BoardSpace[]) => {
    dispatch({ type: 'UPDATE_BOARD_SPACES', payload: boardSpaces });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const startGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  const endGame = (winner: Player) => {
    dispatch({ type: 'END_GAME', payload: { winner } });
  };

  return {
    movePlayer,
    updatePlayerMoney,
    setPlayerSkipTurn,
    addPropertyToPlayer,
    removePropertyFromPlayer,
    nextPlayer,
    setCurrentView,
    updateSettings,
    updatePlayers,
    updateBuyRequests,
    updateBoardSpaces,
    resetGame,
    startGame,
    endGame,
  };
};