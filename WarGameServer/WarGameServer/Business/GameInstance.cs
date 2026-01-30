using WarGameServer.Data;

namespace WarGameServer.Business
{
    public class GameInstance
    {
        private readonly Queue<Card> _player1Deck;
        private readonly Queue<Card> _player2Deck;
        private readonly int? _timebankMs;
        private int? _p1TimeRemainingMs;
        private int? _p2TimeRemainingMs;
        private DateTime _lastTimerCheckpoint;
        private readonly int? _maxRoundsBeforeWinner;
        private int _round = 1;
        private bool _p1Ready;
        private bool _p2Ready;

        private GameInstance(string id, Queue<Card> player1Deck, Queue<Card> player2Deck, int? maxRoundsBeforeWinner, int? timebankSeconds)
        {
            Id = id;
            _player1Deck = player1Deck;
            _player2Deck = player2Deck;
            _maxRoundsBeforeWinner = maxRoundsBeforeWinner;
            _timebankMs = timebankSeconds.HasValue ? timebankSeconds.Value * 1000 : null;
            _p1TimeRemainingMs = _timebankMs;
            _p2TimeRemainingMs = _timebankMs;
            _lastTimerCheckpoint = DateTime.UtcNow;
            Cancellation = new CancellationTokenSource();
        }

        public string Id { get; }

        public PlayerSlot? Player1 { get; set; }

        public PlayerSlot? Player2 { get; set; }

        public CancellationTokenSource Cancellation { get; }

        public int CurrentRound => _round;

        public bool IsFull => Player1 != null && Player2 != null;

        public bool IsEmpty => Player1?.ConnectionId == null && Player2?.ConnectionId == null;

        public bool HasCards => _player1Deck.Count > 0 && _player2Deck.Count > 0;

        public IEnumerable<string> PlayerConnectionIds
        {
            get
            {
                if (Player1 != null) yield return Player1.ConnectionId;
                if (Player2 != null) yield return Player2.ConnectionId;
            }
        }

        public int Player1DeckCount => _player1Deck.Count;
        public int Player2DeckCount => _player2Deck.Count;

        public static GameInstance Create(Random rng, int? maxRoundsBeforeWinner, int? timebankSeconds)
        {
            (Queue<Card> player1Deck, Queue<Card> player2Deck) = WarGameDeckBuilder.CreatePlayerDecks(rng);

            return new GameInstance(Guid.NewGuid().ToString("N"), player1Deck, player2Deck, maxRoundsBeforeWinner, timebankSeconds);
        }

        public PlayerSlot AddPlayer(string playerId, string connectionId, string name)
        {
            if (Player1 == null)
            {
                Player1 = new PlayerSlot(1, playerId, connectionId, name);
                if (IsFull && _timebankMs.HasValue) _lastTimerCheckpoint = DateTime.UtcNow;
                return Player1;
            }

            if (Player2 == null)
            {
                Player2 = new PlayerSlot(2, playerId, connectionId, name);
                if (IsFull && _timebankMs.HasValue) _lastTimerCheckpoint = DateTime.UtcNow;
                return Player2;
            }

            throw new InvalidOperationException("Game already has two players.");
        }

        public PlayerSlot? RemovePlayer(string connectionId)
        {
            if (Player1?.ConnectionId == connectionId)
            {
                Player1.ConnectionId = null;
                return Player1;
            }

            if (Player2?.ConnectionId == connectionId)
            {
                Player2.ConnectionId = null;
                return Player2;
            }

            return null;
        }

        public string? GetOpponentConnectionId(string connectionId)
        {
            if (Player1?.ConnectionId == connectionId) return Player2?.ConnectionId;
            if (Player2?.ConnectionId == connectionId) return Player1?.ConnectionId;
            return null;
        }

        public ReadyState SetReady(string connectionId)
        {
            WinnerSeat? timeoutWinner = ConsumeTimebankAndCheckTimeout();
            if (timeoutWinner.HasValue)
            {
                return new ReadyState
                {
                    BothReady = false,
                    ReadyPlayer = null,
                    TimeoutWinner = timeoutWinner
                };
            }

            if (Player1?.ConnectionId == connectionId)
            {
                _p1Ready = true;
                return new ReadyState {
                    BothReady = _p1Ready && _p2Ready,
                    ReadyPlayer = Player1
                };
            }

            if (Player2?.ConnectionId == connectionId)
            {
                _p2Ready = true;
                return new ReadyState
                {
                    BothReady = _p1Ready && _p2Ready,
                    ReadyPlayer = Player2
                };
            }

            throw new InvalidOperationException("Connection not part of game.");
        }

        public void ResetReady()
        {
            _p1Ready = false;
            _p2Ready = false;
            if (_timebankMs.HasValue)
            {
                _lastTimerCheckpoint = DateTime.UtcNow;
            }
        }

        public PlayerSlot? GetByPlayerId(string playerId)
        {
            if (Player1?.PlayerId == playerId) return Player1;
            if (Player2?.PlayerId == playerId) return Player2;
            return null;
        }

        public void ReplaceConnection(string playerId, string newConnectionId)
        {
            if (Player1?.PlayerId == playerId)
            {
                Player1 = Player1.WithConnection(newConnectionId);
                return;
            }

            if (Player2?.PlayerId == playerId)
            {
                Player2 = Player2.WithConnection(newConnectionId);
                return;
            }

            throw new InvalidOperationException("Player not found in this instance.");
        }

        public DrawnRoundResult DrawRound()
        {
            Card card1 = _player1Deck.Dequeue();
            Card card2 = _player2Deck.Dequeue();
            int round = _round++;

            int card1Value = GetCardValue(card1);
            int card2Value = GetCardValue(card2);

            WinnerSeat winnerSeat = WinnerSeat.Tie;
            if (card1Value > card2Value)
            {
                winnerSeat = WinnerSeat.Player1;
                _player1Deck.Enqueue(card1);
                _player1Deck.Enqueue(card2);
            }
            else if (card2Value > card1Value)
            {
                winnerSeat = WinnerSeat.Player2;
                _player2Deck.Enqueue(card2);
                _player2Deck.Enqueue(card1);
            }
            else
            {
                // tie both cards return to the bottom of their decks
                _player1Deck.Enqueue(card1);
                _player2Deck.Enqueue(card2);
            }

            return new DrawnRoundResult(card1, card2, round, winnerSeat);
        }

        public WinnerSeat? HasGameFinished()
        {
            if (Player1DeckCount <= 0)
            {
                return WinnerSeat.Player2;
            }
            else if (Player2DeckCount <= 0)
            {
                return WinnerSeat.Player1;
            }

            if (_maxRoundsBeforeWinner.HasValue)
            {
                int completedRounds = _round - 1;
                if (completedRounds >= _maxRoundsBeforeWinner.Value)
                {
                    if (Player1DeckCount > Player2DeckCount) return WinnerSeat.Player1;
                    if (Player2DeckCount > Player1DeckCount) return WinnerSeat.Player2;
                    return WinnerSeat.Tie;
                }
            }

            return null;
        }

        public void Cancel()
        {
            if (!Cancellation.IsCancellationRequested)
            {
                Cancellation.Cancel();
            }
        }

        private static int GetCardValue(Card card)
        {
            return card.Rank switch
            {
                CardRank.Two => 2,
                CardRank.Three => 3,
                CardRank.Four => 4,
                CardRank.Five => 5,
                CardRank.Six => 6,
                CardRank.Seven => 7,
                CardRank.Eight => 8,
                CardRank.Nine => 9,
                CardRank.Ten => 10,
                CardRank.Jack => 11,
                CardRank.Queen => 12,
                CardRank.King => 13,
                CardRank.Ace => 14,
                _ => 0
            };
        }

        private WinnerSeat? ConsumeTimebankAndCheckTimeout()
        {
            if (!_timebankMs.HasValue)
            {
                return null;
            }

            DateTime now = DateTime.UtcNow;
            int elapsedMs = (int)(now - _lastTimerCheckpoint).TotalMilliseconds;
            _lastTimerCheckpoint = now;

            if (!_p1Ready && _p1TimeRemainingMs.HasValue)
            {
                _p1TimeRemainingMs -= elapsedMs;
            }

            if (!_p2Ready && _p2TimeRemainingMs.HasValue)
            {
                _p2TimeRemainingMs -= elapsedMs;
            }

            bool p1Out = _p1TimeRemainingMs.HasValue && _p1TimeRemainingMs <= 0;
            bool p2Out = _p2TimeRemainingMs.HasValue && _p2TimeRemainingMs <= 0;

            if (p1Out && p2Out) return WinnerSeat.Tie;
            if (p1Out) return WinnerSeat.Player2;
            if (p2Out) return WinnerSeat.Player1;

            return null;
        }
    }
}
