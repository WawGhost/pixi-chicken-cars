import { LayoutContainer, ScrollSpring } from "@pixi/layout/components";
import {
  bundleInit,
  constsInit,
  getResolution,
  soundInit,
  texturesInit,
} from "../utils/pixi-utils.js";
import gsap from "gsap";
import { BitmapText, Container, Sprite, Text } from "pixi.js";
import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { gsapPointerScaleDownUp } from "../utils/animations.js";
import { sound } from "@pixi/sound";

export const createGameScreen = async (app, logo, TEXT, SETTING) => {
  const { DURATION, GAME_STATES, DIFFICULTY_KEYS, SCALER } = constsInit();

  const { resolution } = getResolution();

  const DIFFICULTY_CONFIG = {
    [DIFFICULTY_KEYS.EASY]: {
      text: TEXT.difficulties_easy,
      chance: SETTING.chance.easy,
      multiply: SETTING.multiply.easy,
    },
    [DIFFICULTY_KEYS.MEDIUM]: {
      text: TEXT.difficulties_medium,
      chance: SETTING.chance.medium,
      multiply: SETTING.multiply.medium,
    },
    [DIFFICULTY_KEYS.HARD]: {
      text: TEXT.difficulties_hard,
      chance: SETTING.chance.hard,
      multiply: SETTING.multiply.hard,
    },
    [DIFFICULTY_KEYS.EXTREME]: {
      text: TEXT.difficulties_hardcore,
      chance: SETTING.chance.hardcore,
      multiply: SETTING.multiply.hardcore,
    },
  };
  let currentDiff = DIFFICULTY_CONFIG[DIFFICULTY_KEYS.EASY];

  let gameState = GAME_STATES.INIT;
  let stepCount = 0;
  const textElements = [];

  const soundsBundle = await bundleInit("sounds");

  const soundBg = soundInit("bg", soundsBundle, {
    volume: 0.03,
    autoPlay: true,
    loop: true,
    preload: true,
  });

  const soundButtonClick = soundInit("buttonClick", soundsBundle, {
    volume: 0.07,
  });

  const soundCar1 = soundInit("car1", soundsBundle, {
    volume: 0.07,
  });

  const soundCar2 = soundInit("car2", soundsBundle, {
    volume: 0.07,
  });

  const soundCashout = soundInit("cashout", soundsBundle, {
    volume: 0.07,
  });

  const soundChick = soundInit("chick", soundsBundle, {
    volume: 0.07,
  });

  const soundCrash = soundInit("crash", soundsBundle, {
    volume: 0.07,
  });

  const soundJump = soundInit("jump", soundsBundle, {
    volume: 0.07,
  });

  const soundLose = soundInit("lose", soundsBundle, {
    volume: 0.07,
  });

  const soundWin = soundInit("win", soundsBundle, {
    volume: 0.07,
  });

  if (!SETTING.sound) sound.muteAll();

  soundBg.play();

  const containerLoadView = app.stage.getChildByLabel(
    "containerLoadView",
    true,
  );

  const containerGameView = new LayoutContainer({
    label: "containerGameView",
    parent: app.stage,
    alpha: 0,
    layout: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: "#313131",
    },
  });

  const gameTextures = await texturesInit("game-screen", (progress) => {
    if (progress === 1) {
      const tl = gsap.timeline();

      tl.to(containerGameView, {
        duration: 1,
        alpha: 1,
        delay: 2,
        ease: "power2.out",
      });
    }
  });

  const modalTextures = await texturesInit("modal-screen");

  const fontsBundle = await bundleInit("fonts");

  const containerScreen = new Container({
    label: "containerScreen",
    parent: containerGameView,
    layout: {
      width: "100%",
      height: "100%",
      flexDirection: "column",
    },
  });

  const containerScreenLogo = new LayoutContainer({
    label: "containerScreenLogo",
    parent: containerScreen,
    layout: {
      width: "100%",
      padding: 8,
      paddingLeft: 20,
      minHeight: 48,
      backgroundColor: "#424242",
    },
  });

  const spriteScreenLogo = new Sprite({
    label: "spriteScreenLogo",
    parent: containerScreenLogo,
    texture: logo,
    layout: {
      height: "100%",
      objectPosition: "left",
      objectFit: "contain",
    },
  });

  const steps = TEXT.steps;

  const scroller = new ScrollSpring({
    max: 150,
    damp: 0.2,
    springiness: 0.15,
  });

  const containerScreenGame = new LayoutContainer({
    label: "containerScreenGame",
    parent: containerScreen,
    layout: {
      height: "100%",
      width: "100%",
      overflow: "scroll",
      alignItems: "flex-end",
      flexDirection: "row",
    },
    trackpad: {
      yConstrainPercent: -1,
      xEase: scroller,
    },
  });

  app.ticker.add(() => {
    if (!scroller.done) {
      containerScreenGame.eventMode = "none";
      const position = scroller.update();
      containerScreenGame._trackpad.xAxis.value = position;
    } else {
      containerScreenGame.eventMode = "static";
    }
  });

  const containerScreenBgStart = new LayoutContainer({
    label: "containerScreenBgStart",
    parent: containerScreenGame,
    layout: {
      height: "100%",
      aspectRatio: gameTextures.start_bg.width / gameTextures.start_bg.height,
      flexShrink: 0,
      flexGrow: 1,
    },
  });

  const spriteScreenBgStart = new Sprite({
    label: "spriteScreenBgStart",
    parent: containerScreenBgStart,
    texture: gameTextures.start_bg,
    layout: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
  });

  const containerScreenBgStartLight = new Container({
    label: "containerScreenBgStartLight",
    parent: containerScreenBgStart,
    zIndex: 2,
    layout: {
      position: "absolute",
      height: "100%",
      aspectRatio: gameTextures.light.width / gameTextures.light.height,
    },
  });

  const spriteScreenBgStartLight = new Sprite({
    label: "spriteScreenBgStartLight",
    parent: containerScreenBgStartLight,
    texture: gameTextures.light,
    scale: 1 / SCALER,
    layout: {
      objectFit: "contain",
      width: "100%",
      height: "100%",
    },
  });

  const containerScreenChicken = new Container({
    label: "containerScreenChicken",
    parent: containerScreenGame,
    zIndex: 5,
    layout: {
      position: "absolute",
      height: "100%",
      bottom: "-20%",
      aspectRatio: 0.2,
    },
  });

  const CHICKEN_ANIMATIONS = {
    DEATH: "death",
    IDLE: "idle",
    JUMP: "jump",
    WIN: "win",
  };

  const spineScreenChicken = Spine.from({
    skeleton: "chicken_data",
    atlas: "chicken_atlas",
  });
  spineScreenChicken.label = "spineScreenChicken";
  spineScreenChicken.layout = {
    objectFit: "contain",
    width: "100%",
    height: "100%",
  };
  spineScreenChicken.skeleton.setToSetupPose();
  spineScreenChicken.state.setAnimation(0, CHICKEN_ANIMATIONS.IDLE, true);
  spineScreenChicken.state.addListener({
    complete: handleAnimationComplete,
  });
  containerScreenChicken.addChild(spineScreenChicken);

  const cars = [
    gameTextures.car_cream,
    gameTextures.car_fire,
    gameTextures.car_police,
    gameTextures.car_taxi,
    gameTextures.car,
  ];

  for (let step = 0; step < steps.length; step++) {
    const containerScreenRoad = new LayoutContainer({
      label: `containerScreenRoad-${step + 1}`,
      parent: containerScreenGame,
      layout: {
        flexGrow: 1,
        height: "100%",
        alignItems: "center",
        backgroundColor: "#716c68",
        flexShrink: 0,
        aspectRatio: gameTextures.start_bg.width / gameTextures.start_bg.height,
      },
    });

    const spriteScreenRoadDividing = new Sprite({
      label: `spriteScreenRoadDividing-${step + 1}`,
      parent: containerScreenRoad,
      texture: gameTextures.road_dividing,
      visible: step === steps.length - 1 ? false : true,
      layout: {
        height: "100%",
        position: "absolute",
        objectFit: "contain",
        right: 0,
      },
    });

    const containerScreenHatch = new Container({
      label: `containerScreenHatch-${step + 1}`,
      parent: containerScreenRoad,
      scale: { x: 1, y: 1 },
      layout: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        aspectRatio: gameTextures.hatch.width / gameTextures.hatch.height,
        bottom: "7%",
        left: -5,
      },
    });

    const spriteScreenRoadHatch = new Sprite({
      label: `spriteScreenRoadHatch-${step + 1}`,
      parent: containerScreenHatch,
      texture: gameTextures.hatch,
      scale: 1 / (SCALER - 1.3),
      layout: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
      },
    });

    const textScreenRoadHatch = new Text({
      label: `textScreenRoadHatch-${step + 1}`,
      parent: containerScreenHatch,
      text: `${(steps[step].multiply * currentDiff.multiply).toFixed(2)}x`,
      resolution,
      alpha: 0.7,
      layout: {
        width: "50%",
        heigth: "100%",
        objectFit: "scale-down",
        position: "absolute",
      },
      style: {
        fontFamily: fontsBundle.montserrat_font.family,
        fontSize: 38,
        fontWeight: "bold",
        align: "center",
        fill: "#fff",
        stroke: {
          color: "#4b4741",
          width: 5,
        },
        dropShadow: {
          color: "#000000",
          angle: 90,
          blur: 4,
          distance: 1,
        },
      },
    });

    const containerScreenRoadTable = new Container({
      label: `containerScreenRoadTable-${step + 1}`,
      parent: containerScreenRoad,
      scale: {
        x: 1,
        y: 0,
      },
      layout: {
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-end",
        aspectRatio:
          (gameTextures.table.width - 1.3) / (gameTextures.table.height - 1.3),
        bottom: "-5%",
        left: -5,
      },
    });

    const spriteScreenRoadTable = new Sprite({
      label: `spriteScreenRoadTable-${step + 1}`,
      parent: containerScreenRoadTable,
      texture: gameTextures.table,
      anchor: { x: 0.5, y: 0 },
      scale: 1 / (SCALER - 1.3),
      layout: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
        bottom: 5,
      },
    });

    const textScreenRoadTable = new Text({
      label: `textScreenRoadTable-${step + 1}`,
      parent: containerScreenRoadTable,
      text: `${(steps[step].multiply * currentDiff.multiply).toFixed(2)}x`,
      resolution,
      layout: {
        position: "absolute",
        width: "40%",

        objectFit: "scale-down",
      },
      style: {
        fontFamily: fontsBundle.montserrat_font.family,
        fontSize: 38,
        fontWeight: "bold",
        align: "center",
        fill: "#fff",
        stroke: {
          color: "#4b4741",
          width: 5,
        },
        dropShadow: {
          color: "#000000",
          angle: 90,
          blur: 4,
          distance: 1,
        },
      },
    });

    textElements.push({
      hatch: textScreenRoadHatch,
      table: textScreenRoadTable,
      multiply: steps[step].multiply,
    });

    const randomCar = cars[Math.floor(Math.random() * cars.length)];

    const spriteScreenRoadCar = new Sprite({
      label: `spriteScreenRoadCar-${step + 1}`,
      parent: containerScreenRoad,
      texture: randomCar,
      anchor: { x: 0.5, y: 1 },
      position: { x: 0, y: -app.screen.height },
      layout: {
        position: "absolute",
        left: "20%",
        width: "60%",
        objectFit: "contain",
      },
    });

    if (step !== 0) {
      const carAnimation = gsap.to(spriteScreenRoadCar, {
        y: () => `+=${app.screen.height + spriteScreenRoadCar.height * 2}`,
        duration: () => {
          return (
            (DURATION * 0.2) /
            (containerScreenRoad.overflowContainer.width /
              containerScreenRoad.overflowContainer.height)
          );
        },
        delay: Math.random() * 5,
        ease: "linear",
        repeat: -1,
        onStart: () => {
          if (stepCount >= step) {
            carAnimation.pause();
            carAnimation.kill();
          }
        },
        onRepeat: () => {
          if (stepCount >= step) {
            carAnimation.pause();
            carAnimation.kill();
          } else {
            spriteScreenRoadCar.y = -app.screen.height;
          }
        },
        onComplete: () => {
          if (stepCount >= step) {
            carAnimation.pause();
            carAnimation.kill();
          }
        },
      });

      containerScreenRoad.on("layout", () => {
        carAnimation.duration(
          (DURATION * 0.2) /
            (containerScreenRoad.overflowContainer.width /
              containerScreenRoad.overflowContainer.height),
        );
      });
    }

    const containerScreenRoadBarrier = new Container({
      label: `containerScreenRoadBarrier-${step + 1}`,
      parent: containerScreenRoad,
      alpha: 0,
      layout: {
        position: "absolute",
        width: "100%",
        aspectRatio: gameTextures.barrier.width / gameTextures.barrier.height,
        left: -5,
      },
    });

    const spriteScreenRoadBarrier = new Sprite({
      label: `spriteScreenRoadBarrier-${step + 1}`,
      parent: containerScreenRoadBarrier,
      texture: gameTextures.barrier,
      scale: 1 / (SCALER - 1.5),
      layout: {
        height: "100%",
        width: "100%",
        objectFit: "contain",
      },
    });
  }

  const containerScreenBgFinish = new Container({
    label: "containerScreenBgFinish",
    parent: containerScreenGame,
    layout: {
      flexGrow: 1,
      flexShrink: 0,
      alignSelf: "flex-end",
      height: "100%",
      aspectRatio: gameTextures.finish_bg.width / gameTextures.finish_bg.height,
    },
  });

  const spriteScreenBgFinish = new Sprite({
    label: "spriteScreenBgFinish",
    parent: containerScreenBgFinish,
    texture: gameTextures.finish_bg,
    layout: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
  });

  const containerScreenBgFinishLight = new Container({
    label: "containerScreenBgFinishLight",
    parent: containerScreenBgFinish,
    zIndex: 2,
    layout: {
      position: "absolute",
      height: "100%",
      aspectRatio: gameTextures.light.width / gameTextures.light.height,
      left: -40,
    },
  });

  const spriteScreenBgFinishLight = new Sprite({
    label: "spriteScreenBgFinishLight",
    parent: containerScreenBgFinishLight,
    texture: gameTextures.light,
    scale: {
      x: -1 / SCALER,
      y: 1 / SCALER,
    },

    layout: {
      objectFit: "contain",
      width: "100%",
      height: "100%",
    },
  });

  const containerScreenBgFinishLine1 = new Container({
    label: "containerScreenBgFinishLine1",
    parent: containerScreenBgFinish,
    layout: {
      position: "absolute",
      height: "100%",
      bottom: "-5%",
      aspectRatio: 0.1,
    },
  });

  const FINISH_ANIMATIONS = {
    IDLE_BACK: "idle_back",
    IDLE_FRONT: "idle_front",
    FINISH_BACK: "finish_back",
    FINISH_FRONT: "finish_front",
  };

  const spineScreenBgFinishLine1 = Spine.from({
    skeleton: "chicken_data",
    atlas: "chicken_atlas",
  });
  spineScreenBgFinishLine1.label = "spineScreenBgFinishLine1";
  spineScreenBgFinishLine1.layout = {
    objectFit: "contain",
    width: "100%",
    height: "100%",
  };
  spineScreenBgFinishLine1.skeleton.setToSetupPose();
  spineScreenBgFinishLine1.state.setAnimation(
    0,
    FINISH_ANIMATIONS.IDLE_BACK,
    true,
  );
  containerScreenBgFinishLine1.addChild(spineScreenBgFinishLine1);

  const containerScreenBgFinishLine2 = new Container({
    label: "containerScreenBgFinishLine2",
    parent: containerScreenBgFinish,
    layout: {
      position: "absolute",
      height: "100%",
      bottom: "-30%",
      aspectRatio: 0.1,
    },
  });

  const spineScreenBgFinishLine2 = Spine.from({
    skeleton: "chicken_data",
    atlas: "chicken_atlas",
  });
  spineScreenBgFinishLine2.label = "spineScreenBgFinishLine2";
  spineScreenBgFinishLine2.layout = {
    objectFit: "contain",
    width: "100%",
    height: "100%",
  };
  spineScreenBgFinishLine2.skeleton.setToSetupPose();
  spineScreenBgFinishLine2.state.setAnimation(
    0,
    FINISH_ANIMATIONS.IDLE_FRONT,
    true,
  );
  containerScreenBgFinishLine2.addChild(spineScreenBgFinishLine2);

  const containerScreenPanel = new Container({
    label: "containerScreenPanel",
    parent: containerScreen,
    layout: {
      flexGrow: 1,
      justifyContent: "center",
      alignSelf: "center",
      maxWidth: "100%",
      padding: 12,
      aspectRatio: 10,
    },
  });

  const containerScreenPanelBorder = new LayoutContainer({
    label: "containerScreenPanelBorder",
    parent: containerScreenPanel,
    layout: {
      aspectRatio: 10,
      maxWidth: 2100,
      height: "100%",
      padding: 12,
      gap: 20,
      borderWidth: 2,
      borderColor: "#ffffff1a",
      borderRadius: 16,
      backgroundColor: "#424242",
      justifyContent: "space-between",
    },
  });

  const containerScreenPanelBet = new Container({
    label: "containerScreenPanelBet",
    parent: containerScreenPanelBorder,
    layout: {
      flexDirection: "column",
      rowGap: 12,
      height: "100%",
      width: "40%",
    },
  });

  const containerScreenPanelBetBalance = new LayoutContainer({
    label: "containerScreenPanelBetBalance",
    parent: containerScreenPanelBet,
    layout: {
      width: "100%",
      height: "100%",
      backgroundColor: "#545454",
      borderRadius: 8,
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      boxSizing: "border-box",
      flexGrow: 1,
    },
  });

  const minBet = SETTING.min_bet;
  const maxBet = SETTING.max_bet;

  const containerScreenPanelBetBalanceMin = new LayoutContainer({
    label: "containerScreenPanelBetBalanceMin",
    parent: containerScreenPanelBetBalance,
    layout: {
      width: "25%",
      height: "100%",
      backgroundColor: "#656565",
      borderRadius: 4,
      padding: "1%",
      justifyContent: "center",
      alignItems: "center",
    },
    cursor: "pointer",
    eventMode: "static",
    onpointertap: () => {
      soundButtonClick.play();
      textScreenPanelBetBalanceValue.text = minBet;
    },
  });

  gsapPointerScaleDownUp(containerScreenPanelBetBalanceMin);

  const textScreenPanelBetBalanceMin = new Text({
    label: "textScreenPanelBetBalanceMin",
    parent: containerScreenPanelBetBalanceMin,
    text: TEXT.panel_min,
    layout: {
      width: "60%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.blink_font.family,
      fontWeight: "bold",
      fontSize: 24,
      align: "center",
      fill: "#fff",
    },
  });

  const containerScreenPanelBetBalanceValue = new LayoutContainer({
    label: "containerScreenPanelBetBalanceValue",
    parent: containerScreenPanelBetBalance,
    layout: {
      width: "50%",
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const textScreenPanelBetBalanceValue = new Text({
    label: "textScreenPanelBetBalanceValue",
    parent: containerScreenPanelBetBalanceValue,
    text: TEXT.start_bet,
    layout: {
      width: "100%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.blink_font.family,
      fontSize: 24,
      align: "center",
      fill: "#fff",
    },
  });

  const containerScreenPanelBetBalanceMax = new LayoutContainer({
    label: "containerScreenPanelBetBalanceMax",
    parent: containerScreenPanelBetBalance,
    layout: {
      height: "100%",
      width: "25%",
      backgroundColor: "#656565",
      borderRadius: 4,
      padding: "1%",
      justifyContent: "center",
      alignItems: "center",
    },
    cursor: "pointer",
    eventMode: "static",
    onpointertap: () => {
      soundButtonClick.play();
      textScreenPanelBetBalanceValue.text = maxBet;
    },
  });

  gsapPointerScaleDownUp(containerScreenPanelBetBalanceMax);

  const textScreenPanelBetBalanceMax = new Text({
    label: "textScreenPanelBetBalanceMax",
    parent: containerScreenPanelBetBalanceMax,
    text: TEXT.panel_max,
    layout: {
      width: "60%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.blink_font.family,
      fontWeight: "bold",
      fontSize: 24,
      align: "center",
      fill: "#fff",
    },
  });

  const containerScreenPanelBetButtons = new Container({
    label: "containerScreenPanelBetButtons",
    parent: containerScreenPanelBet,
    layout: {
      height: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      columnGap: 12,
      flexGrow: 1,
    },
  });

  const buttons = [];
  const textCurrency = new Text({
    text: TEXT.currency,
  });

  for (let step = 0; step < TEXT.buttons.length; step++) {
    const containerScreenPanelBetButton = new LayoutContainer({
      label: `containerScreenPanelBetButton-${step + 1}`,
      parent: containerScreenPanelBetButtons,
      layout: {
        backgroundColor: "#545454",
        borderWidth: 1,
        borderColor: "#545454",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        padding: "1%",
        height: "100%",
      },
      cursor: "pointer",
      eventMode: "static",
      onpointertap: () => {
        soundButtonClick.play();
        if (textScreenPanelBetButton.text) {
          textScreenPanelBetBalanceValue.text = parseFloat(
            textScreenPanelBetButton.text,
          );
        }
      },
    });

    gsapPointerScaleDownUp(containerScreenPanelBetButton);

    const textScreenPanelBetButton = new Text({
      label: `textScreenPanelBetButton-${step + 1}`,
      parent: containerScreenPanelBetButton,
      text: `${TEXT.buttons[step]} ${textCurrency.text}`,
      layout: {
        height: "100%",
        width: "100%",
        objectFit: "scale-down",
      },
      style: {
        fontFamily: fontsBundle.blink_font.family,
        fontWeight: "bold",
        fontSize: 24,
        align: "center",
        fill: "#fff",
      },
    });

    buttons.push(textScreenPanelBetButton);
  }

  const containerScreenPanelDifficulty = new Container({
    label: "containerScreenPanelDifficulty",
    parent: containerScreenPanelBorder,
    layout: {
      height: "100%",
      gap: 12,
      width: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
    },
  });

  const containerScreenPanelDifficultyTexts = new Container({
    label: "containerScreenPanelDifficultyTexts",
    parent: containerScreenPanelDifficulty,
    layout: {
      width: "100%",
      height: "100%",
      justifyContent: "space-between",
    },
  });

  const textScreenPanelDifficulty = new Text({
    label: "textScreenPanelDifficulty",
    parent: containerScreenPanelDifficultyTexts,
    text: TEXT.panel_difficulty,
    layout: {
      height: "50%",
      objectFit: "scale-down",
      objectPosition: "top left",
    },
    style: {
      fontFamily: fontsBundle.blink_font.family,
      fontSize: 24,
      align: "left",
      fill: "#fff",
    },
  });

  const textScreenPanelDifficultyChance = new Text({
    label: "textScreenPanelDifficultyChance",
    parent: containerScreenPanelDifficultyTexts,
    text: TEXT.panel_chance,
    layout: {
      height: "50%",
      objectPosition: "top right",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.montserrat_font.family,
      fontWeight: 700,
      fontSize: 24,
      align: "right",
      fill: "#ffffff60",
    },
  });

  const containerScreenPanelDifficulties = new LayoutContainer({
    label: "containerScreenPanelDifficulties",
    parent: containerScreenPanelDifficulty,
    layout: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
      backgroundColor: "#545454",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.3%",
      gap: 4,
    },
  });

  const containerScreenPanelDifficultyEasy = new LayoutContainer({
    label: "containerScreenPanelDifficultyEasy",
    parent: containerScreenPanelDifficulties,
    layout: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#656565",
      borderRadius: 8,
    },
    cursor: "pointer",
    eventMode: "static",
    onpointertap: () => {
      soundButtonClick.play();
      setDifficulty(DIFFICULTY_CONFIG[DIFFICULTY_KEYS.EASY].text);
    },
  });

  const textScreenPanelDifficultyEasy = new BitmapText({
    label: "textScreenPanelDifficultyEasy",
    parent: containerScreenPanelDifficultyEasy,
    text: DIFFICULTY_CONFIG[DIFFICULTY_KEYS.EASY].text,
    layout: {
      width: "80%",
      height: "100%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.montserrat_font_bold.family,
      fontWeight: 600,
      fontSize: 16,
      align: "center",
      fill: "#fff",
    },
  });

  const containerScreenPanelDifficultyMedium = new LayoutContainer({
    label: "containerScreenPanelDifficultyMedium",
    parent: containerScreenPanelDifficulties,
    layout: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: undefined,
      borderRadius: 8,
    },
    cursor: "pointer",
    eventMode: "static",
    onpointertap: () => {
      soundButtonClick.play();
      setDifficulty(DIFFICULTY_CONFIG[DIFFICULTY_KEYS.MEDIUM].text);
    },
  });

  const textScreenPanelDifficultyMedium = new BitmapText({
    label: "textScreenPanelDifficultyMedium",
    parent: containerScreenPanelDifficultyMedium,
    text: DIFFICULTY_CONFIG[DIFFICULTY_KEYS.MEDIUM].text,
    layout: {
      width: "80%",
      height: "100%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.montserrat_font_bold.family,
      fontWeight: 600,
      fontSize: 16,
      align: "center",
      fill: "#fff",
    },
  });

  const containerScreenPanelDifficultyHard = new LayoutContainer({
    label: "containerScreenPanelDifficultyHard",
    parent: containerScreenPanelDifficulties,
    layout: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: undefined,
      borderRadius: 8,
    },
    cursor: "pointer",
    eventMode: "static",
    onpointertap: () => {
      soundButtonClick.play();
      setDifficulty(DIFFICULTY_CONFIG[DIFFICULTY_KEYS.HARD].text);
    },
  });

  const textScreenPanelDifficultyHard = new BitmapText({
    label: "textScreenPanelDifficultyHard",
    parent: containerScreenPanelDifficultyHard,
    text: DIFFICULTY_CONFIG[DIFFICULTY_KEYS.HARD].text,
    layout: {
      width: "80%",
      height: "100%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.montserrat_font_bold.family,
      fontWeight: 600,
      fontSize: 16,
      align: "center",
      fill: "#fff",
    },
  });

  const containerScreenPanelDifficultyHardcore = new LayoutContainer({
    label: "containerScreenPanelDifficultyHardcore",
    parent: containerScreenPanelDifficulties,
    layout: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: undefined,
      borderRadius: 8,
      marginRight: 4,
    },
    cursor: "pointer",
    eventMode: "static",
    onpointertap: () => {
      soundButtonClick.play();
      setDifficulty(DIFFICULTY_CONFIG[DIFFICULTY_KEYS.EXTREME].text);
    },
  });

  const textScreenPanelDifficultyHardcore = new BitmapText({
    label: "textScreenPanelDifficultyHardcore",
    parent: containerScreenPanelDifficultyHardcore,
    text: DIFFICULTY_CONFIG[DIFFICULTY_KEYS.EXTREME].text,
    layout: {
      width: "80%",
      height: "100%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.montserrat_font_bold.family,
      fontWeight: 600,
      fontSize: 16,
      align: "center",
      fill: "#fff",
    },
  });

  const difficultyMap = new Map([
    [
      DIFFICULTY_CONFIG[DIFFICULTY_KEYS.EASY].text,
      {
        config: DIFFICULTY_CONFIG[DIFFICULTY_KEYS.EASY],
        element: containerScreenPanelDifficultyEasy,
      },
    ],
    [
      DIFFICULTY_CONFIG[DIFFICULTY_KEYS.MEDIUM].text,
      {
        config: DIFFICULTY_CONFIG[DIFFICULTY_KEYS.MEDIUM],
        element: containerScreenPanelDifficultyMedium,
      },
    ],
    [
      DIFFICULTY_CONFIG[DIFFICULTY_KEYS.HARD].text,
      {
        config: DIFFICULTY_CONFIG[DIFFICULTY_KEYS.HARD],
        element: containerScreenPanelDifficultyHard,
      },
    ],
    [
      DIFFICULTY_CONFIG[DIFFICULTY_KEYS.EXTREME].text,
      {
        config: DIFFICULTY_CONFIG[DIFFICULTY_KEYS.EXTREME],
        element: containerScreenPanelDifficultyHardcore,
      },
    ],
  ]);

  function setDifficulty(difficulty) {
    if (currentDiff?.text === difficulty) return;

    for (const { element } of difficultyMap.values()) {
      element.layout = { backgroundColor: undefined };
    }

    const selected = difficultyMap.get(difficulty);
    if (selected) {
      currentDiff = selected.config;
      selected.element.layout = { backgroundColor: "#656565" };

      updateAllTextMultipliers();
    }
  }

  function updateAllTextMultipliers() {
    textElements.forEach((item) => {
      const newValue = item.multiply * currentDiff.multiply;
      const formattedValue = newValue.toFixed(2);

      item.hatch.text = `${formattedValue}x`;
      item.table.text = `${formattedValue}x`;
    });
  }

  const containerScreenPanelButtons = new Container({
    label: "containerScreenPanelButtons",
    parent: containerScreenPanelBorder,
    layout: {
      width: 320,
      minWidth: 320,
      height: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
  });

  const containerScreenPanelCashout = new LayoutContainer({
    label: "containerScreenPanelCashout",
    parent: containerScreenPanelButtons,
    visible: false,
    layout: {
      flexGrow: 1,
      height: "100%",
      backgroundColor: "#ffd82c",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      padding: "1%",
    },
    cursor: "pointer",
    eventMode: "static",
    onpointertap: () => {
      soundButtonClick.play();
      soundCashout.play();
      const tl = gsap.timeline();

      tl.to(containerScreenModal, {
        visible: true,
        alpha: 1,
        duration: DURATION * 0.5,
        ease: "sine.in",
      });

      tl.fromTo(
        containerScreenPopupWin,
        {
          scale: 0,
        },
        {
          visible: true,
          scale: 1,
          alpha: 1,
          duration: DURATION * 0.2,
          ease: "back.out(1.7)",
        },
      );
    },
  });

  gsapPointerScaleDownUp(containerScreenPanelCashout);

  const textScreenPanelCashout = new BitmapText({
    label: "textScreenPanelCashout",
    parent: containerScreenPanelCashout,
    text: TEXT.panel_cash_out,
    layout: {
      width: "100%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.montserrat_font.family,
      fontWeight: 700,
      fontSize: 24,
      align: "center",
      fill: "#000000",
    },
    resolution,
  });

  const textScreenPanelCashoutValue = new BitmapText({
    label: "textScreenPanelCashoutValue",
    parent: containerScreenPanelCashout,
    text: "",
    layout: {
      width: "100%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.montserrat_font.family,
      fontWeight: 700,
      fontSize: 24,
      align: "center",
      fill: "#000000",
    },
    resolution,
  });

  const containerScreenPanelPlay = new LayoutContainer({
    label: "containerScreenPanelPlay",
    parent: containerScreenPanelButtons,
    layout: {
      flex: 1,
      width: "100%",
      height: "100%",
      backgroundColor: "#3dc55b",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      padding: "1%",
    },
    cursor: "pointer",
    eventMode: "static",
    onpointertap: () => {
      soundButtonClick.play();
      play();
    },
  });

  gsapPointerScaleDownUp(containerScreenPanelPlay);

  const textScreenPanelPlay = new BitmapText({
    label: "textScreenPanelPlay",
    parent: containerScreenPanelPlay,
    text: TEXT.panel_play,
    layout: {
      width: "100%",
      height: "70%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.montserrat_font_bold.family,
      fontWeight: "bold",
      fontSize: 36,
      align: "center",
      fill: "#fff",
    },
    resolution,
  });

  const textScreenPanelGo = new BitmapText({
    label: "textScreenPanelGo",
    parent: containerScreenPanelPlay,
    text: TEXT.panel_go,
    layout: {
      width: "100%",
      height: "70%",
      objectFit: "scale-down",
    },
    style: {
      fontFamily: fontsBundle.montserrat_font_bold.family,
      fontWeight: "bold",
      fontSize: 36,
      align: "center",
      fill: "#fff",
    },
    visible: false,
    resolution,
  });

  containerScreenPanelBorder.on("layout", () => {
    if (app.screen.width > 1440) {
      containerScreenPanelDifficulty.layout = {
        height: "100%",
        display: "flex",
      };

      containerScreenPanelBorder.layout = {
        flexDirection: "row",
        height: undefined,
        aspectRatio: 10,
      };
      containerScreenPanel.layout = {
        height: undefined,
      };
      containerScreenPanelBet.layout = {
        height: "100%",
        width: "40%",
      };

      containerScreenPanelButtons.layout = {
        width: 320,
        height: "100%",
        minWidth: 320,
      };
    } else {
      if (gameState === GAME_STATES.INIT) {
        containerScreenPanelDifficulty.layout = {
          height: "25%",
        };
      } else {
        containerScreenPanelDifficulty.layout = {
          height: "25%",
          display: "none",
        };
      }

      containerScreenPanelBorder.layout = {
        flexDirection: "column",
        aspectRatio: undefined,
        height: "100%",
      };
      containerScreenPanel.layout = {
        aspectRatio: undefined,
        height: "70%",
      };
      containerScreenPanelBet.layout = {
        width: "100%",
        height: "50%",
      };
      containerScreenPanelButtons.layout = {
        width: "100%",
        height: "25%",
        flexGrow: 1,
        maxWidth: undefined,
        minWidth: undefined,
      };
    }
  });

  const containerScreenModal = new LayoutContainer({
    label: "containerScreenModal",
    parent: containerScreen,
    zIndex: 99999,
    alpha: 0,
    visible: false,
    layout: {
      position: "absolute",
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#00000070",
    },
  });

  const containerScreenPopupWin = new Container({
    label: "containerScreenPopupWin",
    parent: containerScreenModal,
    layout: {},
    visible: false,
    alpha: 0,
  });

  const spriteScreenPopupWin = new Sprite({
    label: "spriteScreenPopupWin",
    parent: containerScreenPopupWin,
    anchor: 0.5,
    texture: modalTextures.modal,
    scale: 1 / (SCALER - 1.5),
  });

  const textScreenPopupWinTitle = new Text({
    label: "textScreenPopupWinTitle",
    parent: containerScreenPopupWin,
    text: TEXT.modal_win_title,
    anchor: 0.5,
    position: {
      x: 0,
      y: -32,
    },
  });

  const textScreenPopupWin = new Text({
    label: "textScreenPopupWin",
    parent: containerScreenPopupWin,
    text: TEXT.modal_win_subtitle,
    anchor: 0.5,
    position: {
      x: 0,
      y: 32,
    },
    style: {
      fontFamily: fontsBundle.blink_font.family,
      fontSize: 24,
      align: "center",
      fill: "#fff",
    },
  });

  const containerScreenPopupWinButton = new LayoutContainer({
    layout: "containerScreenPopupWinButton",
    parent: containerScreenPopupWin,
    position: {
      x: -90,
      y: 85,
    },
    layout: {
      position: "absolute",
      width: spriteScreenPopupWin.width / 2 - 17,
      height: 50,
      borderColor: "#a59f6b",
      borderWidth: 2,
      backgroundColor: "#fbcd2b",
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    eventMode: "static",
    cursor: "pointer",
    onpointertap: () => {
      soundButtonClick.play();
    },
  });

  const textScreenPopupWinButton = new Text({
    label: "textScreenPopupWinButton",
    parent: containerScreenPopupWinButton,
    text: TEXT.modal_win_button,
    anchor: 0.5,
    layout: {
      width: "80%",
      height: "100%",
    },
    style: {
      fontFamily: fontsBundle.blink_font.family,
      fontSize: 24,
      align: "center",
      fill: "#000000",
    },
  });

  const containerScreenPopupLose = new Container({
    label: "containerScreenPopupLose",
    parent: containerScreenModal,
    layout: {},
    visible: false,
    alpha: 0,
  });

  const spriteScreenPopupLose = new Sprite({
    label: "spriteScreenPopupLose",
    parent: containerScreenPopupLose,
    anchor: 0.5,
    texture: modalTextures.modal,
    scale: 1 / (SCALER - 1.5),
  });

  const textScreenPopupLoseTitle = new Text({
    label: "textScreenPopupLoseTitle",
    parent: containerScreenPopupLose,
    text: TEXT.modal_lose_title,
    anchor: 0.5,
    position: {
      x: 0,
      y: -32,
    },
  });

  const containerScreenPopupLoseButton = new LayoutContainer({
    layout: "containerScreenPopupLoseButton",
    parent: containerScreenPopupLose,
    position: {
      x: -90,
      y: 85,
    },
    layout: {
      position: "absolute",
      width: spriteScreenPopupLose.width / 2 - 17,
      height: 50,
      borderColor: "#a56f6b",
      borderWidth: 2,
      backgroundColor: "#fb2b2b",
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    eventMode: "static",
    cursor: "pointer",
    onpointertap: () => {
      soundButtonClick.play();
      const tl = gsap.timeline();

      tl.to(containerScreenPopupLose, {
        alpha: 0,
        visible: false,
        duration: DURATION * 0.5,
        ease: "sine.out",
      });

      tl.to(containerScreenModal, {
        alpha: 0,
        visible: false,
        duration: DURATION * 0.2,
        ease: "sine.out",
        onComplete: () => {
          spineScreenChicken.state.setAnimation(
            0,
            CHICKEN_ANIMATIONS.IDLE,
            true,
          );
          gameState = GAME_STATES.START;
        },
      });
    },
  });

  const textScreenPopupLoseButton = new Text({
    label: "textScreenPopupLoseButton",
    parent: containerScreenPopupLoseButton,
    text: TEXT.modal_lose_button,
    anchor: 0.5,
    layout: {},
    style: {
      fontFamily: fontsBundle.blink_font.family,
      fontSize: 24,
      align: "center",
      fill: "#ffffff",
    },
  });

  function play() {
    if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.END)
      return;

    gameState = GAME_STATES.PLAYING;

    textScreenPanelPlay.visible = false;
    textScreenPanelGo.visible = true;

    containerScreenPanelCashout.visible = true;

    containerScreenPanelBetBalance.alpha = 0.7;
    containerScreenPanelBetBalance.eventMode = "none";

    containerScreenPanelBetButtons.alpha = 0.7;
    containerScreenPanelBetButtons.eventMode = "none";

    containerScreenPanelDifficulties.alpha = 0.7;
    containerScreenPanelDifficulties.eventMode = "none";

    const road = app.stage.getChildByLabel(`containerScreenRoad-1`, true);

    const roadWidth =
      stepCount === 0
        ? containerScreenBgStart.width + containerScreenChicken.width / 2 - 7
        : road.width;

    const offset =
      containerScreenGame._trackpad.xAxis.max <
      -containerScreenChicken.x - roadWidth
        ? -containerScreenChicken.x - roadWidth + 50
        : containerScreenGame._trackpad.xAxis.max;

    gsap.to(containerScreenChicken, {
      x: `+=${roadWidth}`,
      duration: DURATION * 0.5,
      ease: "sine.in",
      onStart: () => {
        setTimeout(() => {
          scroller.start(0, containerScreenGame.overflowContainer.x, offset);
        }, DURATION * 250);

        if (stepCount > 1) {
          const prevTable = app.stage.getChildByLabel(
            `containerScreenRoadTable-${stepCount - 1}`,
            true,
          );

          gsap.to(prevTable.scale, {
            y: 0,
            duration: DURATION * 0.2,
            ease: "sine.out",
          });

          const prevHatch = app.stage.getChildByLabel(
            `containerScreenHatch-${stepCount - 1}`,
            true,
          );

          gsap.to(prevHatch.scale, {
            x: 0,
            duration: DURATION * 0.2,
            ease: "sine.out",
            onComplete: () => {
              const sprite = app.stage.getChildByLabel(
                `spriteScreenRoadHatch-${stepCount - 1}`,
                true,
              );
              sprite.texture = gameTextures.hatch_gold;

              const text = app.stage.getChildByLabel(
                `textScreenRoadHatch-${stepCount - 1}`,
                true,
              );
              text.visible = false;

              gsap.to(prevHatch.scale, {
                x: 1,
                duration: DURATION * 0.2,
                ease: "sine.out",
              });
            },
          });
        }

        spineScreenChicken.state.setAnimation(
          0,
          CHICKEN_ANIMATIONS.JUMP,
          false,
        );

        if (stepCount === steps.length + 1) {
          spineScreenBgFinishLine1.state.setAnimation(
            0,
            FINISH_ANIMATIONS.FINISH_BACK,
            false,
          );
          spineScreenBgFinishLine2.state.setAnimation(
            0,
            FINISH_ANIMATIONS.FINISH_FRONT,
            false,
          );
        }

        setTimeout(() => {
          soundJump.play();
        }, 500);
      },
      onComplete: () => {
        if (stepCount <= steps.length) {
          const currentStep = steps[stepCount - 1];

          const multiplyText =
            textElements[stepCount - 1]?.hatch?.text ||
            `${currentStep.multiply}x`;
          const multiply = parseFloat(multiplyText.replace("x", ""));

          const win = textScreenPanelBetBalanceValue.text * multiply;
          textScreenPanelCashoutValue.text = `${win} ${textCurrency.text}`;
          textScreenPopupWin.memory_win = win;
          textScreenPopupWin.text =
            textScreenPopupWin.text || textScreenPanelCashoutValue.text;

          const car = app.stage.getChildByLabel(
            `spriteScreenRoadCar-${stepCount}`,
            true,
          );
          const barrier = app.stage.getChildByLabel(
            `containerScreenRoadBarrier-${stepCount}`,
            true,
          );
          const currentTable = app.stage.getChildByLabel(
            `containerScreenRoadTable-${stepCount}`,
            true,
          );

          if (currentStep.type === "deadly") {
            soundCrash.play();
            soundChick.play();

            gsap.to(car, {
              y: app.screen.height,
              duration: DURATION * 0.5,
              ease: "linear",
            });

            spineScreenChicken.state.setAnimation(
              0,
              CHICKEN_ANIMATIONS.DEATH,
              false,
            );
          } else if (currentStep.type === "default") {
            const carTexture = car.texture;
            const taxi = gameTextures.car_taxi;
            const police = gameTextures.car_police;
            const cream = gameTextures.car_cream;
            const fire = gameTextures.car_fire;
            const truck = gameTextures.car;

            gsap.to(car, {
              y: barrier.y - barrier.height / 2 - car.height / 2,
              duration: DURATION * 0.5,
              ease: "linear",
            });

            gsap.fromTo(
              barrier,
              {
                y: -app.screen.height,
              },
              {
                y: barrier.y,
                alpha: 1,
                duration: DURATION * 0.2,
                ease: "power2.out",
              },
            );

            gsap.to(currentTable.scale, {
              y: 1,
              duration: DURATION * 0.2,
              ease: "sine.out",
            });
          }
        }
      },
    });

    if (stepCount === steps.length + 1) {
      gameState = GAME_STATES.END;
    } else {
      stepCount++;
    }
  }

  function handleAnimationComplete(entry) {
    const animationName = entry.animation.name;

    if (animationName === CHICKEN_ANIMATIONS.JUMP) {
      if (stepCount === steps.length + 1) {
        soundWin.play();

        spineScreenChicken.state.setAnimation(0, CHICKEN_ANIMATIONS.WIN, true);
        gameState = GAME_STATES.END;

        const tl = gsap.timeline();

        tl.to(containerScreenModal, {
          delay: 2,
          visible: true,
          alpha: 1,
          duration: DURATION * 0.5,
          ease: "sine.in",
        });

        tl.fromTo(
          containerScreenPopupWin,
          {
            scale: 0,
          },
          {
            visible: true,
            scale: 1,
            alpha: 1,
            duration: DURATION * 0.2,
            ease: "back.out(1.7)",
          },
        );
      } else {
        spineScreenChicken.state.setAnimation(0, CHICKEN_ANIMATIONS.IDLE, true);
        gameState = GAME_STATES.START;
      }
    }

    if (animationName === CHICKEN_ANIMATIONS.DEATH) {
      soundLose.play();

      const tl = gsap.timeline();

      tl.to(containerScreenModal, {
        visible: true,
        alpha: 1,
        duration: DURATION * 0.5,
        ease: "sine.in",
      });

      tl.fromTo(
        containerScreenPopupLose,
        {
          scale: 0,
        },
        {
          visible: true,
          scale: 1,
          alpha: 1,
          duration: DURATION * 0.2,
          ease: "back.out(1.7)",
        },
      );
    }
  }
};
