using WarGameServer.Data;

public class RevealResult
{
    public string GameId { get; init; } = null!;
    public int Round { get; init; }
    public Card? Player1Card { get; init; }
    public Card? Player2Card { get; init; }
    public WinnerSeat WinnerSeat { get; init; }
    public int RemainingPlayer1 { get; init; }
    public int RemainingPlayer2 { get; init; }
    public bool IsFinished { get; init; }
    public bool IsWaiting { get; init; }
    public int? WaitingSeat { get; init; }
    public WinnerSeat? GameWinner { get; init; }

    public static RevealResult Waiting(string gameId, int round, int waitingSeat) =>
        new RevealResult
        {
            GameId = gameId,
            Round = round,
            Player1Card = null,
            Player2Card = null,
            WinnerSeat = 0,
            RemainingPlayer1 = 0,
            RemainingPlayer2 = 0,
            IsFinished = false,
            IsWaiting = true,
            WaitingSeat = waitingSeat,
            GameWinner = null
        };

    public static RevealResult Resolved(
        string gameId,
        int round,
        Card p1Card,
        Card p2Card,
        WinnerSeat winnerSeat,
        int p1Remaining,
        int p2Remaining,
        WinnerSeat? gameWinner)
    {
        return new RevealResult
        {
            GameId = gameId,
            Round = round,
            Player1Card = p1Card,
            Player2Card = p2Card,
            WinnerSeat = winnerSeat,
            RemainingPlayer1 = p1Remaining,
            RemainingPlayer2 = p2Remaining,
            IsFinished = gameWinner != null,
            IsWaiting = false,
            WaitingSeat = null,
            GameWinner = gameWinner
        };
    }
        
}
