declare const GEMINI_API_KEY: string;

interface AppRuntimeConfig {
  apiBaseUrl?: string;
  useMockBackend?: boolean;
}

interface Window {
  __APP_CONFIG__?: AppRuntimeConfig;
}
