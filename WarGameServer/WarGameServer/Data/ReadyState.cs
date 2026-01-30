namespace WarGameServer.Data
{
    public class ReadyState
    {
        public bool BothReady { get; set; }

        public PlayerSlot? ReadyPlayer { get; set; }

        public WinnerSeat? TimeoutWinner { get; set; }
    }
}
