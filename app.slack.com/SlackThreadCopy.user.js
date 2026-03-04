// ==UserScript==
// @name         Slack Thread Copy
// @namespace    https://github.com/greymd/GreasemonkeyScripts
// @version      0.2.0
// @description  Copy thread conversation as plain text to clipboard
// @author       greymd
// @match        https://app.slack.com/*
// @grant        GM_setClipboard
// @downloadURL  https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/app.slack.com/SlackThreadCopy.user.js
// @updateURL    https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/app.slack.com/SlackThreadCopy.user.js
// ==/UserScript==

(function () {
  "use strict";

  const DEBUG = false;
  function log(...args) {
    if (DEBUG) console.log("[SlackThreadCopy]", ...args);
  }

  const COPY_BUTTON_ID = "slack-thread-copy-button";
  const COPY_ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--dt_color-content-sec)" aria-hidden="true"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>';

  /**
   * Converts a Slack message body node (rich text / block kit) to plain text with simple markdown.
   * Handles: mentions (data-member-label), links, blockquotes, inline code, bold, italic, emoji, line breaks.
   */
  function messageBodyToMarkdown(bodyRoot) {
    if (!bodyRoot) return "";

    function escapeBackticks(s) {
      return s.replace(/`/g, "`\u200b");
    }

    function walk(node, out) {
      if (node.nodeType === Node.TEXT_NODE) {
        out.push(node.textContent);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node;
      const tag = el.tagName.toLowerCase();

      if (el.getAttribute?.("data-stringify-ignore") === "true") return;

      if (tag === "br" || el.classList?.contains("c-mrkdwn__br")) {
        out.push("\n");
        return;
      }

      if (tag === "blockquote" && el.classList?.contains("c-mrkdwn__quote")) {
        const inner = [];
        for (const child of el.childNodes) walk(child, inner);
        const text = inner.join("").trim();
        out.push("\n> " + text.split("\n").join("\n> ") + "\n");
        return;
      }

      if (tag === "code" && el.classList?.contains("c-mrkdwn__code")) {
        const inner = [];
        for (const child of el.childNodes) walk(child, inner);
        out.push("`" + escapeBackticks(inner.join("").trim()) + "`");
        return;
      }

      if ((tag === "pre" && el.classList?.contains("c-mrkdwn__pre")) || el.getAttribute?.("data-stringify-type") === "pre") {
        const inner = [];
        for (const child of el.childNodes) walk(child, inner);
        const text = inner.join("").trim();
        if (text) out.push("\n```\n" + text + "\n```\n");
        return;
      }

      if (tag === "ul" && el.classList?.contains("p-rich_text_list")) {
        const items = el.querySelectorAll(":scope > li");
        for (const li of items) {
          const inner = [];
          for (const child of li.childNodes) walk(child, inner);
          out.push("\n- " + inner.join("").trim());
        }
        out.push("\n");
        return;
      }

      if (tag === "li" && el.closest?.("ul.p-rich_text_list")) {
        return;
      }

      if (el.classList?.contains("c-rich_text_expand_button")) {
        return;
      }

      if (tag === "b" || el.getAttribute?.("data-stringify-type") === "bold") {
        const inner = [];
        for (const child of el.childNodes) walk(child, inner);
        out.push("**" + inner.join("").trim() + "**");
        return;
      }

      if (tag === "i" || el.getAttribute?.("data-stringify-type") === "italic") {
        const inner = [];
        for (const child of el.childNodes) walk(child, inner);
        out.push("*" + inner.join("").trim() + "*");
        return;
      }

      if (tag === "a") {
        const mentionLabel = el.getAttribute("data-member-label") ?? el.getAttribute("data-stringify-label");
        if (mentionLabel) {
          out.push(mentionLabel);
          return;
        }
        const href = el.getAttribute("href") ?? el.getAttribute("data-stringify-link") ?? "";
        const inner = [];
        for (const child of el.childNodes) walk(child, inner);
        const text = inner.join("").trim() || href;
        if (href && text !== href) {
          out.push("[" + text + "](" + href + ")");
        } else {
          out.push(text || href);
        }
        return;
      }

      if (tag === "img" && (el.getAttribute("data-stringify-type") === "emoji" || el.classList?.contains("c-emoji"))) {
        const emoji = el.getAttribute("data-stringify-emoji") ?? el.getAttribute("alt") ?? "";
        if (emoji) out.push(emoji);
        return;
      }

      for (const child of el.childNodes) {
        walk(child, out);
      }
    }

    const out = [];
    walk(bodyRoot, out);
    return out
      .join("")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  /**
   * Extracts sender name from a message container (optional in compact view).
   */
  function getSender(container) {
    const btn = container.querySelector('[data-qa="message_sender_name"]');
    return btn ? btn.textContent.trim() : "";
  }

  /**
   * Extracts timestamp label from a message container.
   */
  /**
   * Formats Unix timestamp (seconds) as "YYYY/MM/DD HH:mm:ss TZ" in local timezone.
   */
  function formatTimestampUnix(unixSeconds) {
    const d = new Date(Math.floor(Number(unixSeconds)) * 1000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    const tzParts = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).formatToParts(d);
    const tz = tzParts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return `${y}/${m}/${day} ${h}:${min}:${s} ${tz}`;
  }

  function getTimestamp(container) {
    const label = container.querySelector('[data-qa="timestamp_label"]');
    if (!label) return "";
    const anchor = label.closest("a");
    const dataTs = anchor?.getAttribute("data-ts");
    if (dataTs != null) {
      const unixSeconds = parseFloat(dataTs);
      if (!Number.isNaN(unixSeconds)) {
        return formatTimestampUnix(unixSeconds);
      }
    }
    return label.textContent.trim();
  }

  /**
   * Gets the message body root element ([data-qa="message-text"]) from a message container.
   */
  function getMessageBodyRoot(container) {
    return container.querySelector('[data-qa="message-text"]');
  }

  /**
   * Gets attachment text blocks (e.g. "From a thread" reply snippet) and converts them to markdown.
   */
  /**
   * Prefixes each line with "> " (blockquote style for quoted/embedded messages from other threads).
   */
  function formatAsQuoted(text) {
    if (!text || !text.trim()) return "";
    return text.split("\n").map((line) => "> " + line).join("\n");
  }

  function getAttachmentBodies(container) {
    const rows = container.querySelectorAll('[data-qa="message_attachment_slack_msg_text"]');
    return Array.from(rows)
      .map((row) => messageBodyToMarkdown(row))
      .filter(Boolean)
      .map(formatAsQuoted);
  }

  /**
   * Converts a single message container to a block: "--- sender [date]\n\nBody"
   */
  function messageContainerToMarkdown(container) {
    const sender = getSender(container);
    const timestamp = getTimestamp(container);
    const bodyRoot = getMessageBodyRoot(container);
    let body = messageBodyToMarkdown(bodyRoot);
    const attachmentBodies = getAttachmentBodies(container);
    if (attachmentBodies.length) {
      body = [body, ...attachmentBodies].filter(Boolean).join("\n\n");
    }

    if (!timestamp && !sender && !body) return "";
    const header = sender ? `--- ${sender} [${timestamp}]` : `--- [${timestamp}]`;
    return `${header}\n\n${body}`.replace(/\n{4,}/g, "\n\n\n");
  }

  /**
   * Returns the thread list root element (the virtual list wrapper).
   */
  function getThreadListRoot() {
    return (
      document.querySelector("[id*='thread-list-Thread']") ??
      document.querySelector("[id*='thread-list']")
    );
  }

  /**
   * Finds the scrollable element inside the thread list (viewport that has scroll).
   * Checks root and descendants; returns the scrollable one with the largest scrollHeight.
   */
  function getThreadScrollElement() {
    const root = getThreadListRoot();
    log("getThreadScrollElement: root =", root, "id =", root?.id);
    if (!root) return null;

    const listEl = root.querySelector("[data-qa='slack_kit_list']");
    const candidates = [
      root,
      root.querySelector(".c-virtual_list"),
      root.querySelector("[data-qa='slack_kit_scrollbar']"),
      root.querySelector(".c-scrollbar__hider"),
      root.querySelector(".c-scrollbar__child"),
      listEl?.parentElement,
      listEl?.parentElement?.parentElement,
    ].filter(Boolean);

    let best = null;
    for (const el of candidates) {
      const sh = el.scrollHeight;
      const ch = el.clientHeight;
      const scrollable = sh > ch;
      log("  candidate", el.className?.slice?.(0, 50), "scrollHeight =", sh, "clientHeight =", ch, "scrollable =", scrollable);
      if (scrollable && (!best || el.scrollHeight > best.scrollHeight)) {
        best = el;
      }
    }

    if (!best) {
      const walk = (node, depth) => {
        if (depth > 8) return;
        if (node.nodeType !== 1) return;
        const el = node;
        if (el.scrollHeight > el.clientHeight && (!best || el.scrollHeight > best.scrollHeight)) {
          best = el;
        }
        for (const child of el.children) walk(child, depth + 1);
      };
      for (const child of root.children) walk(child, 0);
      if (best) log("  found scrollable via walk:", best.className?.slice?.(0, 50));
    }

    log("getThreadScrollElement: best =", best, "scrollHeight =", best?.scrollHeight);
    return best ?? root;
  }

  let scrollThreadCollected = null;

  /**
   * Scrolls the thread list in steps, collecting message content at each step (virtual list unmounts off-screen items).
   */
  async function scrollThreadToLoadAll() {
    const scrollEl = getThreadScrollElement();
    log("scrollThreadToLoadAll: scrollEl =", !!scrollEl, "scrollHeight =", scrollEl?.scrollHeight, "clientHeight =", scrollEl?.clientHeight);
    if (!scrollEl || scrollEl.scrollHeight <= scrollEl.clientHeight) {
      log("scrollThreadToLoadAll: skip (no scroll or no element)");
      return;
    }
    const end = scrollEl.scrollHeight - scrollEl.clientHeight;
    const step = Math.max(250, Math.floor(scrollEl.clientHeight * 0.6));
    const delayMs = 100;
    log("scrollThreadToLoadAll: end =", end, "step =", step);
    scrollEl.scrollTop = step;
    await new Promise((r) => setTimeout(r, 50));
    const afterFirst = scrollEl.scrollTop;
    log("scrollThreadToLoadAll: after first scroll scrollTop =", afterFirst);
    if (afterFirst === 0 && end > 0) {
      log("scrollThreadToLoadAll: scrollTop did not change - element may not be scrollable (overflow?)");
    }
    const collectedByTs = new Map();
    for (let pos = 0; pos <= end; pos += step) {
      scrollEl.scrollTop = Math.min(pos, end);
      await new Promise((r) => setTimeout(r, delayMs));
      for (const container of getThreadMessageContainers()) {
        const ts = container.getAttribute("data-msg-ts");
        if (ts && !collectedByTs.has(ts)) {
          collectedByTs.set(ts, messageContainerToMarkdown(container));
        }
      }
    }
    scrollEl.scrollTop = end;
    await new Promise((r) => setTimeout(r, 200));
    for (const container of getThreadMessageContainers()) {
      const ts = container.getAttribute("data-msg-ts");
      if (ts && !collectedByTs.has(ts)) {
        collectedByTs.set(ts, messageContainerToMarkdown(container));
      }
    }
    scrollThreadCollected = Array.from(collectedByTs.entries())
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      .map(([, md]) => md)
      .filter(Boolean);
    log("scrollThreadToLoadAll: collected", scrollThreadCollected.length, "messages");
  }

  /**
   * Waits a bit for Slack to finish rendering after scroll.
   */
  function waitForVirtualListRender() {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }

  /**
   * Finds the thread list root and collects all message containers.
   * Call after scrollThreadToLoadAll() + waitForVirtualListRender() to get full thread.
   */
  function getThreadMessageContainers() {
    const threadListRoot = getThreadListRoot();
    if (threadListRoot) {
      const list = threadListRoot.querySelectorAll('[data-qa="message_container"]');
      return Array.from(list);
    }
    const header = document.querySelector(".p-flexpane_header__primary");
    if (!header) return [];
    const pane = header.parentElement;
    const list = pane?.querySelectorAll('[data-qa="message_container"]');
    return list ? Array.from(list) : [];
  }

  /**
   * For parts with "--- [date]" (no sender), replace with "--- lastSender [date]".
   */
  function fillMissingSenders(parts) {
    let lastSender = null;
    return parts.map((part) => {
      const lines = part.split("\n");
      const firstLine = lines[0] ?? "";
      const matchWithSender = firstLine.match(/^--- (.+) \[(.+)\]$/);
      const matchNoSender = firstLine.match(/^--- \[(.+)\]$/);
      if (matchWithSender) {
        lastSender = matchWithSender[1];
      } else if (matchNoSender && lastSender != null) {
        lines[0] = `--- ${lastSender} [${matchNoSender[1]}]`;
      }
      return lines.join("\n");
    });
  }

  /**
   * Builds full thread as plain text with simple markdown.
   * Scrolls through the list while collecting so we get all messages (virtual list drops off-screen items).
   */
  async function threadToMarkdown() {
    scrollThreadCollected = null;
    await scrollThreadToLoadAll();
    await waitForVirtualListRender();
    let parts = scrollThreadCollected ?? getThreadMessageContainers().map(messageContainerToMarkdown).filter(Boolean);
    parts = fillMissingSenders(parts);
    return Array.isArray(parts) ? parts.join("\n\n") : "";
  }

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

    button.addEventListener("click", async () => {
      const content = await threadToMarkdown();
      log("copy click: threadToMarkdown length =", content?.length ?? 0);
      const text =
        content ||
        [
          "(No thread messages found)",
          "Open a thread and try again.",
        ].join("\n");
      GM_setClipboard(text, "text");
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
