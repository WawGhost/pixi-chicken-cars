import gsap from "gsap";
import "@pixi/layout";
import { Application, Assets } from "pixi.js";
import { createLoadScreen } from "./screen/load-screen.js";
import {
  assetsInitBackground,
  bundleInit,
  fontsInit,
  formatManifestPaths,
  getResolution,
} from "./utils/pixi-utils.js";
import { INITIAL_VALUES } from "./consts/index.js";
import { createGameScreen } from "./screen/game-screen.js";

gsap.registerPlugin(PixiPlugin);

(async () => {
  const { MANIFEST, TEXT, SETTING } = INITIAL_VALUES;

  const app = new Application();
  const append = document.body;

  window.__PIXI_DEVTOOLS__ = {
    app,
  };

  const resolution = getResolution();

  await app.init({
    resizeTo: window,
    antialias: true,
    autoDensity: true,
    preference: "webgl",
  });

  append.appendChild(app.canvas);

  app.stage.layout = {
    width: app.screen.width,
    height: app.screen.height,
  };

  const resize = () => {
    app.stage.layout = {
      width: app.screen.width,
      height: app.screen.height,
    };
  };

  app.renderer.on("resize", resize);

  await Assets.init({ manifest: MANIFEST });

  const { logo } = await createLoadScreen(app);

  await createGameScreen(app, logo, TEXT, SETTING);
})();
