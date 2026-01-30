import { Card, CardRank, CardSuit } from "../data/Card";

export function translateCardToAsset(card: Card): string {
    return `${CardSuitToString[card.suit]}-${CardRankToString[card.rank]}`;
}

export const CardRankToString: Record<CardRank, string> = {
    [CardRank.Two]: "2",
    [CardRank.Three]: "3",
    [CardRank.Four]: "4",
    [CardRank.Five]: "5",
    [CardRank.Six]: "6",
    [CardRank.Seven]: "7",
    [CardRank.Eight]: "8",
    [CardRank.Nine]: "9",
    [CardRank.Ten]: "10",
    [CardRank.Jack]: "11",
    [CardRank.Queen]: "12",
    [CardRank.King]: "13",
    [CardRank.Ace]: "ace",
};

export const CardSuitToString: Record<CardSuit, string> = {
    [CardSuit.Hearts]: "hearts",
    [CardSuit.Spades]: "spades",
    [CardSuit.Clubs]: "clubs",
    [CardSuit.Diamonds]: "diamonds",
};