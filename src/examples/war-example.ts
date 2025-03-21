import { Player, WarGame } from "../index";

/**
 * Example of using the War card game
 *
 * This demonstrates how to create a War game, add players, and play it
 */
async function runWarExample() {
  console.log("Starting War card game example");

  // Create a new War game
  const game = new WarGame();

  // Add two players
  game.addPlayer(new Player("p1", "Alice"));
  game.addPlayer(new Player("p2", "Bob"));

  // Start the game
  game.start();

  // Play the game automatically for a maximum of 100 turns
  await game.autoPlay(1);

  console.log("War game example completed");
}

// Run the example
runWarExample().catch(console.error);
