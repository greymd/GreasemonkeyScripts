// ==UserScript==
// @name         TVerCopyURL
// @namespace    TVerCopyURL
// @version      1.0
// @description  Copy URL of TVer
// @downloadURL  https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/tver.jp/TVerCopyURL.user.js
// @updateURL    https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/tver.jp/TVerCopyURL.user.js
// @author       @greymd
// @match        https://tver.jp/corner/*
// @grant        GM_setClipboard
// ==/UserScript==

let debug = false;

function isElement(obj) {
  try {
    return obj instanceof HTMLElement;
  }
  catch(e){
    return (typeof obj==="object") &&
      (obj.nodeType===1) && (typeof obj.style === "object") &&
      (typeof obj.ownerDocument ==="object");
  }
}

function isButtonExisting() {
  let b = document.getElementById('TVerCopyURL')
  return isElement(b)
}

new MutationObserver(() => {
  let dataAccount = ''
  let dataAccountElem = null
  let dataVideoId = ''
  let dataVideoIdElem = null
  if(debug) console.log('TVerCopyURL: start');
  if (isButtonExisting()) {
    return;
  }
  if(/tver\.jp\/corner\/.*/.test(location.href)) {
    dataAccountElem = document.getElementById('abcPlayer_html5_api')
    dataVideoIdElem = document.getElementById('abcPlayer')
  } else {
      return;
  }
  if (isElement(dataVideoIdElem) && isElement(dataAccountElem)) {
    dataAccount = dataAccountElem.getAttribute('data-account')
    dataVideoId = dataVideoIdElem.getAttribute('data-video-id')
  } else {
    return;
  }
  if (!/^\d+$/.test(dataAccount) || !/^\d+$/.test(dataVideoId)) {
    if(debug) console.log("TVerCopyURL: " + dataAccount)
    if(debug) console.log("TVerCopyURL: " + dataVideoId)
    return;
  }
  let selector = document.querySelector("#contents > div.bg > section:nth-child(1) > div > div.companionad-main > div.btnarea > div")
  if(debug) console.log('TVerCopyURL: insertButton');
  let button = document.createElement("button");
  let url = "http://players.brightcove.net/" + dataAccount + "/default_default/index.html?videoId=" + dataVideoId
  console.log(url)
  button.innerHTML = "TVerCopyURL";
  button.setAttribute("style","color: white")
  button.setAttribute("id","TVerCopyURL")
  button.addEventListener("click", function() {
    GM_setClipboard(url);
    button.innerHTML = "Copied!    "
  }, false);
  selector.appendChild(button);
}).observe(document.body, {childList: true, subtree: true});
