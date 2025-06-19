// ==UserScript==
// @name         X Ad Hider
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Hide ads on X (Twitter)
// @author       greymd
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function ($) {
  "use strict";

  const DEBUG = false;
  const maxAttempts = 20;

  let observer;

  function log(...args) {
    if (DEBUG) {
      console.log(...args);
    }
  }

  function hideAd(adSpan) {
    log("Hiding ad:", adSpan);
    const article = $(adSpan).closest("article");
    if (article.length > 0) {
      article.css("display", "none");
      log("Ad hidden successfully");
    } else {
      log("Could not find article for adSpan");
    }
  }

  function checkForAdsAndHide() {
    const ads = $('div[aria-label^="Timeline"] span').filter(function () {
      return $(this).text().trim() === "Ad";
    });
    ads.each(function (index, adSpan) {
      hideAd(adSpan);
    });
  }

  function setupObserver() {
    observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.addedNodes.length) {
          checkForAdsAndHide();
        }
      }
    });

    observer.observe(document, { childList: true, subtree: true });
  }

  checkForAdsAndHide();
  setupObserver();
})(jQuery);
