import { useEffect, useState } from "react";
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
  endGame,
  resetGame,
  Player,
} from "@/store/gameSlice";
import { gameEngine } from "@/utils/gameEngine";
import { executeActionCard } from "@/utils/actionCards";
import GameBoard from "@/components/GameBoard";
import GameSettings from "@/components/GameSettings";
import WinnerDialog from "@/components/WinnerDialog";

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

  const [winner, setWinner] = useState<Player | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);

  useEffect(() => {
    document.title = `${settings.gameTitle} - Board Game`;
  }, [settings.gameTitle]);

  const getRandomCard = <T,>(cards: T[]): T => {
    return cards[Math.floor(Math.random() * cards.length)];
  };

  const handleRollDice = (total: number, dice1: number, dice2: number) => {
    console.log(`${players[currentPlayer].name} rolled ${dice1} + ${dice2} = ${total}`);
    
    // Move current player
    const currentPlayerData = players[currentPlayer];
    const newPosition = (currentPlayerData.position + total) % 40;
    
    // Check if player passes GO
    let updatedPlayer = { ...currentPlayerData, position: newPosition };
    if (currentPlayerData.position + total >= 40 && currentPlayerData.position < 40) {
      updatedPlayer = gameEngine.handlePassingGO(updatedPlayer);
    }
    
    dispatch(movePlayer({ 
      playerId: players[currentPlayer].id, 
      steps: total 
    }));

    // Update player money if they passed GO
    if (updatedPlayer.money > currentPlayerData.money) {
      dispatch(updatePlayerMoney({
        playerId: currentPlayerData.id,
        amount: 200
      }));
    }

    // Start the game if not already started
    if (!gameInProgress) {
      dispatch(startGame());
    }

    // Check for win conditions after movement
    checkWinConditions();
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

  const checkWinConditions = () => {
    const gameStatus = gameEngine.getGameStatus(players);
    
    if (gameStatus.gameEnded && gameStatus.winner) {
      setWinner(gameStatus.winner);
      setShowWinnerDialog(true);
      dispatch(endGame({ winner: gameStatus.winner }));
    }
  };

  const handleNewGame = () => {
    setWinner(null);
    setShowWinnerDialog(false);
    dispatch(resetGame());
  };

  const handleViewBoard = () => {
    setShowWinnerDialog(false);
  };

  const handleActionCardExecuted = (actionCard: any, playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const result = gameEngine.executeActionCard(actionCard, player, settings.boardSpaces);
    
    // Update player state
    const updatedPlayers = players.map(p => 
      p.id === playerId ? result.updatedPlayer : p
    );
    dispatch(updatePlayers(updatedPlayers));
    
    // Update board spaces if changed
    dispatch(updateBoardSpaces(result.updatedBoardSpaces));
    
    // Check for win conditions
    if (result.shouldEndGame && result.winner) {
      setWinner(result.winner);
      setShowWinnerDialog(true);
      dispatch(endGame({ winner: result.winner }));
    }
  };

  const handleQuestionAnswered = (questionCard: any, selectedAnswer: number, playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const result = gameEngine.handleQuestionAnswer(questionCard, selectedAnswer, player, settings.boardSpaces);
    
    // Update player state
    const updatedPlayers = players.map(p => 
      p.id === playerId ? result.updatedPlayer : p
    );
    dispatch(updatePlayers(updatedPlayers));
    
    // Check for win conditions
    if (result.shouldEndGame && result.winner) {
      setWinner(result.winner);
      setShowWinnerDialog(true);
      dispatch(endGame({ winner: result.winner }));
    }
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
    <>
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
        onActionCardExecuted={handleActionCardExecuted}
        onQuestionAnswered={handleQuestionAnswered}
      />
      
      <WinnerDialog
        isOpen={showWinnerDialog}
        winner={winner}
        onNewGame={handleNewGame}
        onViewBoard={handleViewBoard}
      />
    </>
  );
};

export default Index;
