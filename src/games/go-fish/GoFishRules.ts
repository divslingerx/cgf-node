import {
  IGameRules,
  GameState,
  Card,
  Player,
  ICard,
  CardUtils,
} from "../../core";

/**
 * Rules for the Go Fish card game
 *
 * In Go Fish, players take turns asking each other for cards of a specific rank.
 * If the asked player has cards of that rank, they must give them all to the asking player.
 * If not, the asking player must "go fish" and draw a card from the deck.
 * When a player collects all 4 cards of a rank, they form a "book" and set it aside.
 * The game ends when all books have been collected or the deck is empty.
 * The player with the most books wins.
 */
export class GoFishRules implements IGameRules<Card> {
  /**
   * Initialize the game state
   */
  initializeGame(gameState: GameState<Card>): void {
    // Ensure we have at least 2 players
    if (gameState.players.length < 2) {
      throw new Error("Go Fish requires at least 2 players");
    }

    // Shuffle the deck
    gameState.deck.shuffle();

    // Determine number of cards to deal based on player count
    let cardsPerPlayer = 7;
    if (gameState.players.length > 3) {
      cardsPerPlayer = 5;
    }

    // Deal cards to players
    CardUtils.dealCards(
      gameState.deck,
      gameState.players,
      cardsPerPlayer,
      true
    );

    // Set the first player as the current player
    gameState.currentPlayerId = gameState.players[0].id;

    // Initialize custom state for the Go Fish game
    gameState.setCustomState("books", {}); // Map of player ID to array of book ranks
    gameState.setCustomState("lastAction", null);
    gameState.setCustomState("gameOver", false);
  }

  /**
   * Validate if a move is legal according to the game rules
   */
  validateMove(gameState: GameState<Card>, player: Player, move: any): boolean {
    // In Go Fish, a move consists of asking a player for a rank
    if (
      typeof move !== "object" ||
      typeof move.targetPlayerId !== "string" ||
      typeof move.rank !== "string"
    ) {
      return false;
    }

    // Cannot ask yourself for cards
    if (move.targetPlayerId === player.id) {
      return false;
    }

    // Target player must exist
    const targetPlayer = gameState.getPlayerById(move.targetPlayerId);
    if (!targetPlayer) {
      return false;
    }

    // Player must have at least one card of the requested rank in their hand
    const playerCards = player.hand.getCards();
    const hasRequestedRank = playerCards.some(
      (card) => this.getCardRank(card) === move.rank
    );

    return hasRequestedRank;
  }

  /**
   * Apply a move to the game state
   */
  applyMove(gameState: GameState<Card>, player: Player, move: any): void {
    const { targetPlayerId, rank } = move;
    const targetPlayer = gameState.getPlayerById(targetPlayerId)!;

    // Find all cards of the requested rank in the target player's hand
    const targetCards = targetPlayer.hand
      .getCards()
      .filter((card) => this.getCardRank(card) === rank);

    let action = "";

    if (targetCards.length > 0) {
      // Target player has cards of the requested rank
      action = `${player.name} asked ${targetPlayer.name} for ${rank}s and got ${targetCards.length} card(s)`;

      // Remove cards from target player's hand and add to current player's hand
      const removedCards = targetPlayer.hand.removeCards(
        targetCards.map((card) => card.id)
      );
      player.hand.addCards(removedCards);

      // Check if the player has completed a book
      this.checkForBooks(gameState, player);
    } else {
      // Target player doesn't have cards of the requested rank - Go Fish!
      action = `${player.name} asked ${targetPlayer.name} for ${rank}s and was told to Go Fish!`;

      // Draw a card from the deck if available
      if (!gameState.deck.isEmpty()) {
        const drawnCard = gameState.deck.draw(1)[0];
        player.hand.addCard(drawnCard);

        // If the drawn card is of the requested rank, the player gets another turn
        if (this.getCardRank(drawnCard) === rank) {
          action += ` ${player.name} drew the ${drawnCard.name} and gets another turn!`;
          gameState.setCustomState("anotherTurn", true);
        } else {
          action += ` ${player.name} drew a card.`;
          gameState.setCustomState("anotherTurn", false);
        }

        // Check if the player has completed a book with the drawn card
        this.checkForBooks(gameState, player);
      } else {
        action += " The deck is empty.";
        gameState.setCustomState("anotherTurn", false);
      }
    }

    // Update the last action
    gameState.setCustomState("lastAction", action);

    // Check if the game is over
    if (this.isGameOver(gameState)) {
      gameState.setCustomState("gameOver", true);
    }
  }

  /**
   * Check if a player has completed any books (all 4 cards of a rank)
   */
  private checkForBooks(gameState: GameState<Card>, player: Player): void {
    // Group cards by rank
    const cardsByRank = CardUtils.groupCardsByRank(player.hand.getCards());
    const books =
      gameState.getCustomState<Record<string, string[]>>("books", {}) || {};

    // Initialize player's books if not already done
    if (!books[player.id]) {
      books[player.id] = [];
    }

    // Check each rank for a complete book (4 cards)
    for (const [rank, cards] of Object.entries(cardsByRank)) {
      if (cards.length === 4) {
        // Remove the book from the player's hand
        player.hand.removeCards(cards.map((card) => card.id));

        // Add the book to the player's collection
        books[player.id].push(rank);

        // Update the player's score
        player.setScore(books[player.id].length);
      }
    }

    // Update the books in the game state
    gameState.setCustomState("books", books);
  }

  /**
   * Check if the game is over
   */
  isGameOver(gameState: GameState<Card>): boolean {
    // Game is over when all books have been collected (13 books total in a standard deck)
    // or when the deck is empty and no player can make a valid move
    const books =
      gameState.getCustomState<Record<string, string[]>>("books", {}) || {};
    const totalBooks = Object.values(books).reduce(
      (sum, playerBooks) => sum + playerBooks.length,
      0
    );

    if (totalBooks === 13) {
      return true;
    }

    // Check if the deck is empty and no player can make a valid move
    if (gameState.deck.isEmpty()) {
      // Check if any player has cards
      const anyPlayerHasCards = gameState.players.some(
        (player) => player.hand.size() > 0
      );

      if (!anyPlayerHasCards) {
        return true;
      }

      // Check if any player can make a valid move
      for (const player of gameState.players) {
        if (player.hand.size() === 0) continue;

        // Group player's cards by rank
        const playerCardsByRank = CardUtils.groupCardsByRank(
          player.hand.getCards()
        );

        // Check if any other player has cards of the same rank
        for (const rank of Object.keys(playerCardsByRank)) {
          for (const otherPlayer of gameState.players) {
            if (otherPlayer.id === player.id) continue;
            if (otherPlayer.hand.size() === 0) continue;

            const otherPlayerCards = otherPlayer.hand.getCards();
            const hasMatchingRank = otherPlayerCards.some(
              (card) => this.getCardRank(card) === rank
            );

            if (hasMatchingRank) {
              return false; // Valid move exists
            }
          }
        }
      }

      return true; // No valid moves exist
    }

    return false;
  }

  /**
   * Get the winner(s) of the game
   */
  getWinners(gameState: GameState<Card>): string[] {
    const books =
      gameState.getCustomState<Record<string, string[]>>("books", {}) || {};
    let maxBooks = 0;
    let winners: string[] = [];

    // Find the player(s) with the most books
    for (const [playerId, playerBooks] of Object.entries(books)) {
      if (playerBooks.length > maxBooks) {
        maxBooks = playerBooks.length;
        winners = [playerId];
      } else if (playerBooks.length === maxBooks) {
        winners.push(playerId);
      }
    }

    return winners;
  }

  /**
   * Get the current player's ID
   */
  getCurrentPlayerId(gameState: GameState<Card>): string {
    return gameState.currentPlayerId;
  }

  /**
   * Get the next player's ID
   */
  getNextPlayerId(gameState: GameState<Card>): string {
    // If the current player gets another turn, they remain the current player
    if (gameState.getCustomState<boolean>("anotherTurn", false)) {
      return gameState.currentPlayerId;
    }

    // Otherwise, move to the next player
    const currentIndex = gameState.players.findIndex(
      (p) => p.id === gameState.currentPlayerId
    );
    const nextIndex = (currentIndex + 1) % gameState.players.length;
    return gameState.players[nextIndex].id;
  }

  /**
   * Advance to the next player's turn
   */
  nextTurn(gameState: GameState<Card>): void {
    gameState.currentPlayerId = this.getNextPlayerId(gameState);
    gameState.setCustomState("anotherTurn", false);
  }

  /**
   * Get the rank of a card
   */
  private getCardRank(card: ICard): string {
    return card.id.split("-")[0];
  }
}
