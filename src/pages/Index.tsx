import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { 
  movePlayer, 
  updatePlayerMoney, 
  nextPlayer, 
  setCurrentView,
  updateSettings,
  updatePlayers,
  updateBuyRequests,
  updateBoardSpaces,
  startGame,
} from "@/store/gameSlice";
import { executeActionCard } from "@/utils/actionCards";
import GameBoard from "@/components/GameBoard";
import GameSettings from "@/components/GameSettings";

const Index = () => {
  const dispatch = useAppDispatch();
  const {
    players,
    currentPlayer,
    buyRequests,
    currentView,
    settings,
    gameInProgress
  } = useAppSelector(state => state.game);

  useEffect(() => {
    document.title = `${settings.gameTitle} - Board Game`;
  }, [settings.gameTitle]);

  const getRandomCard = <T,>(cards: T[]): T => {
    return cards[Math.floor(Math.random() * cards.length)];
  };

  const handleRollDice = (total: number, dice1: number, dice2: number) => {
    console.log(`${players[currentPlayer].name} rolled ${dice1} + ${dice2} = ${total}`);
    
    // Move current player
    dispatch(movePlayer({ 
      playerId: players[currentPlayer].id, 
      steps: total 
    }));

    // Start the game if not already started
    if (!gameInProgress) {
      dispatch(startGame());
    }
  };

  const handleSaveProperties = (newProperties: any[]) => {
    dispatch(updateSettings({ properties: newProperties }));
    console.log('Properties saved:', newProperties.length);
  };

  const handleSaveBoardSpaces = (newSpaces: any[]) => {
    dispatch(updateBoardSpaces(newSpaces));
    console.log('Board spaces saved:', newSpaces.length);
  };

  const handleSaveNumberOfPlayers = (count: number) => {
    dispatch(updateSettings({ numberOfPlayers: count }));
    console.log('Number of players updated:', count);
  };

  const handleNextPlayer = () => {
    dispatch(nextPlayer());
  };

  const handleUpdateBoardSpaces = (newSpaces: any[]) => {
    dispatch(updateBoardSpaces(newSpaces));
  };

  const handleSaveGameTitle = (title: string) => {
    dispatch(updateSettings({ gameTitle: title }));
  };

  if (currentView === 'settings') {
    return (
      <GameSettings
        onBack={() => dispatch(setCurrentView('game'))}
        properties={settings.properties}
        boardSpaces={settings.boardSpaces}
        onSaveProperties={handleSaveProperties}
        onSaveBoardSpaces={handleSaveBoardSpaces}
        gameTitle={settings.gameTitle}
        onSaveGameTitle={handleSaveGameTitle}
        numberOfPlayers={settings.numberOfPlayers}
        onSaveNumberOfPlayers={handleSaveNumberOfPlayers}
      />
    );
  }

  return (
    <GameBoard
      players={players}
      boardSpaces={settings.boardSpaces}
      currentPlayer={currentPlayer}
      buyRequests={buyRequests}
      onRollDice={handleRollDice}
      onOpenSettings={() => dispatch(setCurrentView('settings'))}
      onUpdatePlayers={(newPlayers) => dispatch(updatePlayers(newPlayers))}
      onNextPlayer={handleNextPlayer}
      onUpdateBoardSpaces={handleUpdateBoardSpaces}
      onUpdateBuyRequests={(newRequests) => dispatch(updateBuyRequests(newRequests))}
      gameTitle={settings.gameTitle}
      questionCards={settings.questionCards}
      actionCards={settings.actionCards}
      getRandomCard={getRandomCard}
    />
  );
};

export default Index;
