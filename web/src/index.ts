type ToolbirdConfig = {
  endpoint: string;
  domains: string[];
  excludeQuery: boolean;
  autoTrack: boolean;
  trackingEnabled: boolean;
};

type ToolbirdOptions = {
  host?: string;
  domain?: string;
  domains?: string[];
  excludeQuery?: boolean;
  autoTrack?: boolean;
};

type EventData = {
  [key: string]: string | number | boolean | Date;
};

type ToolbirdClient = {
  track: (event?: string, data?: EventData) => void;
  init: (options: ToolbirdOptions) => void;
  setTrackingEnabled: (enabled: boolean) => void;
};

let initialized = false;
const isBrowser = typeof window !== 'undefined';
let config: ToolbirdConfig | null = null;

let currentUrl: string | null = null;
let currentRef: string | null = null;

function parseURL(url: string): string {
  try {
    const { pathname, search } = new URL(url);
    url = pathname + search;
  } catch {}
  return config?.excludeQuery ? url.split('?')[0] : url;
}

function encode(str: string | null): string | undefined {
  if (!str) {
    return undefined;
  }
  try {
    const result = decodeURI(str);
    if (result !== str) {
      return result;
    }
  } catch {
    return str;
  }
  return encodeURI(str);
}

function getStandardPayload() {
  return {
    url: encode(currentUrl),
    referrer: encode(currentRef),
    screen: `${window.screen.width}x${window.screen.height}`,
    language: window.navigator.language,
  };
}

function track(event?: string, data?: EventData) {
  if (!isBrowser || !initialized) return;
  if (config?.trackingEnabled === false) return;
  return send({
    ...getStandardPayload(),
    name: event ?? 'pageview',
    data: data,
  });
}

async function send(payload: any) {
  if (!initialized || !config) return;
  if (!config.trackingEnabled && payload.name !== 'pageview') {
    console.error('Toolbird: Tracking is disabled');
    return;
  }
  try {
    await fetch(config.endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {}
}

function init(options: ToolbirdOptions) {
  if (!isBrowser || (window as any).toolbird) return;
  if (initialized) return;

  const { document, location } = window;
  const { hostname, href } = location;
  const { referrer } = document;

  const domains = options.domains
    ? options.domains
    : options.domain
    ? [options.domain]
    : [];

  const trackingEnabled = domains.includes(hostname);
  const endpoint = options.host ?? 'https://api.toolbird.io/v1/event';
  const excludeQuery = options.excludeQuery ?? false;
  const autoTrack = options.autoTrack ?? true;

  currentUrl = parseURL(href);
  currentRef = referrer !== hostname ? referrer : null;

  config = {
    endpoint,
    excludeQuery,
    autoTrack,
    domains,
    trackingEnabled,
  };

  initialized = true;

  if (autoTrack) {
    track('pageview');
    startAutoTrack(window.history);
  }
}

function startAutoTrack(history: History) {
  function handlePathChanges() {
    const hook = (
      history: History,
      method: 'pushState' | 'replaceState',
      callback: (...args: any[]) => void
    ) => {
      const original = history[method];
      return (...args: any[]) => {
        callback.apply(null, args);
        return original.apply(history, args as any);
      };
    };

    const handlePush = (_state: any, _title: string, url: string) => {
      if (!url) return;
      currentRef = currentUrl;
      currentUrl = parseURL(url.toString());
      if (currentUrl !== currentRef) {
        setTimeout(() => track('pageview'), 300);
      }
    };

    history.pushState = hook(history, 'pushState', handlePush);
    history.replaceState = hook(history, 'replaceState', handlePush);
  }

  handlePathChanges();
}

function setTrackingEnabled(enabled: boolean) {
  if (!config) return;
  config.trackingEnabled = enabled;
}

const toolbird: ToolbirdClient = {
  init: init,
  track: track,
  setTrackingEnabled: setTrackingEnabled,
};

export default toolbird;
