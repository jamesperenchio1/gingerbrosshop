/**
 * Analytics bootstrap — GA4 + Meta Pixel.
 *
 * Lives in an external file rather than inline in index.html so the Content
 * Security Policy doesn't need `script-src 'unsafe-inline'`, which was
 * defeating most of the point of having a CSP at all.
 *
 * Both queue APIs are defined immediately so events fired during page boot are
 * buffered, but the vendor scripts are only injected after `load` — they should
 * never compete with the app bundle for bandwidth on the critical path.
 */
(function () {
  var GA_ID = 'G-WYM1PC2CL0';
  var FB_PIXEL_ID = '927558480333349';

  // GA4 — dataLayer buffers calls made before gtag.js arrives.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID);

  // Meta Pixel — fbq queues until fbevents.js loads.
  !function (f, b, e, v, n) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
  }(window, document, 'script');
  fbq('init', FB_PIXEL_ID);
  fbq('track', 'PageView');

  function inject(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  function loadVendors() {
    inject('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
    inject('https://connect.facebook.net/en_US/fbevents.js');
  }

  if (document.readyState === 'complete') loadVendors();
  else window.addEventListener('load', loadVendors, { once: true });
})();
