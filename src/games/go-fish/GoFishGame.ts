import {
  BaseGame,
  Card,
  CLIAdapter,
  CardUtils,
  IOutputAdapter,
  Player,
} from "../../core";
import { GoFishRules } from "./GoFishRules";

/**
 * Implementation of the Go Fish card game
 */
export class GoFishGame extends BaseGame<Card> {
  constructor(output: IOutputAdapter = new CLIAdapter()) {
    // Create a standard deck of cards
    const deck = CardUtils.createStandardDeck();

    // Create the rules
    const rules = new GoFishRules();

    // Initialize the game
    super(rules, output, deck);
  }

  /**
   * Play a turn in the Go Fish game
   * In Go Fish, a player asks another player for cards of a specific rank
   */
  async playTurn(): Promise<boolean> {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      this.output.showError("No current player");
      return false;
    }

    // Get the player's hand
    const hand = currentPlayer.hand.getCards();
    if (hand.length === 0) {
      this.output.showMessage(`${currentPlayer.name} has no cards to play`);
      return false;
    }

    // Group cards by rank for easier selection
    const cardsByRank = CardUtils.groupCardsByRank(hand);
    const ranks = Object.keys(cardsByRank);

    // Let the player select a rank to ask for
    const rankOptions = ranks.map(
      (rank) => `${rank} (${cardsByRank[rank].length} cards)`
    );
    const rankIndex = await this.output.promptSelect(
      "Select a rank to ask for",
      rankOptions
    );
    const selectedRank = ranks[rankIndex];

    // Let the player select another player to ask
    const otherPlayers = this.getPlayers().filter(
      (p) => p.id !== currentPlayer.id && p.hand.size() > 0
    );

    if (otherPlayers.length === 0) {
      this.output.showError("No other players with cards");
      return false;
    }

    const playerOptions = otherPlayers.map(
      (p) => `${p.name} (${p.hand.size()} cards)`
    );
    const playerIndex = await this.output.promptSelect(
      "Select a player to ask",
      playerOptions
    );
    const targetPlayer = otherPlayers[playerIndex];

    // Play the move
    return this.playMove(currentPlayer.id, {
      targetPlayerId: targetPlayer.id,
      rank: selectedRank,
    });
  }

  /**
   * Play the Go Fish game with AI players
   * This is a simplified AI that makes random valid moves
   */
  async playWithAI(
    humanPlayerName: string = "Player 1",
    numAIPlayers: number = 1,
    maxTurns: number = 100
  ): Promise<void> {
    // Create players
    const humanPlayer = new Player("human", humanPlayerName);
    this.addPlayer(humanPlayer);

    for (let i = 0; i < numAIPlayers; i++) {
      this.addPlayer(new Player(`ai-${i + 1}`, `AI Player ${i + 1}`));
    }

    // Start the game
    this.start();

    let turnCount = 0;
    let gameOver = this.getGameState().getCustomState<boolean>(
      "gameOver",
      false
    );

    while (!gameOver && turnCount < maxTurns) {
      const currentPlayer = this.getCurrentPlayer()!;

      if (currentPlayer.id === "human") {
        // Human player's turn
        await this.playTurn();
      } else {
        // AI player's turn
        await this.playAITurn(currentPlayer);
      }

      turnCount++;
      gameOver = this.getGameState().getCustomState<boolean>("gameOver", false);

      // Display the last action
      const lastAction = this.getGameState().getCustomState<string>(
        "lastAction",
        ""
      );
      if (lastAction) {
        this.output.showMessage(lastAction);
      }

      // Add a small delay to make it easier to follow
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (turnCount >= maxTurns) {
      this.output.showMessage(`Game stopped after ${maxTurns} turns`);
    }
  }

  /**
   * Play a turn for an AI player
   */
  private async playAITurn(aiPlayer: Player): Promise<boolean> {
    const hand = aiPlayer.hand.getCards();
    if (hand.length === 0) {
      return false;
    }

    // Group cards by rank
    const cardsByRank = CardUtils.groupCardsByRank(hand);
    const ranks = Object.keys(cardsByRank);

    // Randomly select a rank from the AI's hand
    const randomRankIndex = Math.floor(Math.random() * ranks.length);
    const selectedRank = ranks[randomRankIndex];

    // Get other players with cards
    const otherPlayers = this.getPlayers().filter(
      (p) => p.id !== aiPlayer.id && p.hand.size() > 0
    );

    if (otherPlayers.length === 0) {
      return false;
    }

    // Randomly select a player to ask
    const randomPlayerIndex = Math.floor(Math.random() * otherPlayers.length);
    const targetPlayer = otherPlayers[randomPlayerIndex];

    // Play the move
    return this.playMove(aiPlayer.id, {
      targetPlayerId: targetPlayer.id,
      rank: selectedRank,
    });
  }

  /**
   * Play the Go Fish game automatically until completion
   * This is useful for testing or for playing with all AI players
   */
  async autoPlay(maxTurns: number = 100): Promise<void> {
    // Start with at least 2 AI players if none have been added
    if (this.getPlayers().length < 2) {
      this.addPlayer(new Player("ai-1", "AI Player 1"));
      this.addPlayer(new Player("ai-2", "AI Player 2"));
      this.start();
    }

    let turnCount = 0;
    let gameOver = this.getGameState().getCustomState<boolean>(
      "gameOver",
      false
    );

    while (!gameOver && turnCount < maxTurns) {
      const currentPlayer = this.getCurrentPlayer()!;
      await this.playAITurn(currentPlayer);

      turnCount++;
      gameOver = this.getGameState().getCustomState<boolean>("gameOver", false);

      // Display the last action
      const lastAction = this.getGameState().getCustomState<string>(
        "lastAction",
        ""
      );
      if (lastAction) {
        this.output.showMessage(lastAction);
      }

      // Add a small delay to make it easier to follow
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (turnCount >= maxTurns) {
      this.output.showMessage(`Game stopped after ${maxTurns} turns`);
    }
  }
}
