// ==UserScript==
// @name         Slack Thread Copy
// @namespace    https://github.com/greymd/GreasemonkeyScripts
// @version      0.1.0
// @description  Copy thread conversation as plain text to clipboard
// @author       greymd
// @match        https://app.slack.com/*
// @grant        GM_setClipboard
// @downloadURL  https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/app.slack.com/SlackThreadCopy.user.js
// @updateURL    https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/app.slack.com/SlackThreadCopy.user.js
// ==/UserScript==

(function () {
  "use strict";

  const COPY_BUTTON_ID = "slack-thread-copy-button";
  const COPY_ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--dt_color-content-sec)" aria-hidden="true"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>';

  function createCopyButton() {
    const span = document.createElement("span");
    span.className = "";
    span.setAttribute("data-sk", "tooltip_parent");

    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "c-button-unstyled c-icon_button c-icon_button--size_medium c-icon_button--default";
    button.setAttribute("data-qa", "thread_copy_button");
    button.setAttribute("aria-label", "Copy thread");
    button.setAttribute("tabindex", "0");
    button.id = COPY_BUTTON_ID;
    button.innerHTML = COPY_ICON_SVG;

    button.addEventListener("click", () => {
      const dummyContent = [
        "(Dummy content)",
        "This is a test for thread copy.",
        "The actual thread body will be fetched in the next phase.",
      ].join("\n");
      GM_setClipboard(dummyContent, "text");
    });

    span.appendChild(button);
    return span;
  }

  function tryInjectCopyButton() {
    const header = document.querySelector(".p-flexpane_header__primary");
    if (!header) return;

    if (document.getElementById(COPY_BUTTON_ID)) return;

    const primaryContent = header.querySelector(
      ".p-flexpane_header__primary_content"
    );
    if (!primaryContent) return;

    const closeButton = primaryContent.querySelector(
      '[data-qa="close_flexpane"]'
    );
    const copyButtonWrapper = createCopyButton();
    if (closeButton) {
      primaryContent.insertBefore(copyButtonWrapper, closeButton);
    } else {
      primaryContent.appendChild(copyButtonWrapper);
    }
  }

  const observer = new MutationObserver(() => {
    tryInjectCopyButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryInjectCopyButton);
  } else {
    tryInjectCopyButton();
  }
})();
