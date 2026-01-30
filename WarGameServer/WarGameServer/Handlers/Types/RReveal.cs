using MediatR;

namespace WarGameServer.Handlers.Types
{
    public class RReveal : IRequest
    {
        public string ConnectionId { get; set; }
    }
}
