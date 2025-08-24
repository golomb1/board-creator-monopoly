import { Player } from "@/contexts/GameContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Star } from "lucide-react";

interface WinnerDialogProps {
  isOpen: boolean;
  winner: Player | null;
  onNewGame: () => void;
  onViewBoard: () => void;
}

const WinnerDialog = ({ isOpen, winner, onNewGame, onViewBoard }: WinnerDialogProps) => {
  if (!winner) return null;

  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Crown className="w-16 h-16 text-primary animate-bounce" />
              <div className="absolute -top-2 -right-2">
                <Star className="w-6 h-6 text-accent animate-pulse" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-primary mb-2">
            🎉 WINNER! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg"
              style={{ backgroundColor: winner.color }}
            >
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-1">{winner.name}</h3>
            <p className="text-muted-foreground">Congratulations on your victory!</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-background/50 rounded-lg p-3 border">
              <div className="font-semibold text-primary">Final Money</div>
              <div className="text-lg">${winner.money.toLocaleString()}</div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border">
              <div className="font-semibold text-primary">Properties</div>
              <div className="text-lg">{winner.properties.length}</div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onViewBoard} className="flex-1">
              View Board
            </Button>
            <Button variant="default" onClick={onNewGame} className="flex-1">
              New Game
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WinnerDialog;