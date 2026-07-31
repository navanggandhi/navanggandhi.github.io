/* Cookie consent banner + Google Consent Mode v2 opt-in.
   Shared by all pages. Analytics stays denied until the visitor clicks Accept.
   The <head> gtag snippet sets consent 'default' denied and re-applies a stored
   'granted' choice on load; this file only handles the banner UI + the update. */
(function () {
  "use strict";
  var KEY = "cookie-consent";
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (stored === "granted" || stored === "denied") return; // choice already made

  function setConsent(granted) {
    try { localStorage.setItem(KEY, granted ? "granted" : "denied"); } catch (e) {}
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied"
      });
    }
  }

  var css =
    ".cookie-consent{position:fixed;z-index:99999;left:50%;bottom:22px;transform:translate(-50%,150%);" +
    "width:min(680px,calc(100% - 32px));display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;" +
    "padding:16px 20px;border-radius:16px;background:rgba(12,12,20,.92);color:#f5f5fa;" +
    "border:1px solid rgba(255,255,255,.14);box-shadow:0 20px 60px rgba(0,0,0,.45);" +
    "-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);" +
    "font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;opacity:0;" +
    "transition:transform .4s cubic-bezier(.2,.8,.2,1),opacity .4s ease}" +
    ".cookie-consent.is-visible{transform:translate(-50%,0);opacity:1}" +
    ".cookie-consent__text{margin:0;flex:1 1 300px;font-size:.9rem;line-height:1.5;color:#d7d8e2}" +
    ".cookie-consent__actions{display:flex;gap:10px;margin-left:auto}" +
    ".cookie-consent__btn{cursor:pointer;font:600 .86rem/1 system-ui,sans-serif;padding:11px 20px;" +
    "border-radius:999px;border:0;color:#fff;background:linear-gradient(120deg,#8b5cf6,#ec4899 55%,#22d3ee);" +
    "transition:transform .2s ease,opacity .2s ease}" +
    ".cookie-consent__btn:hover{transform:translateY(-1px);opacity:.95}" +
    ".cookie-consent__btn--ghost{background:transparent;border:1px solid rgba(255,255,255,.24);color:#d7d8e2}" +
    ".cookie-consent__btn--ghost:hover{color:#fff;border-color:rgba(255,255,255,.5)}" +
    "@media (max-width:520px){.cookie-consent__actions{margin-left:0;width:100%}.cookie-consent__btn{flex:1}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement("div");
  bar.className = "cookie-consent";
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", "Cookie consent");
  bar.innerHTML =
    '<p class="cookie-consent__text">This site uses Google Analytics cookies to measure visits — ' +
    "no advertising and no cross-site tracking. You can decline and still use the site normally.</p>" +
    '<div class="cookie-consent__actions">' +
    '<button type="button" class="cookie-consent__btn cookie-consent__btn--ghost" data-decline>Decline</button>' +
    '<button type="button" class="cookie-consent__btn" data-accept>Accept</button>' +
    "</div>";
  document.body.appendChild(bar);
  requestAnimationFrame(function () { bar.classList.add("is-visible"); });

  function close(granted) {
    setConsent(granted);
    bar.classList.remove("is-visible");
    setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 400);
  }
  bar.querySelector("[data-accept]").addEventListener("click", function () { close(true); });
  bar.querySelector("[data-decline]").addEventListener("click", function () { close(false); });
})();
