// ==UserScript==
// @name         X Ad Hider
// @namespace    https://github.com/
// @version      1.0.1
// @description  Hide ads on X (Twitter)
// @author       greymd
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/x.com/XAdHider.user.js
// @updateURL    https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/x.com/XAdHider.user.js
// ==/UserScript==

(function () {
  "use strict";

  const DEBUG = false;

  function log(...args) {
    if (DEBUG) {
      console.log(...args);
    }
  }

  function hideAd(span) {
    const article = span.closest("article");
    if (article) {
      article.style.display = "none";
      log("Ad hidden:", article);
    }
  }

  function checkForAdsAndHide() {
    const timelineDivs = document.querySelectorAll('div[aria-label^="Timeline"]');
    timelineDivs.forEach(timeline => {
      const spans = timeline.querySelectorAll("span");
      spans.forEach(span => {
        if (span.textContent.trim() === "Ad") {
          hideAd(span);
        }
      });
    });
  }

  function setupObserver() {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.addedNodes.length > 0) {
          checkForAdsAndHide();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Run once at start and then set up DOM observer
  checkForAdsAndHide();
  setupObserver();
})();
