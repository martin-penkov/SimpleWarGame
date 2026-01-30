using WarGameServer.Business;

public class JoinResult
{
    private JoinResult(PlayerSlot slot, bool isWaiting, bool isResume, bool startedNow, int player1DeckCount, int player2DeckCount, string gameInstanceId, string player1Name, string player2Name, int currentRoundProgress)
    {
        Slot = slot;
        IsWaitingForOpponent = isWaiting;
        IsResume = isResume;
        StartedNow = startedNow;
        GameInstanceId = gameInstanceId;
        Player1DeckCount = player1DeckCount;
        Player2DeckCount = player2DeckCount;
        Player1Name = player1Name;
        Player2Name = player2Name;
        CurrentRoundProgress = currentRoundProgress;
    }

    public string GameInstanceId { get; set; }

    public int Player1DeckCount { get; set; }

    public int Player2DeckCount { get; set; }

    public string Player1Name { get; set; }

    public string Player2Name { get; set; }

    public int CurrentRoundProgress { get; set; }

    public PlayerSlot Slot { get; }

    public bool IsWaitingForOpponent { get; }

    public bool IsResume { get; }

    public bool StartedNow { get; }

    public static JoinResult Resume(GameInstance instance, PlayerSlot slot)
    {
        return new JoinResult(slot, false, true, false, instance.Player1DeckCount, instance.Player2DeckCount, instance.Id, instance.Player1?.Name, instance.Player2?.Name, instance.CurrentRound);
    }

    public static JoinResult NewJoin(GameInstance instance, PlayerSlot slot, bool isWaiting)
    {
        bool startedNow = !isWaiting && instance.CurrentRound == 1;
        return new JoinResult(slot, isWaiting, false, startedNow, instance.Player1DeckCount, instance.Player2DeckCount, instance.Id, instance.Player1?.Name, instance.Player2?.Name, instance.CurrentRound);
    }
}