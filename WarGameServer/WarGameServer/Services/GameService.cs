using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Microsoft.Extensions.Options;
using WarGameServer.Business;
using WarGameServer.Data;

namespace WarGameServer.Services
{
    public class GameService : IGameService
    {
        private static readonly object Sync = new object();
        private static readonly Random SharedRandom = new Random();

        private readonly GameSettings _settings;
        private GameInstance? _waitingGame;
        private readonly Dictionary<string, GameInstance> _activeGames = new Dictionary<string, GameInstance>();
        private readonly Dictionary<string, GameInstance> _gameByConnection = new Dictionary<string, GameInstance>();
        private readonly Dictionary<string, GameInstance> _gameByPlayer = new Dictionary<string, GameInstance>();

        public GameService(IOptions<GameSettings> settings)
        {
            _settings = settings.Value;
        }

        public JoinResult? JoinOrReconnect(string playerId, string connectionId, string playerName)
        {
            lock (Sync)
            {
                if (_gameByConnection.ContainsKey(connectionId))
                {
                    return null;
                }

                if (_gameByPlayer.TryGetValue(playerId, out var existing))
                {
                    existing.ReplaceConnection(playerId, connectionId);
                    _gameByConnection[connectionId] = existing;
                    PlayerSlot slotExisting = existing.GetByPlayerId(playerId)!;
                    return JoinResult.Resume(existing, slotExisting);
                }

                if (_waitingGame == null || _waitingGame.IsFull)
                {
                    _waitingGame = GameInstance.Create(SharedRandom, _settings.MaxRoundsBeforeWinner, _settings.TimebankSeconds);
                }

                GameInstance instance = _waitingGame;
                PlayerSlot slot = instance.AddPlayer(playerId, connectionId, playerName);
                _gameByConnection[connectionId] = instance;
                _gameByPlayer[playerId] = instance;

                bool isWaiting = !instance.IsFull;
                if (instance.IsFull)
                {
                    _waitingGame = null;
                    _activeGames[instance.Id] = instance;
                }

                return JoinResult.NewJoin(instance, slot, isWaiting);
            }
        }

        public DisconnectResult HandleDisconnect(string connectionId)
        {
            GameInstance? instance = null;
            PlayerSlot? slot = null;
            string? opponent = null;
            bool wasWaiting = false;

            lock (Sync)
            {
                if (_gameByConnection.TryGetValue(connectionId, out instance))
                {
                    System.Diagnostics.Debug.WriteLine("disconnecting from instance " + instance.Id);
                    slot = instance.RemovePlayer(connectionId);
                    opponent = instance.GetOpponentConnectionId(connectionId);
                    _gameByConnection.Remove(connectionId);

                    if (ReferenceEquals(instance, _waitingGame))
                    {
                        _waitingGame = null;
                        wasWaiting = true;
                    }
                    else if (instance.IsEmpty)
                    {
                        _activeGames.Remove(instance.Id);
                    }
                }
            }

            return new DisconnectResult(instance, slot, opponent, wasWaiting);
        }

        public RevealResult? ReadyUp(string connectionId)
        {
            lock (Sync)
            {
                if (!_gameByConnection.TryGetValue(connectionId, out var instance))
                {
                    return null;
                }

                if (!instance.HasCards) return null;

                ReadyState ready = instance.SetReady(connectionId);

                if (ready.TimeoutWinner.HasValue)
                {
                    WinnerSeat winnerFromTimeout = ready.TimeoutWinner.Value;
                    CleanupInstance(instance);
                    return RevealResult.Resolved(instance.Id, instance.CurrentRound, null, null, winnerFromTimeout, instance.Player1DeckCount, instance.Player2DeckCount, winnerFromTimeout);
                }

                if (!ready.BothReady)
                {
                    return RevealResult.Waiting(instance.Id, instance.CurrentRound, ready.ReadyPlayer.Seat);
                }

                DrawnRoundResult draw = instance.DrawRound();
                instance.ResetReady();

                WinnerSeat? gameWinner = instance.HasGameFinished();

                if (gameWinner != null)
                {
                    CleanupInstance(instance);
                }

                return RevealResult.Resolved(instance.Id, draw.Round, draw.Card1, draw.Card2, draw.WinnerSeat, instance.Player1DeckCount, instance.Player2DeckCount, gameWinner);
            }
        }

        public void CleanupInstance(GameInstance instance)
        {
            lock (Sync)
            {
                _activeGames.Remove(instance.Id);

                foreach (string id in instance.PlayerConnectionIds)
                {
                    _gameByConnection.Remove(id);
                }

                if (instance.Player1 != null) _gameByPlayer.Remove(instance.Player1.PlayerId);
                if (instance.Player2 != null) _gameByPlayer.Remove(instance.Player2.PlayerId);
            }
        }
    }
}