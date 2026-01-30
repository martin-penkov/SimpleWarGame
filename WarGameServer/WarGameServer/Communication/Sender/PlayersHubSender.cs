using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using WarGameServer.Communication.Messages;
using WarGameServer.Hubs;

namespace WarGameServer.Communication.Sender
{
    public class PlayersHubSender : IPlayersHubSender
    {
        IHubContext<PlayerHub, IPlayer> m_hubContext;

        public PlayersHubSender(IHubContext<PlayerHub, IPlayer> hubContext)
        {
            m_hubContext = hubContext;
        }

        public async Task SendMessageAsync(string connectionId, PlayerOutgoingMessage msg)
        {
            string msgJson = GetOutgoingMessageJson(msg);

            await m_hubContext.Clients.Client(connectionId).Message(msgJson);
        }

        public async Task SendMessageToAllInGroupAsync(string group, PlayerOutgoingMessage msg)
        {
            await m_hubContext.Clients.Group(group).Message(GetOutgoingMessageJson(msg));
        }

        string GetOutgoingMessageJson(PlayerOutgoingMessage msg)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            return JsonSerializer.Serialize(msg, options);
        }
    }
}
