export type Card = {
    rank: CardRank;
    suit: CardSuit;
}

export enum CardRank {
    Ace,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Joker
}

export enum CardSuit {
    Hearts,
    Spades,
    Clubs,
    Diamonds
}