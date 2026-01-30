using MediatR;
using Microsoft.AspNetCore.SignalR;
using WarGameServer.Handlers.Types;
using WarGameServer.Requests.Types;

namespace WarGameServer.Hubs
{
    public class PlayerHub : Hub<IPlayer>
    {
        private readonly IMediator _mediator;

        public PlayerHub(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task JoinOrReconnect(string playerName)
        {
            await _mediator.Send(new RJoinOrReconnect { 
                PlayerName = playerName, 
                ConnectionId = Context.ConnectionId 
            });
        }

        public async Task Reveal()
        {
            await _mediator.Send(new RReveal
            {
                ConnectionId = Context.ConnectionId
            });
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await _mediator.Send(new RDisconnect
            {
                ConnectionId = Context.ConnectionId
            });

            await base.OnDisconnectedAsync(exception);
        }
    }
}
