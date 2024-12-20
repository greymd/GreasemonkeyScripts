console.aws.amazon.com// ==UserScript==
// @name         Hide AWS Account Bar
// @namespace    HideAwsAccountBar
// @version      1.0
// @description  Remove AWS Account ID / User navbar from AWS Console
// @author       @greymd
// @match        https://*.console.aws.amazon.com/*/*
// @grant        none
// ==/UserScript==

new MutationObserver(() => {
    var target = document.getElementById('nav-usernameMenu');
    if (target) {
        target.parentNode.removeChild(username);
    }
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
  attributeOldValue: true,
  characterDataOldValue: true,
});
