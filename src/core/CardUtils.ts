import { ICard, Card } from "./Card";
import { Deck } from "./Deck";

/**
 * Utility functions for card games
 */
export class CardUtils {
  /**
   * Creates a standard 52-card deck
   */
  static createStandardDeck(): Deck<Card> {
    const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const ranks = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    const cards: Card[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        const id = `${rank}-${suit}`;
        const name = `${rank} of ${suit}`;
        cards.push(new Card(id, name));
      }
    }

    return new Deck<Card>(cards);
  }

  /**
   * Creates a custom deck from the provided card definitions
   */
  static createCustomDeck(
    cardDefinitions: { id: string; name: string; isFaceUp?: boolean }[]
  ): Deck<Card> {
    const cards = cardDefinitions.map(
      (def) => new Card(def.id, def.name, def.isFaceUp ?? false)
    );
    return new Deck<Card>(cards);
  }

  /**
   * Deals cards to players
   */
  static dealCards<T extends ICard>(
    deck: Deck<T>,
    players: { id: string; hand: { addCards: (cards: T[]) => void } }[],
    cardsPerPlayer: number,
    dealOneAtATime: boolean = true
  ): void {
    if (dealOneAtATime) {
      // Deal one card at a time to each player
      for (let i = 0; i < cardsPerPlayer; i++) {
        for (const player of players) {
          const card = deck.draw(1);
          if (card.length > 0) {
            player.hand.addCards(card);
          }
        }
      }
    } else {
      // Deal all cards at once to each player
      for (const player of players) {
        const cards = deck.draw(cardsPerPlayer);
        player.hand.addCards(cards);
      }
    }
  }

  /**
   * Determines the rank of a card (for standard playing cards)
   */
  static getCardRank(card: ICard): number {
    const rankMap: Record<string, number> = {
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      "10": 10,
      J: 11,
      Q: 12,
      K: 13,
      A: 14,
    };

    // Extract the rank from the card ID (assuming format like "A-Hearts")
    const rank = card.id.split("-")[0];
    return rankMap[rank] || 0;
  }

  /**
   * Determines the suit of a card (for standard playing cards)
   */
  static getCardSuit(card: ICard): string {
    // Extract the suit from the card ID (assuming format like "A-Hearts")
    return card.id.split("-")[1] || "";
  }

  /**
   * Compares two cards by rank
   * Returns positive if card1 > card2, negative if card1 < card2, 0 if equal
   */
  static compareCardsByRank(card1: ICard, card2: ICard): number {
    return CardUtils.getCardRank(card1) - CardUtils.getCardRank(card2);
  }

  /**
   * Groups cards by suit
   */
  static groupCardsBySuit(cards: ICard[]): Record<string, ICard[]> {
    const result: Record<string, ICard[]> = {};

    for (const card of cards) {
      const suit = CardUtils.getCardSuit(card);
      if (!result[suit]) {
        result[suit] = [];
      }
      result[suit].push(card);
    }

    return result;
  }

  /**
   * Groups cards by rank
   */
  static groupCardsByRank(cards: ICard[]): Record<string, ICard[]> {
    const result: Record<string, ICard[]> = {};

    for (const card of cards) {
      const rank = card.id.split("-")[0];
      if (!result[rank]) {
        result[rank] = [];
      }
      result[rank].push(card);
    }

    return result;
  }
}
