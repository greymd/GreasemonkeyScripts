// ==UserScript==
// @name         TVerCopyURL
// @namespace    TVerCopyURL
// @version      1.1
// @description  Copy URL of TVer
// @downloadURL  https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/tver.jp/TVerCopyURL.user.js
// @updateURL    https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/tver.jp/TVerCopyURL.user.js
// @author       @greymd
// @match        https://tver.jp/episodes/*
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
    if(debug) console.log('TVerCopyURL: isButtonExisting() is true. exit.');
    return;
  }
  if(/tver\.jp\/episodes\/.*/.test(location.href)) {
    dataAccountElem = document.getElementsByTagName('video-js')[0]
    dataVideoIdElem = document.getElementsByTagName('video-js')[0]
  } else {
      if(debug) console.log('TVerCopyURL: location is not still proper. exit.');
      return;
  }
  if (isElement(dataVideoIdElem) && isElement(dataAccountElem)) {
    dataAccount = dataAccountElem.getAttribute('data-account')
    dataVideoId = dataVideoIdElem.getAttribute('data-video-id')
  } else {
      if(debug) console.log('TVerCopyURL: There are no necessary elements. exit.');
    return;
  }
  if (!/^\d+$/.test(dataAccount) || !/^\d+$/.test(dataVideoId)) {
    if(debug) console.log("TVerCopyURL: dataAccount = " + dataAccount)
    if(debug) console.log("TVerCopyURL: dataVideoId = " + dataVideoId)
    return;
  }
  // let selector = document.querySelector("#__next > div > div:nth-of-type(1) > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2)")
  if(debug) console.log('TVerCopyURL: insertButton');
  let button = document.createElement("button");
  let url = "http://players.brightcove.net/" + dataAccount + "/default_default/index.html?videoId=" + dataVideoId
  console.log(url)
  button.innerHTML = "TVerCopyURL";
  button.setAttribute("style","position: fixed; top: 0; left: 0; width: 100px; height: 50px;")
  button.setAttribute("id","TVerCopyURL")
  button.addEventListener("click", function() {
    GM_setClipboard(url);
    button.innerHTML = "Copied!    "
  }, false);
  document.body.appendChild(button);
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
  attributeOldValue: true,
  characterDataOldValue: true,
});
