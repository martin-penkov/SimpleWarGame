using MediatR;
using Microsoft.AspNetCore.SignalR;
using WarGameServer.Communication.Messages;
using WarGameServer.Communication.Sender;
using WarGameServer.Handlers.Types;
using WarGameServer.Hubs;
using WarGameServer.Services;

namespace WarGameServer.Handlers
{
    public class RevealHandler : IRequestHandler<RReveal>
    {
        private readonly IGameService _gameService;
        private readonly IPlayersHubSender _sender;

        public RevealHandler(IGameService gameService, IPlayersHubSender sender)
        {
            _gameService = gameService;
            _sender = sender;
        }

        public async Task Handle(RReveal request, CancellationToken ct)
        {
            RevealResult? reveal = _gameService.ReadyUp(request.ConnectionId);
            if (reveal == null) return;

            if (reveal.IsWaiting)
            {
                await _sender.SendMessageToAllInGroupAsync(reveal.GameId, new PlayerOutgoingMessage
                {
                    Type = PlayerOutgoingMessageType.PlayerReady,
                    Data = new
                    {
                        PlayerSeat = reveal.WaitingSeat
                    }
                });
                return;
            }

            if (reveal.IsFinished && reveal.Player1Card == null && reveal.Player2Card == null)
            {
                await _sender.SendMessageToAllInGroupAsync(reveal.GameId, new PlayerOutgoingMessage
                {
                    Type = PlayerOutgoingMessageType.GameFinished,
                    Data = new
                    {
                        GameId = reveal.GameId,
                        WinnerSeat = reveal.GameWinner ?? reveal.WinnerSeat
                    }
                });
                return;
            }

            await _sender.SendMessageToAllInGroupAsync(reveal.GameId, new PlayerOutgoingMessage
            {
                Type = PlayerOutgoingMessageType.RoundRevealed,
                Data = new
                {
                    gameId = reveal.GameId,
                    round = reveal.Round,
                    player1Card = reveal.Player1Card,
                    player2Card = reveal.Player2Card,
                    winnerSeat = reveal.WinnerSeat,
                    player1DeckCount = reveal.RemainingPlayer1,
                    player2DeckCount = reveal.RemainingPlayer2,
                }
            });

            if (reveal.IsFinished)
            {
                await Task.Delay(2500); // for frontend needs...
                await _sender.SendMessageToAllInGroupAsync(reveal.GameId, new PlayerOutgoingMessage
                {
                    Type = PlayerOutgoingMessageType.GameFinished,
                    Data = new
                    {
                        GameId = reveal.GameId,
                        WinnerSeat = reveal.GameWinner
                    }
                });
            }
        }
    }
}
