# War Game Implementation

## Features
- Multiple game instances running on the server
- In-memory only game state
- Automatic game start and seat/spot filling upon client connect
- Timebank support

---

## Frontend Setup

**Requirements**
- Node.js version **20.19.1** (or similar)

- In Config file in WarGame/src/Config.ts  edit the backend host url

**Run**
```bash
npm install
npm start
```

## Backend Setup

### Configuration
Edit the game configuration in `appsettings.Development.json`:

Default configuration is:
```json
{
  "MaxRoundsBeforeWinner": null,
  "TimebankSeconds": 300
}
```

To run use:
dotnet run