import { IOutputAdapter } from "./OutputAdapter";
import { Player } from "./Player";
import { BaseGame } from "./BaseGame";
import { GameState } from "./GameState";
import { ICard } from "./Card";
import * as readline from "readline";

/**
 * Command Line Interface adapter for rendering games in the console
 */
export class CLIAdapter implements IOutputAdapter {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Renders the current game state to the console
   */
  renderGameState(game: BaseGame): void {
    console.clear();
    console.log("=".repeat(50));
    console.log("Game State:");
    console.log("=".repeat(50));

    const gameState = game.getGameState() as GameState<ICard>;

    // Display deck information
    console.log(`\nDeck: ${gameState.deck.size()} cards remaining`);
    console.log(`Discard Pile: ${gameState.discardPile.size()} cards`);

    // Display current player
    const currentPlayer = game.getCurrentPlayer();
    if (currentPlayer) {
      console.log(
        `\nCurrent Player: ${currentPlayer.name} (ID: ${currentPlayer.id})`
      );
      console.log(`Score: ${currentPlayer.score}`);
    }

    // Display all players and their hands
    console.log("\nPlayers:");
    for (const player of game.getPlayers()) {
      console.log(`- ${player.name} (ID: ${player.id})`);
      console.log(`  Score: ${player.score}`);
      console.log(`  Hand: ${player.hand.size()} cards`);

      // Show cards if they're face up or if it's the current player
      const cards = player.hand.getCards();
      if (cards.length > 0) {
        const cardStrings = cards.map((card) => {
          if (
            card.isFaceUp ||
            (currentPlayer && player.id === currentPlayer.id)
          ) {
            return card.name;
          } else {
            return "[Hidden Card]";
          }
        });
        console.log(`  Cards: ${cardStrings.join(", ")}`);
      }
    }

    // Display custom state if any
    if (Object.keys(gameState.customState).length > 0) {
      console.log("\nGame-Specific State:");
      for (const [key, value] of Object.entries(gameState.customState)) {
        console.log(`- ${key}: ${JSON.stringify(value)}`);
      }
    }

    console.log("\n" + "=".repeat(50));
  }

  /**
   * Shows an error message
   */
  showError(message: string): void {
    console.error(`\nERROR: ${message}`);
  }

  /**
   * Shows the game over screen with winners
   */
  showGameOver(winners: Player[]): void {
    console.log("\n" + "*".repeat(50));
    console.log("GAME OVER");

    if (winners.length === 0) {
      console.log("No winners!");
    } else if (winners.length === 1) {
      console.log(`Winner: ${winners[0].name} with score ${winners[0].score}`);
    } else {
      console.log("It's a tie between:");
      for (const winner of winners) {
        console.log(`- ${winner.name} with score ${winner.score}`);
      }
    }

    console.log("*".repeat(50));
  }

  /**
   * Shows a message to the player
   */
  showMessage(message: string): void {
    console.log(`\n${message}`);
  }

  /**
   * Prompts the player for input
   */
  async promptInput(message: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.rl.question(`\n${message}: `, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Prompts the player to select from a list of options
   */
  async promptSelect(message: string, options: string[]): Promise<number> {
    console.log(`\n${message}:`);

    for (let i = 0; i < options.length; i++) {
      console.log(`${i + 1}. ${options[i]}`);
    }

    const answer = await this.promptInput("Enter your choice (number)");
    const choice = parseInt(answer, 10) - 1;

    if (isNaN(choice) || choice < 0 || choice >= options.length) {
      this.showError("Invalid choice. Please try again.");
      return this.promptSelect(message, options);
    }

    return choice;
  }

  /**
   * Closes the readline interface
   */
  close(): void {
    this.rl.close();
  }
}
