// Dialog motion: the tapped photo grows into the dialog's photo, the rest of
// the dialog follows a beat later, and closing fades it out where it is.
export const OPEN_MS = 420;
const CONTENT_DELAY_MS = 120;
const CONTENT_MS = 320;
const CLOSE_MS = 220;
const FADE_MS = 150;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_IN = "cubic-bezier(0.4, 0, 1, 1)";

function reducedMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

// Transform and clip that make `target` sit exactly over `source`, cropped the
// way object-fit: cover crops it, so the image never stretches.
export function expandFrame(source: Box, target: Box) {
  const scale = Math.max(
    source.width / target.width,
    source.height / target.height,
  );
  const round = (value: number) => Math.round(value * 100) / 100;
  const clipX = round((target.width - source.width / scale) / 2);
  const clipY = round((target.height - source.height / scale) / 2);
  const dx = source.left + source.width / 2 - (target.left + target.width / 2);
  const dy = source.top + source.height / 2 - (target.top + target.height / 2);
  return {
    transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
    clipPath: `inset(${clipY}px ${clipX}px)`,
  };
}

function fadeIn(dialog: HTMLElement) {
  dialog.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: FADE_MS,
    easing: "ease-out",
  });
}

// Call right after showModal(). `content` is everything except the photo.
export function expandOpen(
  dialog: HTMLDialogElement,
  source: Element | null | undefined,
  target: HTMLElement | null | undefined,
  content: Element[],
  // Shown only after the photo lands (e.g. carousel slides that peek in).
  late: Element[] = [],
) {
  delete dialog.dataset.closing;
  if (reducedMotion() || !source || !target) return fadeIn(dialog);
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width || !from.height || !to.width || !to.height)
    return fadeIn(dialog);

  dialog.classList.add("is-expanding");
  const photo = target.animate(
    [expandFrame(from, to), { transform: "none", clipPath: "inset(0px 0px)" }],
    { duration: OPEN_MS, easing: EASE_OUT },
  );
  const surface = getComputedStyle(dialog).backgroundColor;
  dialog.animate(
    [
      { backgroundColor: "transparent", boxShadow: "none" },
      { backgroundColor: surface },
    ],
    {
      duration: CONTENT_MS,
      delay: CONTENT_DELAY_MS,
      easing: EASE_OUT,
      fill: "backwards",
    },
  );
  for (const element of content)
    element.animate(
      [
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "none" },
      ],
      {
        duration: CONTENT_MS,
        delay: CONTENT_DELAY_MS,
        easing: EASE_OUT,
        fill: "backwards",
      },
    );
  for (const element of late) (element as HTMLElement).style.opacity = "0";
  photo.finished
    .catch(() => undefined)
    .then(() => {
      dialog.classList.remove("is-expanding");
      for (const element of late) {
        (element as HTMLElement).style.opacity = "";
        element.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 200,
          easing: "ease-out",
        });
      }
    });
}

// Fades the dialog out where it is, then really closes it.
export function closeWithMotion(dialog: HTMLDialogElement | null) {
  if (!dialog?.open || dialog.dataset.closing) return;
  dialog.dataset.closing = "1";
  dialog.classList.add("is-closing");
  const reduced = reducedMotion();
  const exit = dialog.animate(
    reduced
      ? [{ opacity: 1 }, { opacity: 0 }]
      : [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(8px) scale(0.97)" },
        ],
    {
      duration: reduced ? FADE_MS : CLOSE_MS,
      easing: EASE_IN,
      fill: "forwards",
    },
  );
  exit.finished
    .catch(() => undefined)
    .then(() => {
      dialog.close();
      dialog.classList.remove("is-closing");
      exit.cancel();
      delete dialog.dataset.closing;
    });
}
