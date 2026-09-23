// Promotes the non-blocking Google Fonts stylesheet (loaded with media="print")
// to all media once it has loaded, so the webfonts stop blocking first paint
// without an inline onload handler. Kept external so the CSP can forbid
// script-src 'unsafe-inline'.
(function () {
  var link = document.getElementById('gfonts');
  if (!link) return;
  var show = function () {
    link.media = 'all';
  };
  if (link.sheet) show();
  else link.addEventListener('load', show, { once: true });
})();
