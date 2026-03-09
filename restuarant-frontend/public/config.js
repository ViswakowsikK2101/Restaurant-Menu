(function (global) {
  var existing = global.__APP_CONFIG__ || {};
  // Example: "https://your-service-name.up.railway.app"
  var defaultApiBaseUrl = 'https://restaurant-menu-production-e48c.up.railway.app';

  global.__APP_CONFIG__ = {
    apiBaseUrl: typeof existing.apiBaseUrl === 'string' ? existing.apiBaseUrl : defaultApiBaseUrl,
    useMockBackend: existing.useMockBackend === true
  };
})(window);
