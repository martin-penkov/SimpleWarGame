namespace WarGameServer.Data
{
    public class DrawnRoundResult
    {
        public Card Card1 { get; set; }
        public Card Card2 { get; set; }
        public int Round { get; set; }
        public WinnerSeat WinnerSeat { get; set; }

        public DrawnRoundResult(Card card1, Card card2, int round, WinnerSeat winnerSeat)
        {
            Card1 = card1;
            Card2 = card2;
            Round = round;
            WinnerSeat = winnerSeat;
        }
    }
}
