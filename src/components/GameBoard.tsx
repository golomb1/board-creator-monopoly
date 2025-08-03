import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DiceRoller from "./DiceRoller";

interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  money: number;
  properties: string[]; // Array of property IDs owned by player
}

interface BoardSpace {
  id: string;
  name: string;
  type: 'property' | 'special' | 'corner';
  color?: string;
  price?: number;
  rent?: number;
  ownerId?: string; // ID of player who owns this property
}

interface GameBoardProps {
  players: Player[];
  boardSpaces: BoardSpace[];
  currentPlayer: number;
  onRollDice: (total: number, dice1: number, dice2: number) => void;
  onOpenSettings: () => void;
  onUpdatePlayers: (players: Player[]) => void;
  onNextPlayer: () => void;
  onUpdateBoardSpaces: (spaces: BoardSpace[]) => void;
}

type TurnPhase = 'roll' | 'actions' | 'ended';

const GameBoard = ({ players, boardSpaces, currentPlayer, onRollDice, onOpenSettings, onUpdatePlayers, onNextPlayer, onUpdateBoardSpaces }: GameBoardProps) => {
  const [lastRoll, setLastRoll] = useState<{total: number, dice1: number, dice2: number} | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [animatingPlayers, setAnimatingPlayers] = useState<string[]>([]);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('roll');
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [selectedTradePlayer, setSelectedTradePlayer] = useState<string>("");
  const [tradeAmount, setTradeAmount] = useState<number>(100);

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
    
    setLastRoll({ total, dice1, dice2 });
    setIsRolling(true);
    
    // Animate current player movement
    const currentPlayerId = players[currentPlayer].id;
    setAnimatingPlayers([currentPlayerId]);
    
    setTimeout(() => {
      setAnimatingPlayers([]);
      setIsRolling(false);
      setTurnPhase('actions');
      onRollDice(total, dice1, dice2);
    }, 1000);
  };

  const handleEndTurn = () => {
    setTurnPhase('roll');
    setLastRoll(null);
    onNextPlayer();
  };

  const currentPlayerData = players[currentPlayer];
  const currentSpace = boardSpaces[currentPlayerData?.position];
  const canTrade = turnPhase === 'actions' && currentSpace?.type === 'property';
  const otherPlayers = players.filter((_, index) => index !== currentPlayer);
  
  const canBuyProperty = currentSpace?.type === 'property' && 
                        !currentSpace?.ownerId && 
                        currentSpace?.price && 
                        currentPlayerData?.money >= currentSpace.price &&
                        turnPhase === 'actions';

  const propertyOwner = currentSpace?.ownerId ? 
    players.find(p => p.id === currentSpace.ownerId) : null;

  const handleBuyProperty = () => {
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
  };

  const handleTrade = () => {
    if (!selectedTradePlayer || !tradeAmount) return;
    
    const updatedPlayers = players.map(player => {
      if (player.id === currentPlayerData.id) {
        return { ...player, money: player.money + tradeAmount };
      }
      if (player.id === selectedTradePlayer) {
        return { ...player, money: Math.max(0, player.money - tradeAmount) };
      }
      return player;
    });
    
    onUpdatePlayers(updatedPlayers);
    setIsTradeOpen(false);
    setSelectedTradePlayer("");
    setTradeAmount(100);
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
    for (let i = 1; i <= 9; i++) {
      const spaceIndex = 19 + i;
      board[0][10 - i] = boardSpaces[spaceIndex] || { 
        id: spaceIndex.toString(), 
        name: `Space ${spaceIndex + 1}`, 
        type: i === 9 ? 'corner' : 'property' 
      };
    }
    
    // Left column (top to bottom) - positions 30-39
    for (let i = 1; i <= 9; i++) {
      const spaceIndex = 29 + i;
      board[i][0] = boardSpaces[spaceIndex] || { 
        id: spaceIndex.toString(), 
        name: `Space ${spaceIndex + 1}`, 
        type: i === 9 ? 'corner' : 'property' 
      };
    }
    
    return board;
  };

  const board = createBoardLayout();

  const getPropertyColor = (space: BoardSpace) => {
    const colorMap: Record<string, string> = {
      brown: 'bg-property-brown',
      'light-blue': 'bg-property-light-blue',
      pink: 'bg-property-pink',
      orange: 'bg-property-orange',
      red: 'bg-property-red',
      yellow: 'bg-property-yellow',
      green: 'bg-property-green',
      blue: 'bg-property-blue',
    };
    return colorMap[space.color || ''] || 'bg-muted';
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
      <Card
        key={space.id}
        variant="property"
        className={`
          aspect-square flex flex-col justify-between p-1 text-xs relative
          ${isCorner ? 'w-20 h-20' : 'w-16 h-16'}
          ${space.type === 'corner' ? 'bg-gradient-secondary' : ''}
          ${propertyOwner ? 'border-4' : 'border-2'}
          hover:scale-105 transition-smooth
        `}
        style={propertyOwner ? ownerBorderStyle : {}}
      >
        {space.type === 'property' && space.color && (
          <div className={`h-2 ${getPropertyColor(space)} rounded-sm`} />
        )}
        
        <div className="flex-1 flex flex-col justify-center text-center">
          <div className="font-medium leading-tight">{space.name}</div>
          {space.price && (
            <div className="text-primary font-bold">${space.price}</div>
          )}
          {propertyOwner && (
            <div className="text-xs font-medium mt-1" style={{ color: propertyOwner.color }}>
              Owned by {propertyOwner.name}
            </div>
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-board p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Custom Monopoly
          </h1>
          <Button variant="game" onClick={onOpenSettings}>
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <Card variant="board" className="p-6">
              <div className="grid grid-cols-11 gap-1 max-w-3xl mx-auto">
                {board.map((row, rowIndex) =>
                  row.map((space, colIndex) =>
                    renderBoardSpace(space, rowIndex, colIndex)
                  )
                )}
              </div>

              {/* Center area with player info and dice roller */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex gap-3 pointer-events-auto">
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
                                onClick={handleBuyProperty}
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
                      Money: <span className="font-bold text-primary">${player.money}</span>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled={turnPhase !== 'actions'}
                >
                  View Properties
                </Button>
                
                <Dialog open={isTradeOpen} onOpenChange={setIsTradeOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled={!canTrade}
                    >
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Trade
                      {!canTrade && turnPhase === 'actions' && (
                        <span className="text-xs ml-1">(No property)</span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Trade Money</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Trade with:</label>
                        <Select value={selectedTradePlayer} onValueChange={setSelectedTradePlayer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select player" />
                          </SelectTrigger>
                          <SelectContent>
                            {otherPlayers.map(player => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name} (${player.money})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Amount:</label>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setTradeAmount(100)}
                            className={tradeAmount === 100 ? "bg-primary text-primary-foreground" : ""}
                          >
                            $100
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setTradeAmount(200)}
                            className={tradeAmount === 200 ? "bg-primary text-primary-foreground" : ""}
                          >
                            $200
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setTradeAmount(500)}
                            className={tradeAmount === 500 ? "bg-primary text-primary-foreground" : ""}
                          >
                            $500
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsTradeOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="game" 
                          className="flex-1"
                          onClick={handleTrade}
                          disabled={!selectedTradePlayer}
                        >
                          Trade ${tradeAmount}
                        </Button>
                      </div>
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
    </div>
  );
};

export default GameBoard;