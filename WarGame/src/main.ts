import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { EventBus } from "./app/EventBus";
import { Game } from "./app/Game";
import { GameEvent } from "./app/GameEvent";
import { setEngine } from "./app/utils/getEngine";
import { LoadScreen } from "./app/screens/LoadScreen";
import { Communicator } from "./app/communication/Communicator";
import { CreationEngine } from "./engine/engine";
import "@pixi/sound";
import { Config } from "./Config";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // Initialize the creation engine instance
  await engine.init({
    background: "#707070",
    resizeOptions: { minWidth: 768, minHeight: 1024, letterbox: false },
  });
  (globalThis as any).__PIXI_APP__ = engine;

  gsap.registerPlugin(PixiPlugin);
  PixiPlugin.registerPIXI(engine);

  await engine.navigation.showScreen(LoadScreen);

  const eventBus = new EventBus<GameEvent>();
  const communicator = new Communicator(Config.backendUrl, eventBus);
  new Game(communicator, engine, eventBus);
})();
