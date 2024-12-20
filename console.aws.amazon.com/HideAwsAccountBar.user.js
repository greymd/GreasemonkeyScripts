// ==UserScript==
// @name         Hide AWS Account Bar
// @namespace    HideAwsAccountBar
// @version      1.3
// @description  Remove AWS Account ID / User navbar from AWS Console
// @author       @greymd
// @match        https://*.console.aws.amazon.com/*/*
// @grant        none
// @downloadURL     https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/console.aws.amazon.com/HideAwsAccountBar.user.js
// @updateURL       https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/console.aws.amazon.com/HideAwsAccountBar.user.js
// ==/UserScript==

new MutationObserver(() => {
  var username = document.getElementById('nav-usernameMenu');
  if (username) {
      username.parentNode.removeChild(username);
  }
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
  attributeOldValue: true,
  characterDataOldValue: true,
});
