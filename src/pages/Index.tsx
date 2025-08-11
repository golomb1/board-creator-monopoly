import { useState, useEffect } from "react";
import GameBoard from "@/components/GameBoard";
import GameSettings from "@/components/GameSettings";

interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  money: number;
  lockedMoney: number; // Money locked in pending buy requests
  properties: string[]; // Array of property IDs owned by player
}

interface BuyRequest {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  propertyId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: number;
}

interface PropertyCard {
  id: string;
  name: string;
  color: string;
  price: number;
  rent: number;
  description: string;
}

interface BoardSpace {
  id: string;
  name: string;
  type: 'property' | 'action' | 'corner' | 'jail';
  color?: string;
  price?: number;
  rent?: number;
  svgXml?: string; // Optional inline SVG XML to display on the board
  ownerId?: string; // ID of player who owns this property
  actionEffect?: 'go-to-jail' | 'skip-turn' | 'extra-turn'; // For action spaces
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'game' | 'settings'>('game');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([]);
  const [gameTitle, setGameTitle] = useState<string>('Custom Monopoly');

  useEffect(() => {
    document.title = `${gameTitle} - Board Game`;
  }, [gameTitle]);
  
  // Default players
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Player 1', color: '#e74c3c', position: 0, money: 1500, lockedMoney: 0, properties: [] },
    { id: '2', name: 'Player 2', color: '#3498db', position: 0, money: 1500, lockedMoney: 0, properties: [] },
    { id: '3', name: 'Player 3', color: '#2ecc71', position: 0, money: 1500, lockedMoney: 0, properties: [] },
    { id: '4', name: 'Player 4', color: '#f39c12', position: 0, money: 1500, lockedMoney: 0, properties: [] },
  ]);

  // Default properties
  const [properties, setProperties] = useState<PropertyCard[]>([
    { id: '1', name: 'Mediterranean Ave', color: 'brown', price: 60, rent: 2, description: 'A humble beginning property' },
    { id: '2', name: 'Baltic Ave', color: 'brown', price: 60, rent: 4, description: 'Another starter property' },
    { id: '3', name: 'Oriental Ave', color: 'light-blue', price: 100, rent: 6, description: 'Light blue property group' },
    { id: '4', name: 'Vermont Ave', color: 'light-blue', price: 100, rent: 6, description: 'Light blue property group' },
    { id: '5', name: 'Connecticut Ave', color: 'light-blue', price: 120, rent: 8, description: 'Light blue property group' },
    { id: '6', name: 'Park Place', color: 'blue', price: 350, rent: 35, description: 'Premium blue property' },
    { id: '7', name: 'Boardwalk', color: 'blue', price: 400, rent: 50, description: 'The most expensive property' },
  ]);

  // Default board spaces
  const [boardSpaces, setBoardSpaces] = useState<BoardSpace[]>([
    { id: '0', name: 'GO', type: 'corner' },
    { id: '1', name: 'Mediterranean Ave', type: 'property', color: 'brown', price: 60, rent: 2 },
    { id: '2', name: 'Skip Turn Action', type: 'action', actionEffect: 'skip-turn' },
    { id: '3', name: 'Baltic Ave', type: 'property', color: 'brown', price: 60, rent: 4 },
    { id: '4', name: 'Go to Jail Action', type: 'action', actionEffect: 'go-to-jail' },
    { id: '5', name: 'Reading Railroad', type: 'property', price: 200, rent: 25 },
    { id: '6', name: 'Oriental Ave', type: 'property', color: 'light-blue', price: 100, rent: 6 },
    { id: '7', name: 'Extra Turn Action', type: 'action', actionEffect: 'extra-turn' },
    { id: '8', name: 'Vermont Ave', type: 'property', color: 'light-blue', price: 100, rent: 6 },
    { id: '9', name: 'Connecticut Ave', type: 'property', color: 'light-blue', price: 120, rent: 8 },
    { id: '10', name: 'Jail', type: 'corner' },
    { id: '11', name: 'St. Charles Place', type: 'property', color: 'pink', price: 140, rent: 10 },
    { id: '12', name: 'Skip Turn Action', type: 'action', actionEffect: 'skip-turn' },
    { id: '13', name: 'States Ave', type: 'property', color: 'pink', price: 140, rent: 10 },
    { id: '14', name: 'Virginia Ave', type: 'property', color: 'pink', price: 160, rent: 12 },
    { id: '15', name: 'Pennsylvania Railroad', type: 'property', price: 200, rent: 25 },
    { id: '16', name: 'St. James Place', type: 'property', color: 'orange', price: 180, rent: 14 },
    { id: '17', name: 'Go to Jail Action', type: 'action', actionEffect: 'go-to-jail' },
    { id: '18', name: 'Tennessee Ave', type: 'property', color: 'orange', price: 180, rent: 14 },
    { id: '19', name: 'New York Ave', type: 'property', color: 'orange', price: 200, rent: 16 },
    { id: '20', name: 'Free Parking', type: 'corner' },
    { id: '21', name: 'Kentucky Ave', type: 'property', color: 'red', price: 220, rent: 18 },
    { id: '22', name: 'Extra Turn Action', type: 'action', actionEffect: 'extra-turn' },
    { id: '23', name: 'Indiana Ave', type: 'property', color: 'red', price: 220, rent: 18 },
    { id: '24', name: 'Illinois Ave', type: 'property', color: 'red', price: 240, rent: 20 },
    { id: '25', name: 'B&O Railroad', type: 'property', price: 200, rent: 25 },
    { id: '26', name: 'Atlantic Ave', type: 'property', color: 'yellow', price: 260, rent: 22 },
    { id: '27', name: 'Ventnor Ave', type: 'property', color: 'yellow', price: 260, rent: 22 },
    { id: '28', name: 'Skip Turn Action', type: 'action', actionEffect: 'skip-turn' },
    { id: '29', name: 'Marvin Gardens', type: 'property', color: 'yellow', price: 280, rent: 24 },
    { id: '30', name: 'Go to Jail', type: 'corner' },
    { id: '31', name: 'Pacific Ave', type: 'property', color: 'green', price: 300, rent: 26 },
    { id: '32', name: 'North Carolina Ave', type: 'property', color: 'green', price: 300, rent: 26 },
    { id: '33', name: 'Go to Jail Action', type: 'action', actionEffect: 'go-to-jail' },
    { id: '34', name: 'Pennsylvania Ave', type: 'property', color: 'green', price: 320, rent: 28 },
    { id: '35', name: 'Short Line', type: 'property', price: 200, rent: 25 },
    { id: '36', name: 'Extra Turn Action', type: 'action', actionEffect: 'extra-turn' },
    { id: '37', name: 'Park Place', type: 'property', color: 'blue', price: 350, rent: 35 },
    { id: '38', name: 'Go to Jail Action', type: 'action', actionEffect: 'go-to-jail' },
    { id: '39', name: 'Boardwalk', type: 'property', color: 'blue', price: 400, rent: 50 },
  ]);

  const handleRollDice = (total: number, dice1: number, dice2: number) => {
    console.log(`${players[currentPlayer].name} rolled ${dice1} + ${dice2} = ${total}`);
    
    // Move current player
    const updatedPlayers = players.map(player => {
      if (player.id === players[currentPlayer].id) {
        const newPosition = (player.position + total) % 40;
        return { ...player, position: newPosition };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
  };

  const handleSaveProperties = (newProperties: PropertyCard[]) => {
    setProperties(newProperties);
    console.log('Properties saved:', newProperties.length);
  };

  const handleSaveBoardSpaces = (newSpaces: BoardSpace[]) => {
    setBoardSpaces(newSpaces);
    console.log('Board spaces saved:', newSpaces.length);
  };

  const nextPlayer = () => {
    setCurrentPlayer((prev) => (prev + 1) % players.length);
  };

  const handleUpdateBoardSpaces = (newSpaces: BoardSpace[]) => {
    setBoardSpaces(newSpaces);
  };

  if (currentView === 'settings') {
    return (
      <GameSettings
        onBack={() => setCurrentView('game')}
        properties={properties}
        boardSpaces={boardSpaces}
        onSaveProperties={handleSaveProperties}
        onSaveBoardSpaces={handleSaveBoardSpaces}
        gameTitle={gameTitle}
        onSaveGameTitle={setGameTitle}
      />
    );
  }

  return (
    <GameBoard
      players={players}
      boardSpaces={boardSpaces}
      currentPlayer={currentPlayer}
      buyRequests={buyRequests}
      onRollDice={handleRollDice}
      onOpenSettings={() => setCurrentView('settings')}
      onUpdatePlayers={setPlayers}
      onNextPlayer={nextPlayer}
      onUpdateBoardSpaces={handleUpdateBoardSpaces}
      onUpdateBuyRequests={setBuyRequests}
      gameTitle={gameTitle}
    />
  );
};

export default Index;
