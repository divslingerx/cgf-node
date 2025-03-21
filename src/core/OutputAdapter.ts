import { Player } from "./Player";

/**
 * Interface for output adapters
 * This allows the game to be rendered in different ways (CLI, GUI, etc.)
 */
export interface IOutputAdapter {
  /**
   * Renders the current game state
   */
  renderGameState(game: any): void;

  /**
   * Shows an error message
   */
  showError(message: string): void;

  /**
   * Shows the game over screen with winners
   */
  showGameOver(winners: Player[]): void;

  /**
   * Shows a message to the player
   */
  showMessage(message: string): void;

  /**
   * Prompts the player for input
   * Returns a promise that resolves with the player's input
   */
  promptInput(message: string): Promise<string>;

  /**
   * Prompts the player to select from a list of options
   * Returns a promise that resolves with the index of the selected option
   */
  promptSelect(message: string, options: string[]): Promise<number>;
}
