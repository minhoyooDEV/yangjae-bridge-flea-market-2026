// Creator mode marks the site owner's own visits so analytics can filter them
// out. Turn it on once per browser with ?creator=on, off with ?creator=off.
export const CREATOR_STORAGE_KEY = "cm:creator";
export const CREATOR_PARAM = "creator";

export interface CreatorDecision {
  creator: boolean;
  // What to write to storage: "1" to remember, null to forget, undefined to leave as is.
  store?: "1" | null;
}

export function decideCreator(
  search: string,
  stored: string | null,
): CreatorDecision {
  const value = new URLSearchParams(search).get(CREATOR_PARAM);
  if (value === "on") return { creator: true, store: "1" };
  if (value === "off") return { creator: false, store: null };
  return { creator: stored === "1" };
}

// Browser storage can be missing or throw (private mode); fall back to "not creator".
export function readCreator(): boolean {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(CREATOR_STORAGE_KEY);
  } catch {
    stored = null;
  }
  const decision = decideCreator(location.search, stored);
  try {
    if (decision.store === "1") localStorage.setItem(CREATOR_STORAGE_KEY, "1");
    if (decision.store === null) localStorage.removeItem(CREATOR_STORAGE_KEY);
  } catch {
    // Storage unavailable: creator mode lasts only for this page view.
  }
  if (new URLSearchParams(location.search).has(CREATOR_PARAM)) {
    const url = new URL(location.href);
    url.searchParams.delete(CREATOR_PARAM);
    history.replaceState(history.state, "", url);
  }
  return decision.creator;
}
