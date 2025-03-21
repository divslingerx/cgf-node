import {
  BaseGame,
  Card,
  CLIAdapter,
  CardUtils,
  IOutputAdapter,
} from "../../core";
import { WarRules } from "./WarRules";

/**
 * Implementation of the War card game
 */
export class WarGame extends BaseGame<Card> {
  constructor(output: IOutputAdapter = new CLIAdapter()) {
    // Create a standard deck of cards
    const deck = CardUtils.createStandardDeck();

    // Create the rules
    const rules = new WarRules();

    // Initialize the game
    super(rules, output, deck);
  }

  /**
   * Play a turn in the War game
   */
  async playTurn(): Promise<boolean> {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      this.output.showError("No current player");
      return false;
    }

    // In War, the only valid move is "play"
    return this.playMove(currentPlayer.id, "play");
  }

  /**
   * Play the War game automatically until completion
   */
  async autoPlay(maxTurns: number = 1000): Promise<void> {
    let turnCount = 0;

    while (
      !this.getGameState().getCustomState<boolean>("gameOver", false) &&
      turnCount < maxTurns
    ) {
      await this.playTurn();
      turnCount++;

      // Add a small delay to make it easier to follow
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (turnCount >= maxTurns) {
      this.output.showMessage(`Game stopped after ${maxTurns} turns`);
    }
  }
}
