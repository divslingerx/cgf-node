# 🃏 CardGame Framework: Because Real Cards Are So 2019

Welcome to the most over-engineered way to play War since the invention of nuclear weapons! This TypeScript card game framework is perfect for when you're too lazy to shuffle real cards but not too lazy to write 5,000 lines of code.

## 🎮 Features

- **Absurdly Flexible Architecture**: We've abstracted card games to the point where even the cards don't know what game they're playing.
- **Type Safety**: Because nothing says "fun card game" like compile-time errors.
- **Multiple Game Support**: Currently featuring War (for when you want to waste 3 hours) and Go Fish (for when you want to lie to children).
- **CLI Interface**: Experience the thrill of playing cards through the excitement of a command line. Graphics are overrated anyway.
- **Extensible Framework**: Create your own card games! Because the world definitely needs another implementation of Solitaire.

## 🚀 Getting Started

```bash
# Clone this repository
git clone https://github.com/divslingerx/card-game-framework.git

# Install dependencies
pnpm install

# Run the War example (prepare to be underwhelmed)
pnpm run example:war

# Run the Go Fish example (slightly less underwhelming)
pnpm run example:go-fish
```

## 💻 Usage

Here's how to create your own card game, because apparently that's easier than just downloading a card game app:

```typescript
import { BaseGame, Card, CLIAdapter, CardUtils } from "card-game-framework";

// Step 1: Create a game that's way more complex than it needs to be
export class MyOverengineeredCardGame extends BaseGame<Card> {
  constructor() {
    // Create a deck that took 50 lines of code to implement
    const deck = CardUtils.createStandardDeck();

    // Create rules that could have been written on a napkin
    const rules = new MyExcessivelyDetailedRules();

    // Initialize the game with more parameters than necessary
    super(rules, new CLIAdapter(), deck);
  }

  // Step 2: Implement methods that could have been one-liners
  async playTurn(): Promise<boolean> {
    // 20 lines of code to do what a 5-year-old can do intuitively
    return true;
  }
}
```

## 🧩 Architecture

Our architecture is so clean you could eat off it. We've got:

- **Cards**: They have IDs and names. Revolutionary.
- **Decks**: For when you need to put cards in a pile. Groundbreaking.
- **Hands**: Like decks, but your holding it.
- **Players**: Entities that hold cards and make decisions. Just like real life, except these ones follow rules.
- **Game Rules**: Because we needed somewhere to put all those if-statements.
- **Game State**: The state of the current game. Did you guess that?

## 🎲 Supported Games

### War

The perfect game for when you want to feel like you're doing something without actually making any decisions. Our implementation faithfully recreates the experience of watching paint dry, but with cards.

### Go Fish

Ask for cards you already have, watch the AI randomly succeed. Experience the thrill of collecting sets of four identical cards.

### Coming Soon™

- **Solitaire**: For when you want to play cards but hate other people.
- **52 Card Pickup**: Our most technically challenging implementation yet.

## 🤝 Contributing

Found a bug? Want to add a feature? Want to implement another card game that nobody will play? We welcome your contributions! Please submit a pull request with your changes, and we'll review it sometime between now and when i need more green on my github contribution map.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details. You're free to use this code however you want, but we can't imagine why you would.

---

_Remember: The real winning move is not to play. But if you must play, at least do it with an unnecessarily complex TypeScript framework._
