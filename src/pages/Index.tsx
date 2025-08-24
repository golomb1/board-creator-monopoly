import { useEffect, useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { useGameActions } from "@/hooks/useGameActions";
import type { Player } from "@/contexts/GameContext";
import { gameEngine } from "@/utils/gameEngine";
import { executeActionCard } from "@/utils/actionCards";
import GameBoard from "@/components/GameBoard";
import GameSettings from "@/components/GameSettings";
import WinnerDialog from "@/components/WinnerDialog";

const Index = () => {
  const { state } = useGame();
  const {
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
  } = useGameActions();

  const {
    players,
    currentPlayer,
    buyRequests,
    currentView,
    settings,
    gameInProgress
  } = state;

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
    
    movePlayer(players[currentPlayer].id, total);

    // Update player money if they passed GO
    if (updatedPlayer.money > currentPlayerData.money) {
      updatePlayerMoney(currentPlayerData.id, 200);
    }

    // Start the game if not already started
    if (!gameInProgress) {
      startGame();
    }

    // Check for win conditions after movement
    checkWinConditions();
  };

  const handleSaveProperties = (newProperties: any[]) => {
    updateSettings({ properties: newProperties });
    console.log('Properties saved:', newProperties.length);
  };

  const handleSaveBoardSpaces = (newSpaces: any[]) => {
    updateBoardSpaces(newSpaces);
    console.log('Board spaces saved:', newSpaces.length);
  };

  const handleSaveNumberOfPlayers = (count: number) => {
    updateSettings({ numberOfPlayers: count });
    console.log('Number of players updated:', count);
  };

  const handleNextPlayer = () => {
    nextPlayer();
  };

  const handleUpdateBoardSpaces = (newSpaces: any[]) => {
    updateBoardSpaces(newSpaces);
  };

  const handleSaveGameTitle = (title: string) => {
    updateSettings({ gameTitle: title });
  };

  const checkWinConditions = () => {
    const gameStatus = gameEngine.getGameStatus(players);
    
    if (gameStatus.gameEnded && gameStatus.winner) {
      setWinner(gameStatus.winner);
      setShowWinnerDialog(true);
      endGame(gameStatus.winner);
    }
  };

  const handleNewGame = () => {
    setWinner(null);
    setShowWinnerDialog(false);
    resetGame();
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
    updatePlayers(updatedPlayers);
    
    // Update board spaces if changed
    updateBoardSpaces(result.updatedBoardSpaces);
    
    // Check for win conditions
    if (result.shouldEndGame && result.winner) {
      setWinner(result.winner);
      setShowWinnerDialog(true);
      endGame(result.winner);
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
    updatePlayers(updatedPlayers);
    
    // Check for win conditions
    if (result.shouldEndGame && result.winner) {
      setWinner(result.winner);
      setShowWinnerDialog(true);
      endGame(result.winner);
    }
  };

  if (currentView === 'settings') {
    return (
      <GameSettings
        onBack={() => setCurrentView('game')}
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
        onOpenSettings={() => setCurrentView('settings')}
        onUpdatePlayers={(newPlayers) => updatePlayers(newPlayers)}
        onNextPlayer={handleNextPlayer}
        onUpdateBoardSpaces={handleUpdateBoardSpaces}
        onUpdateBuyRequests={(newRequests) => updateBuyRequests(newRequests)}
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
