using MediatR;

namespace WarGameServer.Requests.Types
{
    public class RJoinOrReconnect : IRequest
    {
        public string PlayerName { get; set; }

        public string ConnectionId { get; set; }
    }
}
