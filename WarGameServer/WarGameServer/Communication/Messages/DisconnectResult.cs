using WarGameServer.Business;

public class DisconnectResult
{
    public DisconnectResult(GameInstance? instance, PlayerSlot? slot, string? opponentConnectionId, bool wasWaitingGame)
    {
        Instance = instance;
        Slot = slot;
        OpponentConnectionId = opponentConnectionId;
        WasWaitingGame = wasWaitingGame;
    }

    public GameInstance? Instance { get; }
    public PlayerSlot? Slot { get; }
    public string? OpponentConnectionId { get; }
    public bool WasWaitingGame { get; }
}