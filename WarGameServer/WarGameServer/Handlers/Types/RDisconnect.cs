using MediatR;

namespace WarGameServer.Handlers.Types
{
    public class RDisconnect : IRequest
    {
        public string ConnectionId { get; set; }
    }
}
