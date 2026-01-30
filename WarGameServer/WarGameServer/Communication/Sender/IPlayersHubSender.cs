using WarGameServer.Communication.Messages;

namespace WarGameServer.Communication.Sender
{
    public interface IPlayersHubSender
    {
        Task SendMessageAsync(string connectionId, PlayerOutgoingMessage msg);
        Task SendMessageToAllInGroupAsync(string group, PlayerOutgoingMessage msg);
    }
}
