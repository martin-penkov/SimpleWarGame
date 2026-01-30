using MediatR;
using WarGameServer.Business;
using WarGameServer.Communication.Messages;
using WarGameServer.Communication.Sender;
using WarGameServer.Handlers.Types;
using WarGameServer.Services;

namespace WarGameServer.Handlers
{
    public class DisconnectHandler : IRequestHandler<RDisconnect>
    {
        private readonly IGameService _gameService;
        private readonly IPlayersHubSender _sender;

        public DisconnectHandler(IGameService gameService, IPlayersHubSender sender)
        {
            _gameService = gameService;
            _sender = sender;
        }

        public async Task Handle(RDisconnect request, CancellationToken ct)
        {
            DisconnectResult result = _gameService.HandleDisconnect(request.ConnectionId);
            GameInstance? instance = result.Instance;

            if (instance != null)
            {
                instance.Cancel();

                if (result.OpponentConnectionId != null)
                {
                    await _sender.SendMessageAsync(result.OpponentConnectionId, new PlayerOutgoingMessage
                    {
                        Type = PlayerOutgoingMessageType.OpponentLeft,
                        Data = new { gameId = instance.Id, opponent = result.Slot?.Name ?? "Unknown" }
                    });
                }
            }

        }
    }
}
