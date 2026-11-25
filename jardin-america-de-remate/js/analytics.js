(function () {
  function noop() {}

  var measurementId = String(window.ANALYTICS_GA4_MEASUREMENT_ID || "").trim();
  if (!measurementId) {
    window.trackEvent = window.trackEvent || noop;
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", measurementId, {
    send_page_view: true,
    page_path: window.location.pathname,
    page_title: document.title,
  });

  window.trackEvent = function trackEvent(name, params) {
    try {
      gtag("event", String(name || "custom_event"), params || {});
    } catch (error) {
      // No rompemos UI por errores de tracking.
    }
  };
})();

