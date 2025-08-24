# Card Effects Editing Guide

This document explains how to edit and customize action cards and question cards in this custom Monopoly game.

## Table of Contents
- [Overview](#overview)
- [Action Cards](#action-cards)
- [Question Cards](#question-cards)
- [Adding Images](#adding-images)
- [Creating New Effects](#creating-new-effects)
- [File Structure](#file-structure)

## Overview

The game uses two types of cards:
- **Action Cards**: Trigger specific game effects when landed on
- **Question Cards**: Present trivia questions with rewards/penalties

Both card types support optional images and are fully customizable.

## Action Cards

### Location
Action cards are defined in `src/store/gameSlice.ts` in the `initialSettings.actionCards` array.

### Structure
```typescript
interface ActionCard {
  id: string;           // Unique identifier
  title: string;        // Display name
  description: string;  // What the card does
  effect: string;       // The effect type (see below)
  value?: number;       // Optional value for effects that need it
  image?: string;       // Optional image URL or path
}
```

### Available Effects

#### 1. `skip-turn`
Makes the player skip their next turn.
```typescript
{ 
  id: 'a2', 
  title: 'Skip Turn', 
  description: 'Skip your next turn', 
  effect: 'skip-turn' 
}
```

#### 2. `extra-turn`
Grants the player an additional turn.
```typescript
{ 
  id: 'a3', 
  title: 'Extra Turn', 
  description: 'Take another turn!', 
  effect: 'extra-turn' 
}
```

#### 3. `collect-money`
Gives money to the player. Use `value` to specify amount.
```typescript
{ 
  id: 'a4', 
  title: 'Bank Error', 
  description: 'Bank error in your favor - collect money', 
  effect: 'collect-money', 
  value: 200 
}
```

#### 4. `pay-money`
Takes money from the player. Use `value` to specify amount.
```typescript
{ 
  id: 'a5', 
  title: 'Pay Tax', 
  description: 'Pay income tax', 
  effect: 'pay-money', 
  value: 100 
}
```

#### 5. `go-to-jail`
Sends the player directly to jail (position 10).
```typescript
{ 
  id: 'a1', 
  title: 'Go to Jail', 
  description: 'Go directly to jail, do not pass GO', 
  effect: 'go-to-jail' 
}
```

#### 6. `advance-spaces`
Moves the player forward. Use `value` to specify number of spaces.
```typescript
{ 
  id: 'a6', 
  title: 'Advance 3 Spaces', 
  description: 'Move forward 3 spaces', 
  effect: 'advance-spaces', 
  value: 3 
}
```

### Effect Implementation

Effects are implemented in `src/utils/actionCards.ts`. Each effect is a function that:
- Takes a player object, board spaces array, and optional value
- Returns updated player, updated board spaces, and a message

Example effect function:
```typescript
'collect-money': (player: Player, boardSpaces: BoardSpace[], amount: number = 200) => {
  return {
    updatedPlayer: { ...player, money: player.money + amount },
    updatedBoardSpaces: boardSpaces,
    message: `${player.name} collected $${amount}!`
  };
}
```

## Question Cards

### Location
Question cards are defined in `src/store/gameSlice.ts` in the `initialSettings.questionCards` array.

### Structure
```typescript
interface QuestionCard {
  id: string;           // Unique identifier
  question: string;     // The question text
  options: string[];    // Array of answer choices
  correctAnswer: number; // Index of correct answer (0-based)
  reward: number;       // Money gained for correct answer
  penalty: number;      // Money lost for wrong answer
  image?: string;       // Optional image URL or path
}
```

### Example
```typescript
{
  id: 'q1',
  question: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  correctAnswer: 1, // Index 1 = '4'
  reward: 100,
  penalty: 50,
  image: '/images/math-question.jpg' // Optional
}
```

## Adding Images

Both action and question cards support optional images via the `image` property.

### Image Formats
- **Local images**: Place in `public/images/` folder and reference as `/images/filename.jpg`
- **External URLs**: Use full HTTP/HTTPS URLs
- **Imported assets**: Place in `src/assets/` and import them

### Examples
```typescript
// Local image
{ 
  id: 'a1', 
  title: 'Go to Jail', 
  effect: 'go-to-jail',
  image: '/images/jail-card.png'
}

// External URL
{ 
  id: 'q1', 
  question: 'What is the capital of France?',
  image: 'https://example.com/france-flag.jpg'
}
```

## Creating New Effects

To add a new action card effect:

### 1. Add the effect to the type definition
In `src/store/gameSlice.ts`, update the ActionCard effect type:
```typescript
effect: 'go-to-jail' | 'skip-turn' | 'extra-turn' | 'collect-money' | 'pay-money' | 'advance-spaces' | 'your-new-effect';
```

### 2. Implement the effect function
In `src/utils/actionCards.ts`, add your effect to the `actionCardDictionary`:
```typescript
'your-new-effect': (player: Player, boardSpaces: BoardSpace[], value?: number) => {
  // Your custom logic here
  return {
    updatedPlayer: { ...player, /* your modifications */ },
    updatedBoardSpaces: boardSpaces, // or modified spaces
    message: `Your custom message for ${player.name}`
  };
}
```

### 3. Handle the effect in executeActionCard
If your effect uses the `value` parameter, add handling in the `executeActionCard` function:
```typescript
if (actionCard.effect === 'your-new-effect') {
  return actionFunction(player, boardSpaces, actionCard.value || defaultValue);
}
```

### Example: Creating a "teleport" effect
```typescript
// 1. In gameSlice.ts - add to effect type
effect: '...' | 'teleport';

// 2. In actionCards.ts - add to dictionary
'teleport': (player: Player, boardSpaces: BoardSpace[], position: number = 0) => {
  return {
    updatedPlayer: { ...player, position: position % boardSpaces.length },
    updatedBoardSpaces: boardSpaces,
    message: `${player.name} teleported to ${boardSpaces[position]?.name || 'unknown location'}!`
  };
}

// 3. In executeActionCard function
if (actionCard.effect === 'teleport') {
  return actionFunction(player, boardSpaces, actionCard.value || 0);
}
```

## File Structure

```
src/
├── store/
│   └── gameSlice.ts          # Card definitions and game state
├── utils/
│   └── actionCards.ts        # Action card effect implementations
└── components/
    ├── DiceRoller.tsx        # May display action cards
    ├── GameBoard.tsx         # Renders cards on board
    └── GameSettings.tsx      # Edit cards in settings
```

## Tips

1. **IDs must be unique**: Each card needs a unique ID
2. **Test your effects**: Make sure effect functions handle edge cases
3. **Keep descriptions clear**: Players need to understand what cards do
4. **Balance rewards/penalties**: Consider game balance when setting values
5. **Image optimization**: Use appropriately sized images for performance
6. **Backup your changes**: Always backup before making major modifications

## Common Modifications

### Adding more money effects
```typescript
{ 
  id: 'a9', 
  title: 'Lottery Win', 
  description: 'You won the lottery!', 
  effect: 'collect-money', 
  value: 500,
  image: '/images/lottery.jpg'
}
```

### Creating movement cards
```typescript
{ 
  id: 'a10', 
  title: 'Speed Boost', 
  description: 'Move forward 5 spaces', 
  effect: 'advance-spaces', 
  value: 5 
}
```

### Adding complex questions
```typescript
{
  id: 'q6',
  question: 'Which cloud service is known for object storage?',
  options: ['Lambda', 'S3', 'EC2', 'RDS'],
  correctAnswer: 1,
  reward: 200,
  penalty: 100,
  image: '/images/cloud-storage.jpg'
}
```

This guide should help you customize cards to fit your game's theme and mechanics!