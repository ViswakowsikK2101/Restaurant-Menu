(function (global) {
  var existing = global.__APP_CONFIG__ || {};
  var defaultApiBaseUrl = '';
  var hasApiBaseUrl = typeof existing.apiBaseUrl === 'string' && existing.apiBaseUrl.trim().length > 0;

  global.__APP_CONFIG__ = {
    apiBaseUrl: hasApiBaseUrl ? existing.apiBaseUrl : defaultApiBaseUrl,
    // Default to mock API so static deployments work even when backend hosting is unavailable.
    useMockBackend: existing.useMockBackend !== false
  };
})(window);
