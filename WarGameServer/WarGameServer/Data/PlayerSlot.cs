public class PlayerSlot
{
    public PlayerSlot(int seat, string playerId, string connectionId, string name)
    {
        Seat = seat;
        PlayerId = playerId;
        ConnectionId = connectionId;
        Name = name;
    }

    public int Seat { get; }

    public string PlayerId { get; }

    public string? ConnectionId { get; set; }

    public string Name { get; }

    public PlayerSlot WithConnection(string connectionId) {
        return new PlayerSlot(Seat, PlayerId, connectionId, Name);
    } 
}