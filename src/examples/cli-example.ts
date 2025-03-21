import { CLI, WarGame, GoFishGame } from "../index";

/**
 * Example of using the CLI interface for the card game framework
 *
 * This demonstrates how to create a CLI interface, register games, and run the CLI
 */
function runCLIExample() {
  console.log("Starting Card Game Framework CLI");

  // Create a new CLI instance
  const cli = new CLI();

  // Register available games
  cli.registerGame("War", WarGame);
  cli.registerGame("Go Fish", GoFishGame);

  // Parse command-line arguments and run the CLI
  // You can run this with:
  // - `npm run cli` (default)
  // - `npm run cli -- list` (to list available games)
  // - `npm run cli -- play` (to play a game)
  cli.parse(process.argv);
}

// Run the example
runCLIExample();
