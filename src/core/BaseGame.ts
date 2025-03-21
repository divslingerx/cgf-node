import { ICard } from "./Card";
import { Deck } from "./Deck";
import { GameState } from "./GameState";
import { IGameRules } from "./GameRules";
import { Player } from "./Player";
import { IOutputAdapter } from "./OutputAdapter";

/**
 * Base class for card games
 * This provides the core functionality that all card games will share
 */
export abstract class BaseGame<T extends ICard = ICard> {
  protected gameState: GameState<T>;
  protected rules: IGameRules<T>;
  protected output: IOutputAdapter;
  protected history: GameState<T>[] = [];
  protected moveHistory: { playerId: string; move: any }[] = [];

  constructor(
    rules: IGameRules<T>,
    output: IOutputAdapter,
    initialDeck?: Deck<T>
  ) {
    this.gameState = new GameState<T>(initialDeck);
    this.rules = rules;
    this.output = output;
  }

  /**
   * Adds a player to the game
   */
  addPlayer(player: Player): this {
    this.gameState.addPlayer(player);
    return this;
  }

  /**
   * Starts the game
   */
  start(): void {
    // Save initial state
    this.saveState();

    // Initialize the game according to the rules
    this.rules.initializeGame(this.gameState);

    // Render the initial game state
    this.output.renderGameState(this);
  }

  /**
   * Executes a player's move
   */
  playMove(playerId: string, move: any): boolean {
    const player = this.gameState.getPlayerById(playerId);

    if (!player) {
      this.output.showError(`Player with ID ${playerId} not found`);
      return false;
    }

    // Check if it's the player's turn
    if (playerId !== this.rules.getCurrentPlayerId(this.gameState)) {
      this.output.showError(`It's not ${player.name}'s turn`);
      return false;
    }

    // Validate the move
    if (!this.rules.validateMove(this.gameState, player, move)) {
      this.output.showError(`Invalid move by ${player.name}`);
      return false;
    }

    // Save the current state before applying the move
    this.saveState();

    // Apply the move
    this.rules.applyMove(this.gameState, player, move);

    // Record the move
    this.moveHistory.push({ playerId, move });

    // Check if the game is over
    if (this.rules.isGameOver(this.gameState)) {
      const winners = this.rules.getWinners(this.gameState);
      this.output.showGameOver(
        winners.map((id) => this.gameState.getPlayerById(id)!)
      );
    } else {
      // Move to the next player's turn
      this.rules.nextTurn(this.gameState);

      // Render the updated game state
      this.output.renderGameState(this);
    }

    return true;
  }

  /**
   * Gets the current game state
   */
  getGameState(): GameState<T> {
    return this.gameState;
  }

  /**
   * Gets the current player
   */
  getCurrentPlayer(): Player | undefined {
    const currentPlayerId = this.rules.getCurrentPlayerId(this.gameState);
    return this.gameState.getPlayerById(currentPlayerId);
  }

  /**
   * Gets all players
   */
  getPlayers(): Player[] {
    return [...this.gameState.players];
  }

  /**
   * Saves the current game state to history
   */
  protected saveState(): void {
    this.history.push(this.gameState.clone());
  }

  /**
   * Undoes the last move
   */
  undo(): boolean {
    if (this.history.length <= 1) {
      this.output.showError("No moves to undo");
      return false;
    }

    // Remove the current state and the last move
    this.history.pop();
    this.moveHistory.pop();

    // Restore the previous state
    this.gameState = this.history[this.history.length - 1].clone();

    // Render the updated game state
    this.output.renderGameState(this);

    return true;
  }

  /**
   * Restarts the game
   */
  restart(): void {
    if (this.history.length === 0) {
      this.output.showError("No game to restart");
      return;
    }

    // Restore the initial state
    this.gameState = this.history[0].clone();

    // Clear history except for the initial state
    this.history = [this.history[0]];
    this.moveHistory = [];

    // Render the updated game state
    this.output.renderGameState(this);
  }
}
