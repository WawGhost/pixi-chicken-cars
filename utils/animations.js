import gsap from "gsap";

export const gsapPointerScaleDown = (
  element,
  { scale = 0.99, duration = 1 / 5, ease = "sine.inOut" } = {},
) => {
  return gsap.to(element, {
    pixi: { scale },
    duration,
    ease,
  });
};

export const gsapPointerScaleUp = (
  element,
  { scale = 1, duration = 1 / 5, ease = "sine.inOut" } = {},
) => {
  return gsap.to(element, {
    pixi: { scale },
    duration,
    ease,
  });
};

export const gsapPointerScaleDownUp = (
  element,
  { down, up, enter = () => {}, leave = () => {} } = {},
) => {
  element.cursor = "pointer";
  element.eventMode = "static";
  element.onpointerenter = () => {
    gsapPointerScaleDown(element, down);
    enter();
  };
  element.onpointerleave = () => {
    gsapPointerScaleUp(element, up);
    leave();
  };
};
