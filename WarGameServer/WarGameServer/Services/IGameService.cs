using WarGameServer.Business;

namespace WarGameServer.Services
{
    public interface IGameService
    {
        JoinResult? JoinOrReconnect(string playerId, string connectionId, string playerName);
        RevealResult? ReadyUp(string connectionId);
        DisconnectResult HandleDisconnect(string connectionId);
        void CleanupInstance(GameInstance instance);
    }
}
