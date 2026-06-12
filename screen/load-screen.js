import { LayoutContainer, LayoutView } from "@pixi/layout/components";
import { texturesInit } from "../utils/pixi-utils.js";
import { Assets, Container, Graphics, Sprite } from "pixi.js";
import gsap from "gsap";

export const createLoadScreen = async (app) => {
  const loadTextures = await texturesInit("load-screen");

  const containerLoadView = new LayoutContainer({
    label: "containerLoadView",
    parent: app.stage,
    layout: {
      position: "absolute",
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#0f0f0f",
    },
  });

  const containerLoad = new Container({
    label: "containerLoad",
    parent: containerLoadView,
    layout: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      aspectRatio: 1,
      maxWidth: 350,
      maxHeight: 350,
      height: "80%",
      minWidth: 100,
      minHeight: 100,
    },
  });

  const spriteLoadLogo = new Sprite({
    label: "spriteLoadLogo",
    texture: loadTextures.logo,
  });

  const containerSpriteLoadLogo = new LayoutView({
    parent: containerLoad,
    slot: spriteLoadLogo,
    label: "containerSpriteLoadLogo",
    zIndex: 2,
    layout: {
      justifyContent: "center",
      alignItems: "center",
      objectFit: "contain",
      width: "100%",
      height: "100%",
    },
  });

  gsap.fromTo(
    spriteLoadLogo,
    {
      alpha: 0,
      scale: 0,
      angle: -360,
    },
    {
      alpha: 1,
      scale: 1,
      angle: 0,
      duration: 1,
      ease: "back.out(1.7)",
      onComplete: () => {
        gsap.to(spriteLoadLogo, {
          pixi: { scale: "+=0.1" },
          yoyo: true,
          repeat: -1,
          duration: 1.75,
          ease: "sine.inOut",
        });
      },
    },
  );

  const containerGraphicsLoadSpinner = new Container({
    label: "containerGraphicsLoadSpinner",
    parent: containerLoad,
    zIndex: 1,
    layout: {},
  });

  const graphicsLoadSpinner = new Graphics({
    parent: containerGraphicsLoadSpinner,
    label: "graphicsLoadSpinner",
  })
    .moveTo(30, 0)
    .arc(0, 0, 30, 0, Math.PI * 1.2)
    .stroke({ width: 6, color: "#b6b6b6ff" });

  gsap.to(graphicsLoadSpinner, {
    rotation: "+=6",
    repeat: -1,
    ease: "none",
  });

  return { logo: loadTextures.logo };
};
