// Global fetch wrapper to handle 401/403 and basic network errors
(function(){
  if (typeof window === 'undefined' || window.__ubFetchWrapped) return;
  const origFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    try {
      const res = await origFetch(...args);
      if (res && (res.status === 401 || res.status === 403)) {
        try { localStorage.removeItem('token'); } catch {}
        const url = new URL(window.location.href);
        if (!url.pathname.startsWith('/login')) {
          const reason = res.status === 401 ? 'session-expired' : 'forbidden';
          window.location.replace(`/login?next=${encodeURIComponent(url.pathname + url.search)}&reason=${reason}`);
        }
      }
      return res;
    } catch (e) {
      // Network failure: let callers handle it
      throw e;
    }
  };
  window.__ubFetchWrapped = true;
})();
