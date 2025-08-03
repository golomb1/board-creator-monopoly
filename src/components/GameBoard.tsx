import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Dice1, Settings } from "lucide-react";

interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  money: number;
}

interface BoardSpace {
  id: string;
  name: string;
  type: 'property' | 'special' | 'corner';
  color?: string;
  price?: number;
  rent?: number;
}

interface GameBoardProps {
  players: Player[];
  boardSpaces: BoardSpace[];
  currentPlayer: number;
  onRollDice: () => void;
  onOpenSettings: () => void;
}

const GameBoard = ({ players, boardSpaces, currentPlayer, onRollDice, onOpenSettings }: GameBoardProps) => {
  // Create a 11x11 grid for the board (corners + sides)
  const createBoardLayout = () => {
    const board = Array(11).fill(null).map(() => Array(11).fill(null));
    
    // Place spaces around the perimeter
    // Bottom row (left to right)
    for (let i = 0; i < 11; i++) {
      board[10][i] = boardSpaces[i] || { id: `bottom-${i}`, name: `Space ${i + 1}`, type: 'property' };
    }
    
    // Right column (bottom to top)
    for (let i = 1; i < 10; i++) {
      board[10 - i][10] = boardSpaces[10 + i] || { id: `right-${i}`, name: `Space ${11 + i}`, type: 'property' };
    }
    
    // Top row (right to left)
    for (let i = 1; i < 10; i++) {
      board[0][10 - i] = boardSpaces[19 + i] || { id: `top-${i}`, name: `Space ${20 + i}`, type: 'property' };
    }
    
    // Left column (top to bottom)
    for (let i = 1; i < 10; i++) {
      board[i][0] = boardSpaces[28 + i] || { id: `left-${i}`, name: `Space ${29 + i}`, type: 'property' };
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
    const playersOnSpace = players.filter(p => p.position === parseInt(space.id.split('-')[1]) || 0);

    return (
      <Card
        key={space.id}
        variant="property"
        className={`
          aspect-square flex flex-col justify-between p-1 text-xs
          ${isCorner ? 'w-20 h-20' : 'w-16 h-16'}
          ${space.type === 'corner' ? 'bg-gradient-secondary' : ''}
          hover:scale-105 transition-smooth
        `}
      >
        {space.type === 'property' && space.color && (
          <div className={`h-2 ${getPropertyColor(space)} rounded-sm`} />
        )}
        
        <div className="flex-1 flex flex-col justify-center text-center">
          <div className="font-medium leading-tight">{space.name}</div>
          {space.price && (
            <div className="text-primary font-bold">${space.price}</div>
          )}
        </div>

        {playersOnSpace.length > 0 && (
          <div className="flex gap-0.5 flex-wrap justify-center">
            {playersOnSpace.map(player => (
              <div
                key={player.id}
                className="w-2 h-2 rounded-full border border-white"
                style={{ backgroundColor: player.color }}
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

              {/* Center area with game info */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Card className="pointer-events-auto p-6 bg-gradient-property border-2 border-primary/20">
                  <div className="text-center space-y-4">
                    <h2 className="text-xl font-bold">Custom Monopoly</h2>
                    <div className="text-sm text-muted-foreground">
                      Player {currentPlayer + 1}'s Turn
                    </div>
                    <Button 
                      variant="game" 
                      size="lg"
                      onClick={onRollDice}
                    >
                      <Dice1 className="w-5 h-5" />
                      Roll Dice
                    </Button>
                  </div>
                </Card>
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
                      p-3 rounded-lg border-2 transition-smooth
                      ${index === currentPlayer 
                        ? 'border-primary bg-primary/10 shadow-glow' 
                        : 'border-border bg-card'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="font-medium">{player.name}</span>
                      {index === currentPlayer && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Money: <span className="font-bold text-primary">${player.money}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Position: {player.position}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Game Actions */}
            <Card variant="property" className="p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  View Properties
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Trade
                </Button>
                <Button variant="outline" size="sm" className="w-full">
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