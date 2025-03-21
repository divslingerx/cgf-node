import { Command } from "commander";
import chalk from "chalk";
import { Player } from "./Player";
import { BaseGame } from "./BaseGame";
import { CLIAdapter } from "./CLIAdapter";
import { Card } from "./Card";
import * as readline from "readline";

/**
 * CLI interface for the card game framework
 * Provides a command-line interface for setting up and playing card games
 */
export class CLI {
  private program: Command;
  private players: Player[] = [];
  private gameRegistry: Map<string, new (...args: any[]) => BaseGame<Card>> =
    new Map();
  private rl: readline.Interface;

  constructor() {
    this.program = new Command();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.setupProgram();
  }

  /**
   * Register a game with the CLI
   * @param name The name of the game
   * @param gameClass The game class constructor
   */
  registerGame(
    name: string,
    gameClass: new (...args: any[]) => BaseGame<Card>
  ): this {
    this.gameRegistry.set(name, gameClass);
    return this;
  }

  /**
   * Set up the command-line program
   */
  private setupProgram(): void {
    this.program
      .name("card-game-framework")
      .description("A flexible framework for playing card games")
      .version("1.0.0");

    this.program
      .command("play")
      .description("Play a card game")
      .action(() => this.playGame());

    this.program
      .command("list")
      .description("List available games")
      .action(() => this.listGames());
  }

  /**
   * Parse command-line arguments and run the program
   */
  parse(args: string[]): void {
    this.program.parse(args);
  }

  /**
   * List available games
   */
  private listGames(): void {
    console.log(chalk.bold("Available Games:"));
    if (this.gameRegistry.size === 0) {
      console.log(
        chalk.yellow(
          "  No games registered. Register games using the registerGame method."
        )
      );
      return;
    }

    // Use Array.from to convert Map keys to an array for iteration
    Array.from(this.gameRegistry.keys()).forEach((name) => {
      console.log(`  ${chalk.green("•")} ${name}`);
    });
  }

  /**
   * Play a game
   */
  private async playGame(): Promise<void> {
    if (this.gameRegistry.size === 0) {
      console.log(
        chalk.red(
          "No games registered. Register games using the registerGame method."
        )
      );
      this.rl.close();
      return;
    }

    // Set up players
    await this.setupPlayers();

    // Select a game
    const gameName = await this.selectGame();
    if (!gameName) {
      this.rl.close();
      return;
    }

    const GameClass = this.gameRegistry.get(gameName)!;
    const game = new GameClass(new CLIAdapter());

    // Add players to the game
    for (const player of this.players) {
      game.addPlayer(player);
    }

    console.log(chalk.bold(`\nStarting ${chalk.green(gameName)}...`));

    // Start the game
    game.start();

    // Play the game based on player types
    const hasHumanPlayers = this.players.some((p) => !p.id.startsWith("ai-"));

    if (hasHumanPlayers) {
      // If there are human players, play turns interactively
      await this.playInteractive(game);
    } else {
      // If all players are AI, play automatically
      if ("autoPlay" in game && typeof game.autoPlay === "function") {
        await game.autoPlay(100);
      } else {
        console.log(
          chalk.yellow(
            "This game does not support automatic play with all AI players."
          )
        );
      }
    }

    this.rl.close();
  }

  /**
   * Set up players for the game
   */
  private async setupPlayers(): Promise<void> {
    this.players = [];

    console.log(chalk.bold("\nPlayer Setup:"));

    const numPlayers = await this.promptNumber("How many players? (2-6)", 2, 6);

    for (let i = 0; i < numPlayers; i++) {
      const playerType = await this.promptSelect(`Player ${i + 1} type:`, [
        "Human",
        "AI",
      ]);

      if (playerType === 0) {
        // 0 is the index for "Human"
        const name = await this.promptInput(`Enter name for Player ${i + 1}:`);
        this.players.push(
          new Player(`player-${i + 1}`, name || `Player ${i + 1}`)
        );
        console.log(
          chalk.green(`Added human player: ${name || `Player ${i + 1}`}`)
        );
      } else {
        this.players.push(new Player(`ai-${i + 1}`, `AI Player ${i + 1}`));
        console.log(chalk.blue(`Added AI player: AI Player ${i + 1}`));
      }
    }

    console.log(chalk.bold("\nPlayers:"));
    for (const player of this.players) {
      const isAI = player.id.startsWith("ai-");
      console.log(
        `  ${isAI ? chalk.blue("🤖") : chalk.green("👤")} ${player.name}`
      );
    }
  }

  /**
   * Select a game to play
   */
  private async selectGame(): Promise<string | null> {
    console.log(chalk.bold("\nSelect a Game:"));

    const gameNames = Array.from(this.gameRegistry.keys());

    if (gameNames.length === 0) {
      console.log(chalk.red("No games available."));
      return null;
    }

    const options = gameNames.map((name) => ({ name }));
    const selectedIndex = await this.promptSelect("Choose a game:", gameNames);

    return gameNames[selectedIndex];
  }

  /**
   * Play a game interactively
   */
  private async playInteractive(game: BaseGame<Card>): Promise<void> {
    let gameOver = false;

    while (!gameOver) {
      const currentPlayer = game.getCurrentPlayer();

      if (!currentPlayer) {
        console.log(chalk.red("No current player. Game ending."));
        break;
      }

      const isAI = currentPlayer.id.startsWith("ai-");

      console.log(
        chalk.bold(
          `\n${currentPlayer.name}'s turn ${isAI ? chalk.blue("(AI)") : chalk.green("(Human)")}`
        )
      );

      // We need to use type assertion since BaseGame doesn't define these methods
      // but we know the specific game implementations have them
      if (isAI) {
        // AI player's turn
        if (
          "playAITurn" in game &&
          typeof (game as any).playAITurn === "function"
        ) {
          // If the game has a playAITurn method, use it
          await (game as any).playAITurn(currentPlayer);
        } else if (
          "playTurn" in game &&
          typeof (game as any).playTurn === "function"
        ) {
          // Otherwise, use the standard playTurn method if available
          await (game as any).playTurn();
        } else {
          console.log(
            chalk.yellow("This game doesn't support automatic turns.")
          );
          break;
        }

        // Add a small delay to make it easier to follow
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        // Human player's turn
        if (
          "playTurn" in game &&
          typeof (game as any).playTurn === "function"
        ) {
          await (game as any).playTurn();
        } else {
          console.log(
            chalk.yellow("This game doesn't support interactive turns.")
          );
          break;
        }
      }

      // Check if the game is over
      const gameState = game.getGameState();
      const isGameOver = gameState.getCustomState<boolean>("gameOver", false);
      gameOver = isGameOver === true;

      if (gameOver) {
        console.log(chalk.bold.yellow("\nGame Over!"));
      }
    }
  }

  /**
   * Prompt for input
   */
  private promptInput(message: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.rl.question(`${message} `, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Prompt for a number within a range
   */
  private async promptNumber(
    message: string,
    min: number,
    max: number
  ): Promise<number> {
    while (true) {
      const input = await this.promptInput(message);
      const num = parseInt(input, 10);

      if (!isNaN(num) && num >= min && num <= max) {
        return num;
      }

      console.log(
        chalk.red(`Please enter a number between ${min} and ${max}.`)
      );
    }
  }

  /**
   * Prompt to select from a list of options
   */
  private async promptSelect(
    message: string,
    options: string[]
  ): Promise<number> {
    console.log(`${message}`);

    for (let i = 0; i < options.length; i++) {
      console.log(`  ${chalk.cyan(`${i + 1}.`)} ${options[i]}`);
    }

    while (true) {
      const input = await this.promptInput("Enter your choice (number):");
      const choice = parseInt(input, 10) - 1;

      if (!isNaN(choice) && choice >= 0 && choice < options.length) {
        return choice;
      }

      console.log(
        chalk.red(`Please enter a number between 1 and ${options.length}.`)
      );
    }
  }
}
