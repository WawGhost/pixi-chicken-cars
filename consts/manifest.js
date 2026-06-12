export const MANIFEST = {
  bundles: [
    {
      name: "fonts",
      assets: [
        { alias: "montserrat_font", src: "../fonts/Montserrat-Regular.woff2" },
        {
          alias: "montserrat_font_bold",
          src: "../fonts/Montserrat-Bold.woff2",
        },
        { alias: "blink_font", src: "../fonts/BlinkMacSystemFont.woff2" },
      ],
    },
    {
      name: "sounds",
      assets: [
        { alias: "bg", src: "../sounds/background.mp3" },
        { alias: "buttonClick", src: "../sounds/buttonClick.mp3" },
        { alias: "car1", src: "../sounds/car1.mp3" },
        { alias: "car2", src: "../sounds/car2.mp3" },
        { alias: "cashout", src: "../sounds/cashout.mp3" },
        { alias: "chick", src: "../sounds/chick.mp3" },
        { alias: "crash", src: "../sounds/crash.mp3" },
        { alias: "jump", src: "../sounds/jump.mp3" },
        { alias: "lose", src: "../sounds/lose.mp3" },
        { alias: "win", src: "../sounds/win.mp3" },
      ],
    },
    {
      name: "load-screen",
      assets: [{ alias: "load_sheet", src: "../assets/load_sheet.json" }],
    },
    {
      name: "game-screen",
      assets: [
        { alias: "game_sheet", src: "../assets/game_sheet.json" },
        { alias: "chicken_data", src: "../assets/atlas/game/chiken.json" },
        { alias: "chicken_atlas", src: "../assets/atlas/game/chiken.atlas" },
      ],
    },
    {
      name: "modal-screen",
      assets: [{ alias: "modal_sheet", src: "../assets/modal_sheet.json" }],
    },
  ],
};
