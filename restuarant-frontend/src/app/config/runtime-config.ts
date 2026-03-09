interface AppRuntimeConfig {
  apiBaseUrl?: string;
  useMockBackend?: boolean;
}

type RuntimeHost = typeof globalThis & {
  __APP_CONFIG__?: AppRuntimeConfig;
};

const runtimeHost = globalThis as RuntimeHost;
const runtimeConfig = runtimeHost.__APP_CONFIG__ ?? {};

const normalizeApiBaseUrl = (value?: string): string => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed.replace(/\/+$/, '');
};

export const API_BASE_URL = normalizeApiBaseUrl(runtimeConfig.apiBaseUrl);
export const USE_MOCK_BACKEND = runtimeConfig.useMockBackend === true;

export const buildApiUrl = (path: string): string => {
  if (!API_BASE_URL) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
