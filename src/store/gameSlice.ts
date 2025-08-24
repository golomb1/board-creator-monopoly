import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  money: number;
  lockedMoney: number;
  properties: string[];
  skipNextTurn?: boolean;
}

export interface BuyRequest {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  propertyId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: number;
}

export interface PropertyCard {
  id: string;
  name: string;
  color: string;
  price: number;
  rent: number;
  description: string;
}

export interface QuestionCard {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  reward: number;
  penalty: number;
  image?: string; // Optional image URL or path
}

export interface ActionCard {
  id: string;
  title: string;
  description: string;
  effect: 'go-to-jail' | 'skip-turn' | 'extra-turn' | 'collect-money' | 'pay-money' | 'advance-spaces';
  value?: number;
  image?: string; // Optional image URL or path
}

export interface BoardSpace {
  id: string;
  name: string;
  type: 'property' | 'action' | 'question' | 'corner' | 'jail';
  color?: string;
  price?: number;
  rent?: number;
  svgXml?: string;
  ownerId?: string;
}

export interface GameSettings {
  gameTitle: string;
  numberOfPlayers: number;
  properties: PropertyCard[];
  boardSpaces: BoardSpace[];
  questionCards: QuestionCard[];
  actionCards: ActionCard[];
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  buyRequests: BuyRequest[];
  currentView: 'game' | 'settings';
  settings: GameSettings;
  gameInProgress: boolean;
}

const initialSettings: GameSettings = {
  gameTitle: 'Custom Monopoly',
  numberOfPlayers: 4,
  properties: [
    // Azure Services - Storage
    { id: '1', name: 'Azure Blob Storage', color: 'azure', price: 60, rent: 8, description: 'Object storage for cloud applications' },
    { id: '6', name: 'Azure File Storage', color: 'azure', price: 80, rent: 10, description: 'Fully managed file shares in the cloud' },
    
    // Azure Services - Compute
    { id: '3', name: 'Azure Virtual Machines', color: 'azure', price: 100, rent: 12, description: 'Scalable computing in the cloud' },
    { id: '31', name: 'Azure App Service', color: 'azure', price: 300, rent: 40, description: 'Platform for building web apps' },
    { id: '37', name: 'Azure Functions', color: 'azure', price: 350, rent: 50, description: 'Serverless compute service' },
    
    // Azure Services - Database
    { id: '8', name: 'Azure SQL Database', color: 'azure', price: 140, rent: 18, description: 'Managed relational database service' },
    { id: '9', name: 'Azure Cosmos DB', color: 'azure', price: 200, rent: 26, description: 'Globally distributed NoSQL database' },
    
    // Azure Services - Networking
    { id: '11', name: 'Azure Virtual Network', color: 'azure', price: 180, rent: 24, description: 'Private network in Azure' },
    { id: '33', name: 'Azure Load Balancer', color: 'azure', price: 220, rent: 30, description: 'Distribute network traffic' },
    
    // Azure Services - Security
    { id: '15', name: 'Azure Key Vault', color: 'azure', price: 160, rent: 20, description: 'Secure key and secret management' },
    
    // AWS Services - Storage
    { id: '13', name: 'Amazon S3', color: 'aws', price: 60, rent: 8, description: 'Scalable object storage' },
    { id: '19', name: 'Amazon EBS', color: 'aws', price: 80, rent: 10, description: 'Block storage for EC2 instances' },
    
    // AWS Services - Compute
    { id: '14', name: 'Amazon EC2', color: 'aws', price: 100, rent: 12, description: 'Elastic compute cloud instances' },
    { id: '32', name: 'AWS Lambda', color: 'aws', price: 300, rent: 40, description: 'Serverless compute service' },
    { id: '35', name: 'AWS Elastic Beanstalk', color: 'aws', price: 350, rent: 50, description: 'Easy application deployment' },
    
    // AWS Services - Database
    { id: '16', name: 'Amazon RDS', color: 'aws', price: 140, rent: 18, description: 'Managed relational database' },
    { id: '22', name: 'Amazon DynamoDB', color: 'aws', price: 200, rent: 26, description: 'NoSQL database service' },
    
    // AWS Services - Networking
    { id: '18', name: 'Amazon VPC', color: 'aws', price: 180, rent: 24, description: 'Virtual private cloud networking' },
    { id: '25', name: 'Amazon CloudFront', color: 'aws', price: 220, rent: 30, description: 'Content delivery network' },
    
    // AWS Services - Security
    { id: '21', name: 'AWS IAM', color: 'aws', price: 160, rent: 20, description: 'Identity and access management' },
    
    // GCP Services - Storage
    { id: '23', name: 'Cloud Storage', color: 'gcp', price: 60, rent: 8, description: 'Unified object storage' },
    { id: '27', name: 'Persistent Disk', color: 'gcp', price: 80, rent: 10, description: 'Block storage for VMs' },
    
    // GCP Services - Compute
    { id: '24', name: 'Compute Engine', color: 'gcp', price: 100, rent: 12, description: 'Virtual machines on Google Cloud' },
    { id: '34', name: 'Cloud Functions', color: 'gcp', price: 300, rent: 40, description: 'Event-driven serverless functions' },
    { id: '39', name: 'App Engine', color: 'gcp', price: 400, rent: 60, description: 'Platform for building apps' },
    
    // GCP Services - Database
    { id: '26', name: 'Cloud SQL', color: 'gcp', price: 140, rent: 18, description: 'Fully managed relational database' },
    { id: '28', name: 'Firestore', color: 'gcp', price: 200, rent: 26, description: 'NoSQL document database' },
    
    // GCP Services - Networking
    { id: '29', name: 'VPC Network', color: 'gcp', price: 180, rent: 24, description: 'Global virtual private cloud' },
    { id: '36', name: 'Cloud Load Balancing', color: 'gcp', price: 220, rent: 30, description: 'Global load balancing service' },
    
    // GCP Services - Security
    { id: '38', name: 'Cloud KMS', color: 'gcp', price: 160, rent: 20, description: 'Key management service' },
  ],
  boardSpaces: [
    { id: '0', name: 'START', type: 'corner' },
    { id: '1', name: 'Azure Blob Storage', type: 'property', color: 'azure', price: 60, rent: 8 },
    { id: '2', name: 'Question Card', type: 'question' },
    { id: '3', name: 'Azure Virtual Machines', type: 'property', color: 'azure', price: 100, rent: 12 },
    { id: '4', name: 'Action Card', type: 'action' },
    { id: '5', name: 'Azure File Storage', type: 'property', color: 'azure', price: 80, rent: 10 },
    { id: '6', name: 'Azure SQL Database', type: 'property', color: 'azure', price: 140, rent: 18 },
    { id: '7', name: 'Action Card', type: 'action' },
    { id: '8', name: 'Azure Virtual Network', type: 'property', color: 'azure', price: 180, rent: 24 },
    { id: '9', name: 'Azure Cosmos DB', type: 'property', color: 'azure', price: 200, rent: 26 },
    { id: '10', name: 'Security Audit', type: 'jail' },
    { id: '11', name: 'Azure Key Vault', type: 'property', color: 'azure', price: 160, rent: 20 },
    { id: '12', name: 'Question Card', type: 'question' },
    { id: '13', name: 'Amazon S3', type: 'property', color: 'aws', price: 60, rent: 8 },
    { id: '14', name: 'Amazon EC2', type: 'property', color: 'aws', price: 100, rent: 12 },
    { id: '15', name: 'Azure Load Balancer', type: 'property', color: 'azure', price: 220, rent: 30 },
    { id: '16', name: 'Amazon RDS', type: 'property', color: 'aws', price: 140, rent: 18 },
    { id: '17', name: 'Action Card', type: 'action' },
    { id: '18', name: 'Amazon VPC', type: 'property', color: 'aws', price: 180, rent: 24 },
    { id: '19', name: 'Amazon EBS', type: 'property', color: 'aws', price: 80, rent: 10 },
    { id: '20', name: 'Free Credits', type: 'corner' },
    { id: '21', name: 'AWS IAM', type: 'property', color: 'aws', price: 160, rent: 20 },
    { id: '22', name: 'Amazon DynamoDB', type: 'property', color: 'aws', price: 200, rent: 26 },
    { id: '23', name: 'Cloud Storage', type: 'property', color: 'gcp', price: 60, rent: 8 },
    { id: '24', name: 'Compute Engine', type: 'property', color: 'gcp', price: 100, rent: 12 },
    { id: '25', name: 'Amazon CloudFront', type: 'property', color: 'aws', price: 220, rent: 30 },
    { id: '26', name: 'Cloud SQL', type: 'property', color: 'gcp', price: 140, rent: 18 },
    { id: '27', name: 'Persistent Disk', type: 'property', color: 'gcp', price: 80, rent: 10 },
    { id: '28', name: 'Firestore', type: 'property', color: 'gcp', price: 200, rent: 26 },
    { id: '29', name: 'VPC Network', type: 'property', color: 'gcp', price: 180, rent: 24 },
    { id: '30', name: 'System Outage', type: 'corner' },
    { id: '31', name: 'Azure App Service', type: 'property', color: 'azure', price: 300, rent: 40 },
    { id: '32', name: 'AWS Lambda', type: 'property', color: 'aws', price: 300, rent: 40 },
    { id: '33', name: 'Question Card', type: 'question' },
    { id: '34', name: 'Cloud Functions', type: 'property', color: 'gcp', price: 300, rent: 40 },
    { id: '35', name: 'AWS Elastic Beanstalk', type: 'property', color: 'aws', price: 350, rent: 50 },
    { id: '36', name: 'Cloud Load Balancing', type: 'property', color: 'gcp', price: 220, rent: 30 },
    { id: '37', name: 'Azure Functions', type: 'property', color: 'azure', price: 350, rent: 50 },
    { id: '38', name: 'Cloud KMS', type: 'property', color: 'gcp', price: 160, rent: 20 },
    { id: '39', name: 'App Engine', type: 'property', color: 'gcp', price: 400, rent: 60 },
  ],
  questionCards: [
    { id: 'q1', question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: 1, reward: 100, penalty: 50 },
    { id: 'q2', question: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], correctAnswer: 2, reward: 150, penalty: 75 },
    { id: 'q3', question: 'How many days are in a week?', options: ['5', '6', '7', '8'], correctAnswer: 2, reward: 100, penalty: 50 },
    { id: 'q4', question: 'What color do you get when you mix red and yellow?', options: ['Purple', 'Orange', 'Green', 'Blue'], correctAnswer: 1, reward: 125, penalty: 60 },
    { id: 'q5', question: 'What is 10 × 3?', options: ['20', '25', '30', '35'], correctAnswer: 2, reward: 100, penalty: 50 },
  ],
  actionCards: [
    { id: 'a1', title: 'Go to Jail', description: 'Go directly to jail, do not pass GO', effect: 'go-to-jail' },
    { id: 'a2', title: 'Skip Turn', description: 'Skip your next turn', effect: 'skip-turn' },
    { id: 'a3', title: 'Extra Turn', description: 'Take another turn!', effect: 'extra-turn' },
    { id: 'a4', title: 'Bank Error', description: 'Bank error in your favor - collect money', effect: 'collect-money', value: 200 },
    { id: 'a5', title: 'Pay Tax', description: 'Pay income tax', effect: 'pay-money', value: 100 },
    { id: 'a6', title: 'Advance 3 Spaces', description: 'Move forward 3 spaces', effect: 'advance-spaces', value: 3 },
    { id: 'a7', title: 'Birthday Money', description: 'Collect birthday money', effect: 'collect-money', value: 150 },
    { id: 'a8', title: 'Parking Fine', description: 'Pay parking fine', effect: 'pay-money', value: 75 },
  ],
};

const generatePlayers = (count: number): Player[] => {
  const playerColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];
  const players: Player[] = [];
  
  for (let i = 0; i < count; i++) {
    players.push({
      id: (i + 1).toString(),
      name: `Player ${i + 1}`,
      color: playerColors[i] || '#95a5a6',
      position: 0,
      money: 1500,
      lockedMoney: 0,
      properties: [],
      skipNextTurn: false,
    });
  }
  
  return players;
};

const initialState: GameState = {
  players: generatePlayers(4),
  currentPlayer: 0,
  buyRequests: [],
  currentView: 'game',
  settings: initialSettings,
  gameInProgress: false,
};

// Load game state from localStorage
const loadGameStateFromStorage = (): Partial<GameState> => {
  try {
    const savedState = localStorage.getItem('monopoly-game-state');
    return savedState ? JSON.parse(savedState) : {};
  } catch (error) {
    console.error('Failed to load game state from storage:', error);
    return {};
  }
};

// Save game state to localStorage
const saveGameStateToStorage = (state: GameState) => {
  try {
    const stateToSave = {
      players: state.players,
      currentPlayer: state.currentPlayer,
      buyRequests: state.buyRequests,
      gameInProgress: state.gameInProgress,
    };
    localStorage.setItem('monopoly-game-state', JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save game state to storage:', error);
  }
};

const gameSlice = createSlice({
  name: 'game',
  initialState: { ...initialState, ...loadGameStateFromStorage() },
  reducers: {
    movePlayer: (state, action: PayloadAction<{ playerId: string; steps: number }>) => {
      const { playerId, steps } = action.payload;
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        player.position = (player.position + steps) % 40;
      }
      saveGameStateToStorage(state);
    },

    updatePlayerMoney: (state, action: PayloadAction<{ playerId: string; amount: number }>) => {
      const { playerId, amount } = action.payload;
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        player.money = Math.max(0, player.money + amount);
      }
      saveGameStateToStorage(state);
    },

    setPlayerSkipTurn: (state, action: PayloadAction<{ playerId: string; skip: boolean }>) => {
      const { playerId, skip } = action.payload;
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        player.skipNextTurn = skip;
      }
      saveGameStateToStorage(state);
    },

    addPropertyToPlayer: (state, action: PayloadAction<{ playerId: string; propertyId: string }>) => {
      const { playerId, propertyId } = action.payload;
      const player = state.players.find(p => p.id === playerId);
      if (player && !player.properties.includes(propertyId)) {
        player.properties.push(propertyId);
      }
      saveGameStateToStorage(state);
    },

    removePropertyFromPlayer: (state, action: PayloadAction<{ playerId: string; propertyId: string }>) => {
      const { playerId, propertyId } = action.payload;
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        player.properties = player.properties.filter(id => id !== propertyId);
      }
      saveGameStateToStorage(state);
    },

    nextPlayer: (state) => {
      const currentPlayerData = state.players[state.currentPlayer];
      
      if (currentPlayerData?.skipNextTurn) {
        currentPlayerData.skipNextTurn = false;
      }
      
      state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
      saveGameStateToStorage(state);
    },

    setCurrentView: (state, action: PayloadAction<'game' | 'settings'>) => {
      state.currentView = action.payload;
    },

    updateSettings: (state, action: PayloadAction<Partial<GameSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    updatePlayers: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload;
      saveGameStateToStorage(state);
    },

    updateBuyRequests: (state, action: PayloadAction<BuyRequest[]>) => {
      state.buyRequests = action.payload;
      saveGameStateToStorage(state);
    },

    updateBoardSpaces: (state, action: PayloadAction<BoardSpace[]>) => {
      state.settings.boardSpaces = action.payload;
    },

    resetGame: (state) => {
      state.players = generatePlayers(state.settings.numberOfPlayers);
      state.currentPlayer = 0;
      state.buyRequests = [];
      state.gameInProgress = false;
      localStorage.removeItem('monopoly-game-state');
    },

    startGame: (state) => {
      state.gameInProgress = true;
      saveGameStateToStorage(state);
    },
  },
});

export const {
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
} = gameSlice.actions;

export default gameSlice.reducer;