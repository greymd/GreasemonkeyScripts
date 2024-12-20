console.aws.amazon.com// ==UserScript==
// @name         Hide AWS Account Bar
// @namespace    HideAwsAccountBar
// @version      1.1
// @description  Remove AWS Account ID / User navbar from AWS Console
// @author       @greymd
// @match        https://*.console.aws.amazon.com/*/*
// @grant        none
// @downloadURL     https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/console.aws.amazon.com/HideAwsAccountBar.user.js
// @updateURL       https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/console.aws.amazon.com/HideAwsAccountBar.user.js
// ==/UserScript==

new MutationObserver(() => {
    var target = document.getElementById('nav-usernameMenu');
    if (target) {
        target.parentNode.removeChild(target);
    }
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
  attributeOldValue: true,
  characterDataOldValue: true,
});
