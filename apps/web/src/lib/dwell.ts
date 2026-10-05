// Counts how long something stays on screen. Paused while the tab is hidden,
// so a phone left on the table does not inflate the number.
export function createDwellTimer(now: () => number = () => performance.now()) {
  let total = 0;
  let since: number | null = now();
  return {
    pause() {
      if (since === null) return;
      total += now() - since;
      since = null;
    },
    resume() {
      if (since === null) since = now();
    },
    /** Stops the timer and returns the visible time in milliseconds. */
    stop() {
      this.pause();
      return total;
    },
  };
}

export function toSeconds(ms: number) {
  return Math.round(ms / 100) / 10;
}
