import { Application, Assets } from "pixi.js";

export const formatManifestPaths = (manifest) => {
  const formattedAssets = {
    bundles: manifest.bundles.map((bundle) => ({
      ...bundle,
      assets: Object.keys(bundle.assets).reduce(
        (acc, key) => ({
          ...acc,
          [key]: bundle.assets[key],
        }),
        {},
      ),
    })),
  };

  return formattedAssets;
};

export const formatManifestPathsInit = async (
  ASSETS,
  { resolutions = [1] } = {},
) => {
  const formattedAssets = formatManifestPaths(ASSETS);

  const { resolution } = getResolutionAssets(resolutions);

  await Assets.init({
    manifest: formattedAssets,
    texturePreference: {
      resolution,
    },
  });
};

export const appInit = async ({
  resolution = getResolution(),
  preference = "webgl",
  isDev = false,
} = {}) => {
  const app = new Application();
  const append = document.body;

  if (isDev) {
    window.__PIXI_DEVTOOLS__ = {
      app,
    };
  }

  await app.init({
    resizeTo: window,
    antialias: true,
    resolution,
    autoDensity: true,
    preference,
  });

  append.appendChild(app.canvas);

  return app;
};

export const constsInit = ({ scaler = 3, duration = 1 } = {}) => {
  const SCALER = scaler;
  const DURATION = duration;

  const GAME_STATES = {
    INIT: "INIT",
    START: "START",
    PLAYING: "PLAYING",
    END: "END",
    GAME_OVER: "GAME_OVER",
  };

  const DIFFICULTY_KEYS = {
    EASY: "EASY",
    MEDIUM: "MEDIUM",
    HARD: "HARD",
    HIGH: "HIGH",
    EXTREME: "EXTREME",
  };

  const BREAKPOINTS_KEYS = {
    FULLSCREEN: "FULLSCREEN",
    MOBILE: "MOBILE",
    TABLET: "FULLSCREEN",
  };

  return {
    SCALER,
    DURATION,
    GAME_STATES,
    DIFFICULTY_KEYS,
    BREAKPOINTS_KEYS,
  };
};

export const soundInit = (name, bundle, options = {}) => {
  if (bundle && bundle[name]) {
    Object.assign(bundle[name], options);
    return bundle[name];
  } else
    return {
      play: () => {},
      pause: () => {},
      resume: () => {},
    };
};

export const getResolution = () => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const resolution = Math.min(window.devicePixelRatio, isMobile ? 3 : 2);

  return { resolution };
};

export const getResolutionAssets = (mapResolution) => {
  let { resolution } = getResolution();

  if (mapResolution) {
    const sorted = mapResolution.slice().sort((a, b) => a - b);

    resolution = sorted.reduce((closest, curr) => {
      return Math.abs(curr - resolution) < Math.abs(closest - resolution)
        ? curr
        : closest;
    }, sorted[0]);
  }

  return { resolution };
};

export const assetsInitBackground = (assets) => {
  const assetsName = assets.bundles.map((bundle) => bundle.name);

  Assets.backgroundLoadBundle(assetsName);
};

export const bundleInit = async (bundleName, progressCallback) => {
  const bundle = await Assets.loadBundle(bundleName, progressCallback);

  return bundle;
};

export const texturesInit = async (bundleName, progressCallback) => {
  try {
    const bundle = await bundleInit(bundleName, progressCallback);

    const allTextures = {};

    Object.keys(bundle).forEach((key) => {
      const asset = bundle[key];
      if (asset && asset?.textures) {
        Object.assign(allTextures, asset.textures);
      } else if (asset && asset?.isTexture) {
        Object.assign(allTextures, { [key]: asset });
      }
    });

    return allTextures;
  } catch (error) {
    console.error(`Error load bundle ${bundleName}:`, error);
    throw error;
  }
};

export const fontsInit = async (bundleName = "fonts", progressCallback) => {
  try {
    const bundle = bundleInit(bundleName, progressCallback);
    const { resolution } = getResolution();

    const fontResolution = resolution + 1;

    return {
      bundle,
      fontResolution,
    };
  } catch (error) {
    console.error("Error load fonts bundle:", error);
    throw error;
  }
};
