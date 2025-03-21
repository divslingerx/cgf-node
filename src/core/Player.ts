import { ICard } from "./Card";
import { Hand } from "./Hand";

/**
 * Interface for player objects in the game framework
 */
export interface IPlayer {
  id: string;
  name: string;
  hand: Hand<ICard>;
  score: number;
}

/**
 * Basic implementation of a player
 */
export class Player implements IPlayer {
  public hand: Hand<ICard>;
  public score: number;

  constructor(
    public id: string,
    public name: string,
    initialScore: number = 0
  ) {
    this.hand = new Hand<ICard>();
    this.score = initialScore;
  }

  /**
   * Adds points to the player's score
   */
  addScore(points: number): this {
    this.score += points;
    return this;
  }

  /**
   * Sets the player's score to a specific value
   */
  setScore(score: number): this {
    this.score = score;
    return this;
  }

  /**
   * Returns the player's current score
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Creates a copy of this player
   */
  clone(): Player {
    const player = new Player(this.id, this.name, this.score);
    player.hand = new Hand<ICard>(this.hand.getCards());
    return player;
  }
}
