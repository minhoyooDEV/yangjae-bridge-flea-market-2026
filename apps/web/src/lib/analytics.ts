import type { PostHog } from "posthog-js";
import { version } from "../../package.json";
import { readCreator } from "./creator";

// PostHog project key, injected at build time from the POSTHOG_KEY repository
// secret (see .github/workflows/pages.yml). Unset disables analytics.
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY ?? "";
const POSTHOG_HOST = "https://us.i.posthog.com";

export const isCreator = readCreator();

let client: PostHog | null = null;
const pending: [string, Record<string, unknown> | undefined][] = [];

// Loads PostHog after first paint. Local dev builds never send events.
export function initAnalytics() {
  if (!POSTHOG_KEY || import.meta.env.DEV) return;
  void import("posthog-js").then(({ default: posthog }) => {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: "https://us.posthog.com",
      defaults: "2026-08-30",
      person_profiles: "identified_only",
      // Creator visits are tagged for filtering and never recorded as replays.
      disable_session_recording: isCreator,
      before_send: (event) => {
        if (event && isCreator) event.properties.is_creator = true;
        return event;
      },
      // Uncaught errors and rejections go to Error Tracking once loaded.
      capture_exceptions: {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: false,
      },
      logs: {
        serviceName: "yangjae-bridge-flea-market-web",
        environment: import.meta.env.MODE,
        serviceVersion: version,
      },
    });
    client = posthog;
    for (const [name, properties] of pending.splice(0))
      send(posthog, name, properties);
  });
}

// Each event also goes out as a structured log line. before_send does not
// apply to logs, so the creator flag is attached here.
function send(
  posthog: PostHog,
  name: string,
  properties?: Record<string, unknown>,
) {
  posthog.capture(name, properties);
  posthog.logger.info(name, {
    event: name,
    ...properties,
    ...(isCreator && { is_creator: true }),
  });
}

export function track(name: string, properties?: Record<string, unknown>) {
  if (client) send(client, name, properties);
  else if (POSTHOG_KEY && !import.meta.env.DEV)
    pending.push([name, properties]);
}
