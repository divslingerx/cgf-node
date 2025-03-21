/**
 * Interface for card objects in the game framework
 */
export interface ICard {
  id: string;
  name: string;
  // Visibility might be controlled per player in a real game
  isFaceUp: boolean;
}

/**
 * Basic implementation of a card
 */
export class Card implements ICard {
  constructor(
    public id: string,
    public name: string,
    public isFaceUp: boolean = false
  ) {}

  /**
   * Flips the card (changes its face-up state)
   */
  flip(): this {
    this.isFaceUp = !this.isFaceUp;
    return this;
  }

  /**
   * Creates a copy of this card
   */
  clone(): Card {
    return new Card(this.id, this.name, this.isFaceUp);
  }
}
