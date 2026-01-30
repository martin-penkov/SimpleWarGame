using MediatR;
using Microsoft.AspNetCore.SignalR;
using WarGameServer.Communication.Messages;
using WarGameServer.Communication.Sender;
using WarGameServer.Hubs;
using WarGameServer.Requests.Types;
using WarGameServer.Services;

public class JoinOrReconnectHandler : IRequestHandler<RJoinOrReconnect>
{
    private readonly IGameService _gameService;
    private readonly IPlayersHubSender _sender;
    private readonly IHubContext<PlayerHub, IPlayer> _hub;

    public JoinOrReconnectHandler(IGameService gameService, IPlayersHubSender sender, IHubContext<PlayerHub, IPlayer> hub)
    {
        _gameService = gameService;
        _sender = sender;
        _hub = hub;
    }

    public async Task Handle(RJoinOrReconnect request, CancellationToken ct)
    {
        JoinResult? result = _gameService.JoinOrReconnect(request.PlayerName, request.ConnectionId, request.PlayerName);

        if (result == null) return;

        await _hub.Groups.AddToGroupAsync(request.ConnectionId, result.GameInstanceId, ct);

        if (result.IsResume)
        {
            await _sender.SendMessageAsync(request.ConnectionId, new PlayerOutgoingMessage
            {
                Type = PlayerOutgoingMessageType.Resume,
                Data = result
            });
        }
        else if (result.IsWaitingForOpponent)
        {
            await _sender.SendMessageAsync(request.ConnectionId, new PlayerOutgoingMessage
            {
                Type = PlayerOutgoingMessageType.Join,
                Data = result
            });
        }

        if (result.StartedNow)
        {
            await _sender.SendMessageAsync(request.ConnectionId, new PlayerOutgoingMessage
            {
                Type = PlayerOutgoingMessageType.Join,
                Data = result
            });

            await _sender.SendMessageToAllInGroupAsync(result.GameInstanceId, new PlayerOutgoingMessage
            {
                Type = PlayerOutgoingMessageType.GameStarted,
                Data = new
                {
                    GameInstanceId = result.GameInstanceId,
                    Player1DeckCount = result.Player1DeckCount,
                    Player2DeckCount = result.Player2DeckCount,
                    Player1Name = result.Player1Name,
                    Player2Name = result.Player2Name,
                    CurrentRoundProgress = result.CurrentRoundProgress
                }
            });
        }
    }
}