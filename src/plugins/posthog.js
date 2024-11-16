import posthog from "posthog-js";

const isProd = import.meta.env.PROD;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;

if (isProd && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: "https://app.posthog.com",
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        // Disable capturing in development
        posthog.opt_out_capturing();
      }
    }
  });
}

export default {
  install(app) {
    app.config.globalProperties.$posthog = posthog;
  },
};