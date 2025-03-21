import { ICard } from "./Card";

/**
 * Represents a deck of cards with common operations like shuffling, drawing, etc.
 */
export class Deck<T extends ICard> {
  protected cards: T[];

  constructor(cards: T[] = []) {
    this.cards = [...cards]; // Create a copy of the array
  }

  /**
   * Shuffles the deck using the Fisher-Yates algorithm
   */
  shuffle(): this {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    return this;
  }

  /**
   * Cuts the deck at the specified position
   */
  cut(position: number): this {
    if (position <= 0 || position >= this.cards.length) {
      return this; // No change if position is invalid
    }

    const top = this.cards.slice(0, position);
    const bottom = this.cards.slice(position);
    this.cards = bottom.concat(top);
    return this;
  }

  /**
   * Draws the specified number of cards from the top of the deck
   */
  draw(count: number = 1): T[] {
    const actualCount = Math.min(count, this.cards.length);
    return this.cards.splice(0, actualCount);
  }

  /**
   * Draws a specific card from the deck by ID
   */
  drawSpecific(cardId: string): T | undefined {
    const index = this.cards.findIndex((card) => card.id === cardId);
    if (index !== -1) {
      return this.cards.splice(index, 1)[0];
    }
    return undefined;
  }

  /**
   * Adds a card to the top of the deck
   */
  addToTop(card: T): this {
    this.cards.unshift(card);
    return this;
  }

  /**
   * Adds a card to the bottom of the deck
   */
  addToBottom(card: T): this {
    this.cards.push(card);
    return this;
  }

  /**
   * Removes a card from the top of the deck
   */
  removeFromTop(): T | undefined {
    return this.cards.shift();
  }

  /**
   * Adds multiple cards to the top of the deck
   */
  addMultipleToTop(cards: T[]): this {
    this.cards.unshift(...cards);
    return this;
  }

  /**
   * Adds multiple cards to the bottom of the deck
   */
  addMultipleToBottom(cards: T[]): this {
    this.cards.push(...cards);
    return this;
  }

  /**
   * Returns all cards in the deck
   */
  getCards(): T[] {
    return [...this.cards]; // Return a copy to prevent direct manipulation
  }

  /**
   * Returns the number of cards in the deck
   */
  size(): number {
    return this.cards.length;
  }

  /**
   * Checks if the deck is empty
   */
  isEmpty(): boolean {
    return this.cards.length === 0;
  }
}
