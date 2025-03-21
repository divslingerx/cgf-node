import { IGameRules, GameState, Card, Player, ICard } from "../../core";

/**
 * Rules for the War card game
 *
 * In War, each player gets half the deck. On each turn, both players reveal the top card of their deck.
 * The player with the higher card takes both cards. If there's a tie, there's a "war" where each player
 * puts down three cards face down and then one face up. The player with the higher face-up card takes all cards.
 * The game continues until one player has all the cards.
 */
export class WarRules implements IGameRules<Card> {
  /**
   * Initialize the game state
   */
  initializeGame(gameState: GameState<Card>): void {
    // Ensure we have exactly 2 players
    if (gameState.players.length !== 2) {
      throw new Error("War requires exactly 2 players");
    }

    // Shuffle the deck
    gameState.deck.shuffle();

    // Deal half the deck to each player
    const totalCards = gameState.deck.size();
    const cardsPerPlayer = Math.floor(totalCards / 2);

    const player1 = gameState.players[0];
    const player2 = gameState.players[1];

    player1.hand.addCards(gameState.deck.draw(cardsPerPlayer));
    player2.hand.addCards(gameState.deck.draw(cardsPerPlayer));

    // Set the first player as the current player
    gameState.currentPlayerId = player1.id;

    // Initialize custom state for the War game
    gameState.setCustomState("cardsInPlay", []);
    gameState.setCustomState("warMode", false);
    gameState.setCustomState("roundWinner", null);
  }

  /**
   * Validate if a move is legal according to the game rules
   * In War, the only valid move is "play" to play the top card
   */
  validateMove(gameState: GameState<Card>, player: Player, move: any): boolean {
    // In War, the only valid move is "play"
    return move === "play" && player.hand.size() > 0;
  }

  /**
   * Apply a move to the game state
   */
  applyMove(gameState: GameState<Card>, player: Player, move: any): void {
    if (move !== "play") {
      return;
    }

    // Get the current cards in play
    let cardsInPlay = gameState.getCustomState<Card[]>("cardsInPlay", []) || [];
    const warMode = gameState.getCustomState<boolean>("warMode", false);

    // Get the other player
    const otherPlayerId = gameState.players.find((p) => p.id !== player.id)!.id;
    const otherPlayer = gameState.getPlayerById(otherPlayerId)!;

    // Both players play a card
    const playerCard = player.hand.getCards()[0];
    player.hand.removeCard(playerCard.id);

    const otherPlayerCard = otherPlayer.hand.getCards()[0];
    otherPlayer.hand.removeCard(otherPlayerCard.id);

    // Make cards face up (cast to Card to access the flip method)
    (playerCard as Card).isFaceUp = true;
    (otherPlayerCard as Card).isFaceUp = true;

    // Add cards to the cards in play
    cardsInPlay.push(playerCard as Card, otherPlayerCard as Card);

    // Compare cards to determine the winner
    const playerRank = this.getCardRank(playerCard);
    const otherPlayerRank = this.getCardRank(otherPlayerCard);

    if (playerRank > otherPlayerRank) {
      // Current player wins
      this.handleRoundWin(gameState, player, cardsInPlay);
    } else if (otherPlayerRank > playerRank) {
      // Other player wins
      this.handleRoundWin(gameState, otherPlayer, cardsInPlay);
    } else {
      // It's a war!
      gameState.setCustomState("warMode", true);
      gameState.setCustomState("cardsInPlay", [...cardsInPlay]);

      // Check if both players have enough cards for war
      if (player.hand.size() < 4 || otherPlayer.hand.size() < 4) {
        // Not enough cards for war, the player with more cards wins
        if (player.hand.size() > otherPlayer.hand.size()) {
          this.handleRoundWin(gameState, player, cardsInPlay);
        } else {
          this.handleRoundWin(gameState, otherPlayer, cardsInPlay);
        }
      } else {
        // Both players have enough cards for war
        // Each player puts 3 cards face down
        for (let i = 0; i < 3; i++) {
          const playerWarCard = player.hand.getCards()[0];
          player.hand.removeCard(playerWarCard.id);

          const otherPlayerWarCard = otherPlayer.hand.getCards()[0];
          otherPlayer.hand.removeCard(otherPlayerWarCard.id);

          cardsInPlay.push(playerWarCard as Card, otherPlayerWarCard as Card);
        }

        // Update the cards in play
        gameState.setCustomState("cardsInPlay", [...cardsInPlay]);
      }
    }
  }

  /**
   * Handle a player winning a round
   */
  private handleRoundWin(
    gameState: GameState<Card>,
    winner: Player,
    cards: Card[]
  ): void {
    // Add all cards to the winner's hand
    winner.hand.addCards(cards);

    // Reset the cards in play
    gameState.setCustomState("cardsInPlay", []);
    gameState.setCustomState("warMode", false);
    gameState.setCustomState("roundWinner", winner.id);

    // Update scores
    winner.setScore(winner.hand.size());

    // Find the other player and update their score
    const otherPlayer = gameState.players.find((p) => p.id !== winner.id)!;
    otherPlayer.setScore(otherPlayer.hand.size());
  }

  /**
   * Check if the game is over
   */
  isGameOver(gameState: GameState<Card>): boolean {
    // Game is over when one player has all the cards
    return gameState.players.some((player) => player.hand.size() === 0);
  }

  /**
   * Get the winner(s) of the game
   */
  getWinners(gameState: GameState<Card>): string[] {
    // The winner is the player with cards
    const winners = gameState.players.filter(
      (player) => player.hand.size() > 0
    );
    return winners.map((player) => player.id);
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
    // In War, players alternate turns
    return gameState.players.find((p) => p.id !== gameState.currentPlayerId)!
      .id;
  }

  /**
   * Advance to the next player's turn
   */
  nextTurn(gameState: GameState<Card>): void {
    gameState.currentPlayerId = this.getNextPlayerId(gameState);
  }

  /**
   * Get the rank of a card
   */
  private getCardRank(card: ICard): number {
    const rankMap: Record<string, number> = {
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      "10": 10,
      J: 11,
      Q: 12,
      K: 13,
      A: 14,
    };

    const rank = card.id.split("-")[0];
    return rankMap[rank] || 0;
  }
}
