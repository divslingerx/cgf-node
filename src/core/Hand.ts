import { ICard } from "./Card";

/**
 * Represents a player's hand of cards
 */
export class Hand<T extends ICard> {
  private cards: T[] = [];

  constructor(initialCards: T[] = []) {
    this.cards = [...initialCards];
  }

  /**
   * Adds cards to the hand
   */
  addCards(cards: T[]): this {
    this.cards.push(...cards);
    return this;
  }

  /**
   * Adds a single card to the hand
   */
  addCard(card: T): this {
    this.cards.push(card);
    return this;
  }

  /**
   * Removes a card from the hand by ID
   */
  removeCard(cardId: string): T | undefined {
    const index = this.cards.findIndex((card) => card.id === cardId);
    if (index !== -1) {
      return this.cards.splice(index, 1)[0];
    }
    return undefined;
  }

  /**
   * Removes cards from the hand by ID
   */
  removeCards(cardIds: string[]): T[] {
    const removedCards: T[] = [];

    // Create a set for faster lookups
    const idSet = new Set(cardIds);

    // Find all cards to remove
    const remainingCards: T[] = [];
    for (const card of this.cards) {
      if (idSet.has(card.id)) {
        removedCards.push(card);
      } else {
        remainingCards.push(card);
      }
    }

    // Update the hand
    this.cards = remainingCards;

    return removedCards;
  }

  /**
   * Returns all cards in the hand
   */
  getCards(): T[] {
    return [...this.cards]; // Return a copy to prevent direct manipulation
  }

  /**
   * Returns a card by ID
   */
  getCard(cardId: string): T | undefined {
    return this.cards.find((card) => card.id === cardId);
  }

  /**
   * Returns cards that match a predicate function
   */
  getCardsByPredicate(predicate: (card: T) => boolean): T[] {
    return this.cards.filter(predicate);
  }

  /**
   * Returns the number of cards in the hand
   */
  size(): number {
    return this.cards.length;
  }

  /**
   * Checks if the hand is empty
   */
  isEmpty(): boolean {
    return this.cards.length === 0;
  }

  /**
   * Checks if the hand contains a card with the given ID
   */
  hasCard(cardId: string): boolean {
    return this.cards.some((card) => card.id === cardId);
  }

  /**
   * Clears all cards from the hand
   */
  clear(): T[] {
    const cards = [...this.cards];
    this.cards = [];
    return cards;
  }
}
