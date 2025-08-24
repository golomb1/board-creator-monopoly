import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, ArrowRightLeft, Eye, MessageSquare, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import DiceRoller from "./DiceRoller";

// Import AWS Icons
import S3Icon from "@/assets/aws/s3.svg";
import EC2Icon from "@/assets/aws/ec2.svg";
import RDSIcon from "@/assets/aws/rds.svg";
import VPCIcon from "@/assets/aws/vpc.svg";
import IAMIcon from "@/assets/aws/iam.svg";
import LambdaIcon from "@/assets/aws/lambda.svg";
import EKSIcon from "@/assets/aws/eks.svg";

// Import GCP Icons
import GCPStorageIcon from "@/assets/gcp/cloud-storage.svg";
import ComputeEngineIcon from "@/assets/gcp/compute-engine.svg";
import CloudSQLIcon from "@/assets/gcp/cloud-sql.svg";
import GCPVPCIcon from "@/assets/gcp/vpc-network.svg";
import GKEIcon from "@/assets/gcp/gke.svg";
import GCPSecurityIcon from "@/assets/gcp/cloud-security.svg";

// Import Azure Icons
import AzureStorageIcon from "@/assets/azure/storage-accounts.svg";
import AzureVMIcon from "@/assets/azure/virtual-machines.svg";
import AzureSQLIcon from "@/assets/azure/sql-database.svg";
import AzureVNetIcon from "@/assets/azure/virtual-networks.svg";
import AzureKeyVaultIcon from "@/assets/azure/key-vaults.svg";
import AzureAKSIcon from "@/assets/azure/kubernetes-services.svg";

interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  money: number;
  lockedMoney: number;
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

interface QuestionCard {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  reward: number;
  penalty: number;
}

interface ActionCard {
  id: string;
  title: string;
  description: string;
  effect: 'go-to-jail' | 'skip-turn' | 'extra-turn' | 'collect-money' | 'pay-money' | 'advance-spaces';
  value?: number;
}

interface BoardSpace {
  id: string;
  name: string;
  type: 'property' | 'action' | 'question' | 'corner' | 'jail';
  color?: string;
  price?: number;
  rent?: number;
  ownerId?: string; // ID of player who owns this property
  svgXml?: string; // Optional inline SVG XML
}

interface GameBoardProps {
  players: Player[];
  boardSpaces: BoardSpace[];
  currentPlayer: number;
  buyRequests: BuyRequest[];
  onRollDice: (total: number, dice1: number, dice2: number) => void;
  onOpenSettings: () => void;
  onUpdatePlayers: (players: Player[]) => void;
  onNextPlayer: () => void;
  onUpdateBoardSpaces: (spaces: BoardSpace[]) => void;
  onUpdateBuyRequests: (requests: BuyRequest[]) => void;
  gameTitle: string;
  questionCards: QuestionCard[];
  actionCards: ActionCard[];
  getRandomCard: <T>(cards: T[]) => T;
  onActionCardExecuted: (actionCard: ActionCard, playerId: string) => void;
  onQuestionAnswered: (questionCard: QuestionCard, selectedAnswer: number, playerId: string) => void;
}

type TurnPhase = 'roll' | 'actions' | 'ended';

const GameBoard = ({ players, boardSpaces, currentPlayer, buyRequests, onRollDice, onOpenSettings, onUpdatePlayers, onNextPlayer, onUpdateBoardSpaces, onUpdateBuyRequests, gameTitle, questionCards, actionCards, getRandomCard, onActionCardExecuted, onQuestionAnswered }: GameBoardProps) => {
  const [lastRoll, setLastRoll] = useState<{total: number, dice1: number, dice2: number} | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [animatingPlayers, setAnimatingPlayers] = useState<string[]>([]);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('roll');
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [selectedTradePlayer, setSelectedTradePlayer] = useState<string>("");
  const [tradeAmount, setTradeAmount] = useState<number>(100);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [selectedSpaceDetails, setSelectedSpaceDetails] = useState<BoardSpace | null>(null);
  const [isSpaceDetailsOpen, setIsSpaceDetailsOpen] = useState(false);
  const [skipNextTurn, setSkipNextTurn] = useState<string[]>([]); // Players who skip next turn
  const [currentQuestionCard, setCurrentQuestionCard] = useState<QuestionCard | null>(null);
  const [currentActionCard, setCurrentActionCard] = useState<ActionCard | null>(null);
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const { toast } = useToast();

  // Board position mapping - clockwise from GO
  const getBoardPosition = (spaceIndex: number) => {
    const positions = [];
    
    // Bottom row (0-10): left to right
    for (let i = 0; i <= 10; i++) {
      positions.push({ row: 10, col: i });
    }
    
    // Right column (11-19): bottom to top
    for (let i = 1; i <= 9; i++) {
      positions.push({ row: 10 - i, col: 10 });
    }
    
    // Top row (20-29): right to left
    for (let i = 1; i <= 9; i++) {
      positions.push({ row: 0, col: 10 - i });
    }
    
    // Left column (30-39): top to bottom
    for (let i = 1; i <= 9; i++) {
      positions.push({ row: i, col: 0 });
    }
    
    return positions[spaceIndex] || { row: 10, col: 0 };
  };

  const handleDiceRoll = (total: number, dice1: number, dice2: number) => {
    if (turnPhase !== 'roll') return;
    
    // Check if current player should skip turn
    const currentPlayerId = players[currentPlayer].id;
    if (skipNextTurn.includes(currentPlayerId)) {
      setSkipNextTurn(prev => prev.filter(id => id !== currentPlayerId));
      toast({
        title: "Turn Skipped",
        description: `${players[currentPlayer].name} skips this turn due to an action card`,
      });
      handleEndTurn();
      return;
    }
    
    setLastRoll({ total, dice1, dice2 });
    setIsRolling(true);
    
    // Animate current player movement
    setAnimatingPlayers([currentPlayerId]);
    
    setTimeout(() => {
      setAnimatingPlayers([]);
      setIsRolling(false);
      setTurnPhase('actions');
      onRollDice(total, dice1, dice2);
      
      // Handle space effects after moving
      const newPosition = (players[currentPlayer].position + total) % 40;
      const landedSpace = boardSpaces[newPosition];
      if (landedSpace?.type === 'action') {
        const randomActionCard = getRandomCard(actionCards);
        setCurrentActionCard(randomActionCard);
        setIsActionOpen(true);
      } else if (landedSpace?.type === 'question') {
        const randomQuestionCard = getRandomCard(questionCards);
        setCurrentQuestionCard(randomQuestionCard);
        setIsQuestionOpen(true);
      }
    }, 1000);
  };

  const handleActionEffect = (effect: 'go-to-jail' | 'skip-turn' | 'extra-turn' | 'collect-money' | 'pay-money' | 'advance-spaces', playerId: string, value?: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    switch (effect) {
      case 'go-to-jail':
        // Move player to jail (position 10)
        const updatedPlayersJail = players.map(p => 
          p.id === playerId ? { ...p, position: 10 } : p
        );
        onUpdatePlayers(updatedPlayersJail);
        toast({
          title: "Go to Jail!",
          description: `${player.name} goes directly to jail!`,
          variant: "destructive"
        });
        break;
        
      case 'skip-turn':
        setSkipNextTurn(prev => [...prev, playerId]);
        toast({
          title: "Skip Next Turn",
          description: `${player.name} will skip their next turn`,
          variant: "destructive"
        });
        break;
        
      case 'extra-turn':
        toast({
          title: "Extra Turn!",
          description: `${player.name} gets another turn!`,
        });
        // Don't advance to next player - stay on current player
        setTurnPhase('roll');
        setLastRoll(null);
        return; // Exit early to prevent normal turn end
        
      case 'collect-money':
        const updatedPlayersCollect = players.map(p => 
          p.id === playerId ? { ...p, money: p.money + (value || 0) } : p
        );
        onUpdatePlayers(updatedPlayersCollect);
        toast({
          title: "Money Collected!",
          description: `${player.name} collected $${value || 0}`,
        });
        break;
        
      case 'pay-money':
        const updatedPlayersPay = players.map(p => 
          p.id === playerId ? { ...p, money: Math.max(0, p.money - (value || 0)) } : p
        );
        onUpdatePlayers(updatedPlayersPay);
        toast({
          title: "Money Paid",
          description: `${player.name} paid $${value || 0}`,
          variant: "destructive"
        });
        break;
        
      case 'advance-spaces':
        const updatedPlayersAdvance = players.map(p => 
          p.id === playerId ? { ...p, position: (p.position + (value || 0)) % 40 } : p
        );
        onUpdatePlayers(updatedPlayersAdvance);
        toast({
          title: "Advance Spaces",
          description: `${player.name} advances ${value || 0} spaces`,
        });
        break;
    }
  };

  const handleEndTurn = () => {
    setTurnPhase('roll');
    setLastRoll(null);
    onNextPlayer();
  };

  const currentPlayerData = players[currentPlayer];
  const currentSpace = boardSpaces[currentPlayerData?.position];
  const canTrade = turnPhase === 'actions'; // Can trade anytime during actions phase
  const otherPlayers = players.filter((_, index) => index !== currentPlayer);
  
  const canBuyProperty = currentSpace?.type === 'property' && 
                        !currentSpace?.ownerId && 
                        currentSpace?.price && 
                        currentPlayerData?.money >= currentSpace.price &&
                        turnPhase === 'actions';

  const propertyOwner = currentSpace?.ownerId ? 
    players.find(p => p.id === currentSpace.ownerId) : null;

  const handleBuyCurrentProperty = () => {
    if (!canBuyProperty || !currentSpace?.price) return;
    
    // Update player money and properties
    const updatedPlayers = players.map(player => {
      if (player.id === currentPlayerData.id) {
        return { 
          ...player, 
          money: player.money - currentSpace.price!,
          properties: [...player.properties, currentSpace.id]
        };
      }
      return player;
    });
    
    // Update board space ownership
    const updatedSpaces = boardSpaces.map(space => {
      if (space.id === currentSpace.id) {
        return { ...space, ownerId: currentPlayerData.id };
      }
      return space;
    });
    
    onUpdatePlayers(updatedPlayers);
    onUpdateBoardSpaces(updatedSpaces);
    toast({
      title: "Property Purchased!",
      description: `${currentPlayerData.name} bought ${currentSpace.name} for $${currentSpace.price}`,
    });
  };

  const handleSendBuyRequest = () => {
    if (!selectedTradePlayer || !selectedProperty) return;
    
    const property = boardSpaces.find(space => space.id === selectedProperty);
    if (!property?.price) return;
    if (currentPlayerData.money - currentPlayerData.lockedMoney < property.price) return;
    
    const newRequest: BuyRequest = {
      id: Date.now().toString(),
      fromPlayerId: currentPlayerData.id,
      toPlayerId: selectedTradePlayer,
      propertyId: selectedProperty,
      amount: property.price,
      status: 'pending',
      createdAt: Date.now()
    };
    
    // Lock the money for this request
    const updatedPlayers = players.map(player => {
      if (player.id === currentPlayerData.id) {
        return { ...player, lockedMoney: player.lockedMoney + property.price! };
      }
      return player;
    });
    
    onUpdatePlayers(updatedPlayers);
    onUpdateBuyRequests([...buyRequests, newRequest]);
    setIsTradeOpen(false);
    setSelectedTradePlayer("");
    setSelectedProperty("");
    
    toast({
      title: "Buy Request Sent",
      description: `Sent buy request for ${property.name} to ${players.find(p => p.id === selectedTradePlayer)?.name}`,
    });
  };

  const handleBuyRequestResponse = (requestId: string, accept: boolean) => {
    const request = buyRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const property = boardSpaces.find(space => space.id === request.propertyId);
    if (!property) return;
    
    if (accept) {
      // Complete the trade
      const updatedPlayers = players.map(player => {
        if (player.id === request.fromPlayerId) {
          return {
            ...player,
            lockedMoney: player.lockedMoney - request.amount,
            properties: [...player.properties, request.propertyId]
          };
        }
        if (player.id === request.toPlayerId) {
          return {
            ...player,
            money: player.money + request.amount,
            properties: player.properties.filter(p => p !== request.propertyId)
          };
        }
        return player;
      });
      
      const updatedSpaces = boardSpaces.map(space => {
        if (space.id === request.propertyId) {
          return { ...space, ownerId: request.fromPlayerId };
        }
        return space;
      });
      
      onUpdatePlayers(updatedPlayers);
      onUpdateBoardSpaces(updatedSpaces);
      
      toast({
        title: "Trade Completed!",
        description: `${property.name} sold for $${request.amount}`,
      });
    } else {
      // Reject: unlock the money
      const updatedPlayers = players.map(player => {
        if (player.id === request.fromPlayerId) {
          return { ...player, lockedMoney: player.lockedMoney - request.amount };
        }
        return player;
      });
      
      onUpdatePlayers(updatedPlayers);
      
      toast({
        title: "Request Declined",
        description: `Buy request for ${property.name} was declined`,
      });
    }
    
    // Update request status
    const status: BuyRequest['status'] = accept ? 'accepted' : 'declined';
    const updatedRequests = buyRequests.map(r => 
      r.id === requestId ? { ...r, status } : r
    );
    onUpdateBuyRequests(updatedRequests);
  };

  const handleCancelRequest = (requestId: string) => {
    const request = buyRequests.find(r => r.id === requestId);
    if (!request) return;
    
    // Unlock the money
    const updatedPlayers = players.map(player => {
      if (player.id === request.fromPlayerId) {
        return { ...player, lockedMoney: player.lockedMoney - request.amount };
      }
      return player;
    });
    
    onUpdatePlayers(updatedPlayers);
    
    // Update request status
    const status: BuyRequest['status'] = 'cancelled';
    const updatedRequests = buyRequests.map(r => 
      r.id === requestId ? { ...r, status } : r
    );
    onUpdateBuyRequests(updatedRequests);
    
    toast({
      title: "Request Cancelled",
      description: "Buy request cancelled and money unlocked",
    });
  };

  const getSpaceDescription = (space: BoardSpace) => {
    const descriptions: Record<string, string> = {
      '0': 'GO - Collect $200 when you pass or land here. This is the starting point of the game.',
      '10': 'JAIL - Just visiting, unless you were sent here! A temporary holding place.',
      '20': 'FREE PARKING - A safe space where nothing happens. Rest and relax.',
      '30': 'GO TO JAIL - Go directly to jail, do not pass GO, do not collect $200.',
    };
    
    // Default descriptions for property types
    if (space.type === 'property') {
      const ownerText = space.ownerId ? 
        `Currently owned by ${players.find(p => p.id === space.ownerId)?.name}.` : 
        'Available for purchase.';
      return `${space.name} - A ${space.color || 'generic'} property. ${ownerText} ${space.price ? `Purchase price: $${space.price}.` : ''} ${space.rent ? `Rent: $${space.rent}.` : ''}`;
    }
    
    if (space.type === 'action') {
      return `${space.name} - Draw a random action card when you land here.`;
    }
    
    if (space.type === 'question') {
      return `${space.name} - Answer a question for a chance to earn money.`;
    }
    
    if (space.type === 'jail') {
      return `${space.name || 'Jail'} - Just visiting unless sent here.`;
    }
    
    return descriptions[space.id] || `${space.name} - ${space.type} space.`;
  };

  const handleSpaceClick = (space: BoardSpace) => {
    setSelectedSpaceDetails(space);
    setIsSpaceDetailsOpen(true);
  };

  // Create a 11x11 grid for the board
  const createBoardLayout = () => {
    const board = Array(11).fill(null).map(() => Array(11).fill(null));
    
    // Place spaces around the perimeter
    // Bottom row (left to right) - positions 0-10
    for (let i = 0; i <= 10; i++) {
      const spaceIndex = i;
      board[10][i] = boardSpaces[spaceIndex] || { 
        id: spaceIndex.toString(), 
        name: `Space ${spaceIndex + 1}`, 
        type: i === 0 || i === 10 ? 'corner' : 'property' 
      };
    }
    
    // Right column (bottom to top) - positions 11-19
    for (let i = 1; i <= 9; i++) {
      const spaceIndex = 10 + i;
      board[10 - i][10] = boardSpaces[spaceIndex] || { 
        id: spaceIndex.toString(), 
        name: `Space ${spaceIndex + 1}`, 
        type: 'property' 
      };
    }
    
    // Top row (right to left) - positions 20-29
    // Place Free Parking corner (position 20)
    board[0][0] = boardSpaces[20] || { 
      id: '20', 
      name: 'Free Parking', 
      type: 'corner' 
    };
    
    // Place properties 21-29
    for (let i = 1; i <= 9; i++) {
      const spaceIndex = 20 + i;
      board[0][i] = boardSpaces[spaceIndex] || { 
        id: spaceIndex.toString(), 
        name: `Space ${spaceIndex + 1}`, 
        type: 'property' 
      };
    }
    
    // Place Go to Jail corner (position 30)
    board[0][10] = boardSpaces[30] || { 
      id: '30', 
      name: 'Go to Jail', 
      type: 'corner' 
    };
    
    // Left column (top to bottom) - positions 31-39
    for (let i = 1; i <= 9; i++) {
      const spaceIndex = 30 + i;
      board[i][0] = boardSpaces[spaceIndex] || { 
        id: spaceIndex.toString(), 
        name: `Space ${spaceIndex + 1}`, 
        type: 'property' 
      };
    }
    
    return board;
  };

  const board = createBoardLayout();

  const getPropertyColor = (space: BoardSpace) => {
    const colorMap: Record<string, string> = {
      azure: 'bg-property-azure',
      aws: 'bg-property-aws',
      gcp: 'bg-property-gcp',
    };
    return colorMap[space.color || ''] || 'bg-muted';
  };

  const getServiceIcon = (spaceName: string): string => {
    const iconMap: Record<string, string> = {
      // AWS services with actual icons
      'Amazon S3': S3Icon,
      'Amazon EC2': EC2Icon,
      'Amazon RDS': RDSIcon,
      'Amazon VPC': VPCIcon,
      'AWS IAM': IAMIcon,
      'AWS Lambda': LambdaIcon,
      'Amazon EKS': EKSIcon,
      
      // Azure services with actual icons
      'Azure Blob Storage': AzureStorageIcon,
      'Azure Virtual Machines': AzureVMIcon,
      'Azure SQL Database': AzureSQLIcon,
      'Azure Virtual Network': AzureVNetIcon,
      'Azure Key Vault': AzureKeyVaultIcon,
      'Azure Kubernetes Service': AzureAKSIcon,
      'Azure Cache': '💾', // Keep emoji for this one
      'Azure AI Services': '🤖', // Keep emoji for this one
      
      // GCP services with actual icons
      'Cloud Storage': GCPStorageIcon,
      'Compute Engine': ComputeEngineIcon,
      'Cloud SQL': CloudSQLIcon,
      'VPC Network': GCPVPCIcon,
      'Google Kubernetes Engine': GKEIcon,
      'Cloud Security': GCPSecurityIcon,
      'Google Cloud AI': '🧠', // Keep emoji for this one
      
      // Networking/Infrastructure services (emojis)
      'Cloud Railroad': '🚄',
      'Edge Network': '📡',
      'Global CDN': '🌎',
      'Cloud Backbone': '🔗',
    };
    return iconMap[spaceName] || '⚙️';
  };

  const isCloudService = (spaceName: string): boolean => {
    return spaceName.startsWith('Amazon ') || 
           spaceName.startsWith('AWS ') || 
           spaceName.startsWith('Azure ') || 
           spaceName.startsWith('Cloud ') ||
           spaceName.startsWith('Compute ') ||
           spaceName.startsWith('VPC ') ||
           spaceName.startsWith('Google ');
  };

  const renderBoardSpace = (space: BoardSpace | null, row: number, col: number) => {
    if (!space) return <div key={`${row}-${col}`} className="aspect-square" />;

    const isCorner = (row === 0 || row === 10) && (col === 0 || col === 10);
    const spaceId = parseInt(space.id);
    const playersOnSpace = players.filter(p => p.position === spaceId);
    
    // Find the owner of this property
    const propertyOwner = space.ownerId ? players.find(p => p.id === space.ownerId) : null;
    const ownerBorderStyle = propertyOwner ? { borderColor: propertyOwner.color, borderWidth: '3px' } : {};

    return (
      <TooltipProvider key={space.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              variant="property"
              className={`
                aspect-square flex flex-col justify-between p-1 text-xs relative
                w-16 h-16 cursor-pointer
                ${(space.type === 'corner' || space.type === 'jail') ? 'bg-gradient-secondary' : ''}
                ${propertyOwner ? 'border-4' : 'border-2'}
                hover:scale-105 transition-smooth
              `}
              style={propertyOwner ? ownerBorderStyle : {}}
              onClick={() => handleSpaceClick(space)}
            >
              {!space.svgXml && space.type === 'property' && space.color && (
                <div className={`h-2 ${getPropertyColor(space)} rounded-sm`} />
              )}
              
              {space.type === 'action' && !space.svgXml && (
                <div className="h-2 bg-muted rounded-sm" />
              )}
              
              <div className="flex-1 flex flex-col justify-center items-center text-center overflow-hidden">
                {space.svgXml ? (
                  <>
                    <div className="max-h-10 w-full flex items-center justify-center overflow-hidden">
                      <div className="h-10" dangerouslySetInnerHTML={{ __html: space.svgXml }} />
                    </div>
                    {space.price && (
                      <div className="text-primary font-bold text-xs mt-1">${space.price}</div>
                    )}
                  </>
                ) : (
                  <>
                    {space.type === 'property' ? (
                      isCloudService(space.name) ? (
                        <img src={getServiceIcon(space.name)} alt={space.name} className="w-6 h-6" />
                      ) : (
                        <div className="text-lg">{getServiceIcon(space.name)}</div>
                      )
                    ) : (
                      <div className="font-medium text-xs truncate px-1 whitespace-normal text-center">{space.name}</div>
                    )}
                    {space.price && space.type === 'property' && (
                      <div className="text-primary font-bold text-xs truncate whitespace-normal">${space.price}</div>
                    )}
                     {space.type === 'action' && (
                       <div className="text-foreground font-bold text-xs truncate whitespace-normal">🎲</div>
                     )}
                     {space.type === 'question' && (
                       <div className="text-foreground font-bold text-xs truncate whitespace-normal">❓</div>
                     )}
                    {propertyOwner && (
                      <div className="text-xs font-medium mt-1 truncate px-1 whitespace-normal" style={{ color: propertyOwner.color }}>
                        {propertyOwner.name}
                      </div>
                    )}
                  </>
                )}
              </div>

              {playersOnSpace.length > 0 && (
                <div className="absolute bottom-1 left-1 right-1 flex gap-1 flex-wrap justify-center">
                  {playersOnSpace.map(player => (
                    <div
                      key={player.id}
                      className={`
                        w-6 h-6 rounded-full border-3 border-white shadow-lg relative
                        ${animatingPlayers.includes(player.id) ? 'animate-player-move scale-110' : ''}
                        transition-all duration-500 ease-in-out transform
                        hover:scale-125 hover:shadow-xl cursor-pointer
                        before:content-[''] before:absolute before:-inset-1 
                        before:rounded-full before:bg-white/30 before:scale-0
                        ${animatingPlayers.includes(player.id) ? 'before:scale-100 before:animate-ping' : ''}
                        before:transition-transform before:duration-300
                      `}
                      style={{ backgroundColor: player.color }}
                      title={player.name}
                    />
                  ))}
                </div>
              )}
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{space.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-board p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {gameTitle}
          </h1>
          <Button variant="game" onClick={onOpenSettings}>
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <Card variant="board" className="p-6 relative">
              <div className="grid grid-cols-11 gap-1 max-w-3xl mx-auto items-center justify-items-center">
                {board.map((row, rowIndex) =>
                  row.map((space, colIndex) =>
                    renderBoardSpace(space, rowIndex, colIndex)
                  )
                )}
              </div>

              {/* Center area with player info and dice roller - positioned relative to board */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex gap-3 pointer-events-auto justify-center items-stretch">
                  {/* Current Player Position Info */}
                  <Card className="p-3 bg-gradient-property border-2 border-primary/20 w-48">
                    <div className="text-center space-y-2">
                      <h3 className="text-sm font-bold text-primary">Current Position</h3>
                      <div className="space-y-1">
                        <div className="text-xs font-medium">
                          {currentPlayerData?.name}
                        </div>
                        <div className="text-sm font-bold leading-tight">
                          {currentSpace?.name || "Unknown"}
                        </div>
                        {currentSpace?.type === 'property' && (
                          <>
                            {currentSpace.price && (
                              <div className="text-xs text-primary font-medium">
                                ${currentSpace.price}
                              </div>
                            )}
                            {propertyOwner ? (
                              <div className="text-xs text-amber-600 font-medium">
                                Owner: {propertyOwner.name}
                              </div>
                            ) : (
                              <div className="text-xs text-green-600 font-medium">
                                Available
                              </div>
                            )}
                            {canBuyProperty && (
                              <Button 
                                variant="game" 
                                size="sm"
                                onClick={handleBuyCurrentProperty}
                                className="text-xs py-1 px-2 h-6"
                              >
                                Buy ${currentSpace.price}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Dice Roller */}
                  <Card className="p-3 bg-gradient-property border-2 border-primary/20 w-48">
                    <div className="text-center space-y-2">
                      <h2 className="text-sm font-bold">Monopoly</h2>
                      <div className="text-xs text-muted-foreground">
                        {players[currentPlayer]?.name}'s Turn
                      </div>
                      <div className="text-xs text-primary/70 font-medium">
                        {turnPhase === 'roll' ? 'Roll Dice' : 'Take Actions'}
                      </div>
                      {lastRoll && (
                        <div className="text-xs text-primary font-medium animate-fade-in">
                          {lastRoll.dice1} + {lastRoll.dice2} = {lastRoll.total}
                        </div>
                      )}
                      <div className="scale-75">
                        <DiceRoller 
                          onRoll={handleDiceRoll}
                          disabled={isRolling || turnPhase !== 'roll'}
                          isRolling={isRolling}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>

          {/* Player Panel */}
          <div className="space-y-4">
            <Card variant="property" className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Players</h3>
              </div>
              
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-300
                      ${index === currentPlayer 
                        ? 'border-primary bg-primary/10 shadow-glow animate-pulse' 
                        : 'border-border bg-card'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="font-medium">{player.name}</span>
                      {index === currentPlayer && (
                        <Badge variant="secondary" className="text-xs animate-bounce-in">Current</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Money: <span className="font-bold text-primary">${player.money - player.lockedMoney}</span>
                      {player.lockedMoney > 0 && (
                        <span className="text-orange-500 ml-1">(${player.lockedMoney} locked)</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Position: <span className="font-medium">{boardSpaces[player.position]?.name || `Space ${player.position}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Game Actions */}
            <Card variant="property" className="p-4">
              <h3 className="font-semibold mb-3">
                Turn Actions
                {turnPhase === 'roll' && (
                  <Badge variant="secondary" className="ml-2 text-xs">Roll dice first</Badge>
                )}
              </h3>
              <div className="space-y-2">
                <Dialog open={isPropertiesOpen} onOpenChange={setIsPropertiesOpen}>
                  <DialogTrigger asChild>
                     <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled={turnPhase !== 'actions'}
                    >
                      <Eye className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">View Properties</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{currentPlayerData?.name}'s Properties</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      {currentPlayerData?.properties.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No properties owned</p>
                      ) : (
                        currentPlayerData?.properties.map(propertyId => {
                          const property = boardSpaces.find(space => space.id === propertyId);
                          return property ? (
                            <Card key={propertyId} className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">{property.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Value: ${property.price} | Rent: ${property.rent || 50}
                                  </p>
                                </div>
                                {property.color && (
                                  <div className={`w-4 h-4 rounded ${getPropertyColor(property)}`} />
                                )}
                              </div>
                            </Card>
                          ) : null;
                        })
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isRequestsOpen} onOpenChange={setIsRequestsOpen}>
                  <DialogTrigger asChild>
                     <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled={turnPhase !== 'actions'}
                    >
                      <MessageSquare className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Manage Requests</span>
                      {(buyRequests || []).filter(r => 
                        (r.fromPlayerId === currentPlayerData.id || r.toPlayerId === currentPlayerData.id) && 
                        r.status === 'pending'
                      ).length > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {(buyRequests || []).filter(r => 
                            (r.fromPlayerId === currentPlayerData.id || r.toPlayerId === currentPlayerData.id) && 
                            r.status === 'pending'
                          ).length}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Buy Requests</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {/* Received Requests */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Requests Received:</h4>
                        {(buyRequests || []).filter(r => r.toPlayerId === currentPlayerData.id && r.status === 'pending').length === 0 ? (
                          <p className="text-sm text-muted-foreground">No pending requests</p>
                        ) : (
                          (buyRequests || []).filter(r => r.toPlayerId === currentPlayerData.id && r.status === 'pending').map(request => {
                            const property = boardSpaces.find(s => s.id === request.propertyId);
                            const fromPlayer = players.find(p => p.id === request.fromPlayerId);
                            return (
                              <Card key={request.id} className="p-3 mb-2">
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <strong>{fromPlayer?.name}</strong> wants to buy <strong>{property?.name}</strong> for <strong>${request.amount}</strong>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      onClick={() => handleBuyRequestResponse(request.id, true)}
                                      className="flex-1"
                                    >
                                      Accept
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleBuyRequestResponse(request.id, false)}
                                      className="flex-1"
                                    >
                                      Decline
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        )}
                      </div>
                      
                      {/* Sent Requests */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Requests Sent:</h4>
                        {(buyRequests || []).filter(r => r.fromPlayerId === currentPlayerData.id && r.status === 'pending').length === 0 ? (
                          <p className="text-sm text-muted-foreground">No pending requests</p>
                        ) : (
                          (buyRequests || []).filter(r => r.fromPlayerId === currentPlayerData.id && r.status === 'pending').map(request => {
                            const property = boardSpaces.find(s => s.id === request.propertyId);
                            const toPlayer = players.find(p => p.id === request.toPlayerId);
                            return (
                              <Card key={request.id} className="p-3 mb-2">
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    Buying <strong>{property?.name}</strong> from <strong>{toPlayer?.name}</strong> for <strong>${request.amount}</strong>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleCancelRequest(request.id)}
                                    className="w-full"
                                  >
                                    Cancel Request
                                  </Button>
                                </div>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isTradeOpen} onOpenChange={setIsTradeOpen}>
                  <DialogTrigger asChild>
                     <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled={!canTrade}
                    >
                      <Send className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Send Buy Request</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Buy Property from Player</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Buy from:</label>
                        <Select value={selectedTradePlayer} onValueChange={setSelectedTradePlayer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a player" />
                          </SelectTrigger>
                          <SelectContent>
                            {otherPlayers.filter(p => p.properties.length > 0).map(player => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name} ({player.properties.length} properties)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedTradePlayer && (
                        <div>
                          <label className="text-sm font-medium">Select property:</label>
                          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a property" />
                            </SelectTrigger>
                            <SelectContent>
                              {otherPlayers
                                .find(p => p.id === selectedTradePlayer)
                                ?.properties.map(propertyId => {
                                  const property = boardSpaces.find(space => space.id === propertyId);
                                  return property ? (
                                    <SelectItem key={propertyId} value={propertyId}>
                                      {property.name} - ${property.price}
                                    </SelectItem>
                                  ) : null;
                                })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {selectedProperty && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">
                            You will pay: <span className="font-bold">
                              ${boardSpaces.find(s => s.id === selectedProperty)?.price}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Available money: ${currentPlayerData?.money - currentPlayerData?.lockedMoney}
                          </p>
                        </div>
                      )}
                      
                      <Button 
                        onClick={handleSendBuyRequest} 
                        className="w-full" 
                        disabled={!selectedTradePlayer || !selectedProperty || 
                          (currentPlayerData?.money - currentPlayerData?.lockedMoney || 0) < (boardSpaces.find(s => s.id === selectedProperty)?.price || 0)}
                      >
                        Send Buy Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="game" 
                  size="sm" 
                  className="w-full"
                  disabled={turnPhase === 'roll'}
                  onClick={handleEndTurn}
                >
                  End Turn
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Space Details Dialog */}
      <Dialog open={isSpaceDetailsOpen} onOpenChange={setIsSpaceDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSpaceDetails?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">
              <p>{selectedSpaceDetails ? getSpaceDescription(selectedSpaceDetails) : ''}</p>
            </div>
            
            {selectedSpaceDetails?.type === 'property' && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedSpaceDetails.price && (
                  <div>
                    <span className="font-medium">Price:</span> ${selectedSpaceDetails.price}
                  </div>
                )}
                {selectedSpaceDetails.rent && (
                  <div>
                    <span className="font-medium">Rent:</span> ${selectedSpaceDetails.rent}
                  </div>
                )}
                {selectedSpaceDetails.color && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Color:</span>
                    <div className={`w-4 h-4 rounded ${getPropertyColor(selectedSpaceDetails)}`} />
                    <span className="capitalize">{selectedSpaceDetails.color}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Type:</span> {selectedSpaceDetails.type}
                </div>
              </div>
            )}
            
            {selectedSpaceDetails?.ownerId && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Owner Information</div>
                <div className="text-sm text-muted-foreground">
                  Owned by {players.find(p => p.id === selectedSpaceDetails.ownerId)?.name}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Card Dialog */}
      <Dialog open={isQuestionOpen} onOpenChange={setIsQuestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Question Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentQuestionCard && (
              <>
                <div className="text-lg font-medium">{currentQuestionCard.question}</div>
                <div className="space-y-2">
                  {currentQuestionCard.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left justify-start"
                      onClick={() => {
                        onQuestionAnswered(currentQuestionCard, index, players[currentPlayer].id);
                        setIsQuestionOpen(false);
                        setCurrentQuestionCard(null);
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Card Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Action Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentActionCard && (
              <>
                <div className="text-lg font-bold">{currentActionCard.title}</div>
                <div className="text-sm text-muted-foreground">{currentActionCard.description}</div>
                <Button
                  onClick={() => {
                    onActionCardExecuted(currentActionCard, players[currentPlayer].id);
                    setIsActionOpen(false);
                    setCurrentActionCard(null);
                    if (currentActionCard.effect !== 'extra-turn') {
                      handleEndTurn();
                    }
                  }}
                  className="w-full"
                >
                  Continue
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameBoard;