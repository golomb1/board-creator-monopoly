import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

interface DiceRollerProps {
  onRoll: (total: number, dice1: number, dice2: number) => void;
  disabled?: boolean;
  isRolling?: boolean;
}

const DiceRoller = ({ onRoll, disabled, isRolling }: DiceRollerProps) => {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const getDiceIcon = (value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const IconComponent = icons[value - 1];
    return <IconComponent className="w-8 h-8" />;
  };

  const rollDice = async () => {
    if (disabled || isAnimating) return;
    
    setIsAnimating(true);
    
    // Animate dice rolling for 1 second
    const animationDuration = 1000;
    const frameRate = 100; // Update every 100ms
    const frames = animationDuration / frameRate;
    
    for (let i = 0; i < frames; i++) {
      await new Promise(resolve => setTimeout(resolve, frameRate));
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
    }
    
    // Final roll values
    const finalDice1 = Math.floor(Math.random() * 6) + 1;
    const finalDice2 = Math.floor(Math.random() * 6) + 1;
    
    setDice1(finalDice1);
    setDice2(finalDice2);
    setIsAnimating(false);
    
    // Call the onRoll callback with results
    onRoll(finalDice1 + finalDice2, finalDice1, finalDice2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex gap-4 items-center">
        <Card className={`
          p-4 bg-gradient-property border-2 border-primary/20 
          ${isAnimating ? 'animate-dice-roll' : 'animate-bounce-in'}
          hover:shadow-glow transition-all duration-300
        `}>
          <div className="text-primary">
            {getDiceIcon(dice1)}
          </div>
        </Card>
        
        <Card className={`
          p-4 bg-gradient-property border-2 border-primary/20 
          ${isAnimating ? 'animate-dice-roll' : 'animate-bounce-in'}
          hover:shadow-glow transition-all duration-300
        `}>
          <div className="text-primary">
            {getDiceIcon(dice2)}
          </div>
        </Card>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-primary mb-2">
          {dice1 + dice2}
        </div>
        <Button 
          variant="game" 
          size="lg"
          onClick={rollDice}
          disabled={disabled || isAnimating}
          className={isAnimating ? 'animate-pulse' : ''}
        >
          {isAnimating ? 'Rolling...' : 'Roll Dice'}
        </Button>
      </div>
    </div>
  );
};

export default DiceRoller;