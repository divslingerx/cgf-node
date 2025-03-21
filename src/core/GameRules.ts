import { ICard } from "./Card";
import { Player } from "./Player";
import { GameState } from "./GameState";

/**
 * Interface for game rules
 * This defines the contract for implementing rules for specific card games
 */
export interface IGameRules<T extends ICard = ICard> {
  /**
   * Initialize the game state
   */
  initializeGame(gameState: GameState<T>): void;

  /**
   * Validate if a move is legal according to the game rules
   */
  validateMove(gameState: GameState<T>, player: Player, move: any): boolean;

  /**
   * Apply a move to the game state
   */
  applyMove(gameState: GameState<T>, player: Player, move: any): void;

  /**
   * Check if the game is over
   */
  isGameOver(gameState: GameState<T>): boolean;

  /**
   * Get the winner(s) of the game
   * Returns an array of player IDs, empty if no winner yet, multiple if there's a tie
   */
  getWinners(gameState: GameState<T>): string[];

  /**
   * Get the current player's ID
   */
  getCurrentPlayerId(gameState: GameState<T>): string;

  /**
   * Get the next player's ID
   */
  getNextPlayerId(gameState: GameState<T>): string;

  /**
   * Advance to the next player's turn
   */
  nextTurn(gameState: GameState<T>): void;
}
