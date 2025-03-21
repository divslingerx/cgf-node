import { ICard } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";

/**
 * Represents the current state of a card game
 * This class holds all the data needed to represent the game at a specific point in time
 */
export class GameState<T extends ICard = ICard> {
  // The main deck of cards
  public deck: Deck<T>;

  // The discard pile
  public discardPile: Deck<T>;

  // Players in the game
  public players: Player[];

  // ID of the current player
  public currentPlayerId: string;

  // Current round number
  public round: number;

  // Custom game-specific state data
  public customState: Record<string, any>;

  constructor(
    deck: Deck<T> = new Deck<T>(),
    players: Player[] = [],
    currentPlayerId: string = "",
    round: number = 1
  ) {
    this.deck = deck;
    this.discardPile = new Deck<T>();
    this.players = [...players];
    this.currentPlayerId = currentPlayerId;
    this.round = round;
    this.customState = {};
  }

  /**
   * Gets a player by ID
   */
  getPlayerById(playerId: string): Player | undefined {
    return this.players.find((player) => player.id === playerId);
  }

  /**
   * Gets the current player
   */
  getCurrentPlayer(): Player | undefined {
    return this.getPlayerById(this.currentPlayerId);
  }

  /**
   * Adds a player to the game
   */
  addPlayer(player: Player): this {
    this.players.push(player);
    // If this is the first player, make them the current player
    if (this.players.length === 1 && !this.currentPlayerId) {
      this.currentPlayerId = player.id;
    }
    return this;
  }

  /**
   * Removes a player from the game
   */
  removePlayer(playerId: string): Player | undefined {
    const index = this.players.findIndex((player) => player.id === playerId);
    if (index !== -1) {
      return this.players.splice(index, 1)[0];
    }
    return undefined;
  }

  /**
   * Creates a deep copy of the game state
   * Useful for implementing undo/redo functionality or for AI simulations
   */
  clone(): GameState<T> {
    const clonedState = new GameState<T>(
      new Deck<T>(this.deck.getCards() as T[]),
      this.players.map((player) => player.clone()),
      this.currentPlayerId,
      this.round
    );

    clonedState.discardPile = new Deck<T>(this.discardPile.getCards() as T[]);
    clonedState.customState = JSON.parse(JSON.stringify(this.customState));

    return clonedState;
  }

  /**
   * Sets a custom state value
   */
  setCustomState(key: string, value: any): this {
    this.customState[key] = value;
    return this;
  }

  /**
   * Gets a custom state value
   */
  getCustomState<V>(key: string, defaultValue?: V): V | undefined {
    return (this.customState[key] as V) ?? defaultValue;
  }
}
