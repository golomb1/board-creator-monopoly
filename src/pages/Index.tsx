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

interface QuestionCard {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  reward: number; // Money reward for correct answer
  penalty: number; // Money penalty for wrong answer
}

interface ActionCard {
  id: string;
  title: string;
  description: string;
  effect: 'go-to-jail' | 'skip-turn' | 'extra-turn' | 'collect-money' | 'pay-money' | 'advance-spaces';
  value?: number; // For money effects or space advancement
}

interface BoardSpace {
  id: string;
  name: string;
  type: 'property' | 'action' | 'question' | 'corner' | 'jail';
  color?: string;
  price?: number;
  rent?: number;
  svgXml?: string; // Optional inline SVG XML to display on the board
  ownerId?: string; // ID of player who owns this property
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'game' | 'settings'>('game');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([]);
  const [gameTitle, setGameTitle] = useState<string>('Custom Monopoly');
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(4);

  // Question cards deck
  const [questionCards] = useState<QuestionCard[]>([
    { id: 'q1', question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: 1, reward: 100, penalty: 50 },
    { id: 'q2', question: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], correctAnswer: 2, reward: 150, penalty: 75 },
    { id: 'q3', question: 'How many days are in a week?', options: ['5', '6', '7', '8'], correctAnswer: 2, reward: 100, penalty: 50 },
    { id: 'q4', question: 'What color do you get when you mix red and yellow?', options: ['Purple', 'Orange', 'Green', 'Blue'], correctAnswer: 1, reward: 125, penalty: 60 },
    { id: 'q5', question: 'What is 10 × 3?', options: ['20', '25', '30', '35'], correctAnswer: 2, reward: 100, penalty: 50 },
  ]);

  // Action cards deck
  const [actionCards] = useState<ActionCard[]>([
    { id: 'a1', title: 'Go to Jail', description: 'Go directly to jail, do not pass GO', effect: 'go-to-jail' },
    { id: 'a2', title: 'Skip Turn', description: 'Skip your next turn', effect: 'skip-turn' },
    { id: 'a3', title: 'Extra Turn', description: 'Take another turn!', effect: 'extra-turn' },
    { id: 'a4', title: 'Bank Error', description: 'Bank error in your favor - collect money', effect: 'collect-money', value: 200 },
    { id: 'a5', title: 'Pay Tax', description: 'Pay income tax', effect: 'pay-money', value: 100 },
    { id: 'a6', title: 'Advance 3 Spaces', description: 'Move forward 3 spaces', effect: 'advance-spaces', value: 3 },
    { id: 'a7', title: 'Birthday Money', description: 'Collect birthday money', effect: 'collect-money', value: 150 },
    { id: 'a8', title: 'Parking Fine', description: 'Pay parking fine', effect: 'pay-money', value: 75 },
  ]);

  useEffect(() => {
    document.title = `${gameTitle} - Board Game`;
  }, [gameTitle]);
  
  
  // Generate players based on numberOfPlayers
  const generatePlayers = (count: number): Player[] => {
    const playerColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];
    const players: Player[] = [];
    
    for (let i = 0; i < count; i++) {
      players.push({
        id: (i + 1).toString(),
        name: `Player ${i + 1}`,
        color: playerColors[i] || '#95a5a6', // fallback color if more than 8 players
        position: 0,
        money: 1500,
        lockedMoney: 0,
        properties: []
      });
    }
    
    return players;
  };

  // Default players
  const [players, setPlayers] = useState<Player[]>(generatePlayers(numberOfPlayers));

  // Default properties - Cloud Services by CSP
  const [properties, setProperties] = useState<PropertyCard[]>([
    // Azure Services
    { id: '1', name: 'Azure Blob Storage', color: 'azure', price: 60, rent: 8, description: 'Object storage for cloud applications' },
    { id: '3', name: 'Azure Virtual Machines', color: 'azure', price: 100, rent: 12, description: 'Scalable computing in the cloud' },
    { id: '6', name: 'Azure SQL Database', color: 'azure', price: 140, rent: 18, description: 'Managed relational database service' },
    { id: '8', name: 'Azure Virtual Network', color: 'azure', price: 180, rent: 24, description: 'Private network in Azure' },
    { id: '11', name: 'Azure Key Vault', color: 'azure', price: 220, rent: 30, description: 'Secure key and secret management' },
    
    // AWS Services
    { id: '13', name: 'Amazon S3', color: 'aws', price: 60, rent: 8, description: 'Scalable object storage' },
    { id: '14', name: 'Amazon EC2', color: 'aws', price: 100, rent: 12, description: 'Elastic compute cloud instances' },
    { id: '16', name: 'Amazon RDS', color: 'aws', price: 140, rent: 18, description: 'Managed relational database' },
    { id: '18', name: 'Amazon VPC', color: 'aws', price: 180, rent: 24, description: 'Virtual private cloud networking' },
    { id: '21', name: 'AWS IAM', color: 'aws', price: 220, rent: 30, description: 'Identity and access management' },
    
    // GCP Services
    { id: '23', name: 'Cloud Storage', color: 'gcp', price: 60, rent: 8, description: 'Unified object storage' },
    { id: '24', name: 'Compute Engine', color: 'gcp', price: 100, rent: 12, description: 'Virtual machines on Google Cloud' },
    { id: '26', name: 'Cloud SQL', color: 'gcp', price: 140, rent: 18, description: 'Fully managed relational database' },
    { id: '27', name: 'VPC Network', color: 'gcp', price: 180, rent: 24, description: 'Global virtual private cloud' },
    { id: '29', name: 'Cloud Security', color: 'gcp', price: 220, rent: 30, description: 'Security and compliance tools' },
  ]);

  // Default board spaces - Cloud Services focused
  const [boardSpaces, setBoardSpaces] = useState<BoardSpace[]>([
    { id: '0', name: 'START', type: 'corner' },
    { id: '1', name: 'Azure Blob Storage', type: 'property', color: 'azure', price: 60, rent: 8 },
    { id: '2', name: 'Question Card', type: 'question' },
    { id: '3', name: 'Azure Virtual Machines', type: 'property', color: 'azure', price: 100, rent: 12 },
    { id: '4', name: 'Action Card', type: 'action' },
    { id: '5', name: 'Cloud Railroad', type: 'property', price: 200, rent: 25 },
    { id: '6', name: 'Azure SQL Database', type: 'property', color: 'azure', price: 140, rent: 18 },
    { id: '7', name: 'Action Card', type: 'action' },
    { id: '8', name: 'Azure Virtual Network', type: 'property', color: 'azure', price: 180, rent: 24 },
    { id: '9', name: 'Azure Cache', type: 'property', color: 'azure', price: 200, rent: 26 },
    { id: '10', name: 'Security Audit', type: 'jail' },
    { id: '11', name: 'Azure Key Vault', type: 'property', color: 'azure', price: 220, rent: 30 },
    { id: '12', name: 'Question Card', type: 'question' },
    { id: '13', name: 'Amazon S3', type: 'property', color: 'aws', price: 60, rent: 8 },
    { id: '14', name: 'Amazon EC2', type: 'property', color: 'aws', price: 100, rent: 12 },
    { id: '15', name: 'Edge Network', type: 'property', price: 200, rent: 25 },
    { id: '16', name: 'Amazon RDS', type: 'property', color: 'aws', price: 140, rent: 18 },
    { id: '17', name: 'Action Card', type: 'action' },
    { id: '18', name: 'Amazon VPC', type: 'property', color: 'aws', price: 180, rent: 24 },
    { id: '19', name: 'AWS Lambda', type: 'property', color: 'aws', price: 200, rent: 26 },
    { id: '20', name: 'Free Credits', type: 'corner' },
    { id: '21', name: 'AWS IAM', type: 'property', color: 'aws', price: 220, rent: 30 },
    { id: '22', name: 'Question Card', type: 'question' },
    { id: '23', name: 'Cloud Storage', type: 'property', color: 'gcp', price: 60, rent: 8 },
    { id: '24', name: 'Compute Engine', type: 'property', color: 'gcp', price: 100, rent: 12 },
    { id: '25', name: 'Global CDN', type: 'property', price: 200, rent: 25 },
    { id: '26', name: 'Cloud SQL', type: 'property', color: 'gcp', price: 140, rent: 18 },
    { id: '27', name: 'VPC Network', type: 'property', color: 'gcp', price: 180, rent: 24 },
    { id: '28', name: 'Action Card', type: 'action' },
    { id: '29', name: 'Cloud Security', type: 'property', color: 'gcp', price: 220, rent: 30 },
    { id: '30', name: 'System Outage', type: 'corner' },
    { id: '31', name: 'Azure Kubernetes Service', type: 'property', color: 'azure', price: 300, rent: 40 },
    { id: '32', name: 'Amazon EKS', type: 'property', color: 'aws', price: 300, rent: 40 },
    { id: '33', name: 'Question Card', type: 'question' },
    { id: '34', name: 'Google Kubernetes Engine', type: 'property', color: 'gcp', price: 320, rent: 45 },
    { id: '35', name: 'Cloud Backbone', type: 'property', price: 200, rent: 25 },
    { id: '36', name: 'Action Card', type: 'action' },
    { id: '37', name: 'Azure AI Services', type: 'property', color: 'azure', price: 350, rent: 50 },
    { id: '38', name: 'Question Card', type: 'question' },
    { id: '39', name: 'Google Cloud AI', type: 'property', color: 'gcp', price: 400, rent: 60 },
  ]);

  const getRandomCard = <T,>(cards: T[]): T => {
    return cards[Math.floor(Math.random() * cards.length)];
  };

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

  const handleSaveNumberOfPlayers = (count: number) => {
    setNumberOfPlayers(count);
    setPlayers(generatePlayers(count));
    setCurrentPlayer(0); // Reset to first player
    setBuyRequests([]); // Clear any existing requests
    console.log('Number of players updated:', count);
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
        numberOfPlayers={numberOfPlayers}
        onSaveNumberOfPlayers={handleSaveNumberOfPlayers}
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
        questionCards={questionCards}
        actionCards={actionCards}
        getRandomCard={getRandomCard}
      />
  );
};

export default Index;
