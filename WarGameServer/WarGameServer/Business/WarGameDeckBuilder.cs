using WarGameServer.Data;

namespace WarGameServer.Business
{
    public static class WarGameDeckBuilder
    {
        public static (Queue<Card> Player1, Queue<Card> Player2) CreatePlayerDecks(Random rng)
        {
            List<Card> deck = BuildDeck();
            Shuffle(deck, rng);

            return (
                new Queue<Card>(deck.Take(26)),
                new Queue<Card>(deck.Skip(26).Take(26))
            );
        }

        private static List<Card> BuildDeck()
        {
            var deck = new List<Card>(52);

            CardRank[] ranks =
            {
                CardRank.Two,
                CardRank.Three,
                CardRank.Four,
                CardRank.Five,
                CardRank.Six,
                CardRank.Seven,
                CardRank.Eight,
                CardRank.Nine,
                CardRank.Ten,
                CardRank.Jack,
                CardRank.Queen,
                CardRank.King,
                CardRank.Ace
            };

            foreach (CardSuit suit in Enum.GetValues(typeof(CardSuit)))
            {
                foreach (CardRank rank in ranks)
                {
                    deck.Add(new Card { Rank = rank, Suit = suit });
                }
            }

            return deck;
        }

        private static void Shuffle<T>(IList<T> list, Random rng)
        {
            for (int i = list.Count - 1; i > 0; i--)
            {
                int swapIndex = rng.Next(i + 1);
                (list[i], list[swapIndex]) = (list[swapIndex], list[i]);
            }
        }
    }
}
