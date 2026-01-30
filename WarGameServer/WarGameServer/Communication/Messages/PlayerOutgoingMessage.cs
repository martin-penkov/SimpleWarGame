namespace WarGameServer.Communication.Messages
{
    public class PlayerOutgoingMessage
    {
        public PlayerOutgoingMessageType Type { get; set; }

        public object Data { get; set; }
    }
}
