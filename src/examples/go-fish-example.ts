import { Player, GoFishGame } from "../index";

/**
 * Example of using the Go Fish card game
 *
 * This demonstrates how to create a Go Fish game, add players, and play it
 */
async function runGoFishExample() {
  console.log("Starting Go Fish card game example");

  // Create a new Go Fish game
  const game = new GoFishGame();

  // Add players
  game.addPlayer(new Player("p1", "Alice"));
  game.addPlayer(new Player("p2", "Bob"));
  game.addPlayer(new Player("p3", "Charlie"));

  // Start the game
  game.start();

  // Play the game automatically with AI players
  await game.autoPlay(20);

  console.log("Go Fish game example completed");
}

// Run the example
runGoFishExample().catch(console.error);
