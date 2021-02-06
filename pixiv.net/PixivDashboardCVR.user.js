// ==UserScript==
// @name         Pixiv Dashboard CVR
// @namespace    PixivDashboardCVR
// @version      1.0
// @description  Display the conversion rate (bookmarks/viewer) on the artwork dashboard.
// @downloadURL  https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/pixiv.net/PixivDashboardCVR.user.js
// @updateURL    https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/pixiv.net/PixivDashboardCVR.user.js
// @author       @greymd
// @match        https://www.pixiv.net/dashboard/works
// @grant        none
// @run-at document-start
// ==/UserScript==

(function() {
    'use strict';
    console.log('PixivDashboardCCR: start');
    document.addEventListener("DOMContentLoaded", mainFunction);
})();

class Artwork {
    constructor() {
        this.access = null;
        this.rating = null;
        this.bookmark = null;
        this.nAccess = null;
        this.nRating = null;
        this.nBookmark = null;
    }
    display() {
        let rBookmark = Math.floor(this.nBookmark / this.nAccess * 10000) / 100;
        this.bookmark.innerHTML = this.bookmark.innerHTML + ' (' + rBookmark + '%)';
        let rRating = Math.floor(this.nRating / this.nAccess * 10000) / 100;
        this.rating.innerHTML = this.rating.innerHTML + ' (' + rRating + '%)';
    }
}

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

function mainFunction() {
    console.log('PixivDashboardCCR: main');
    var list = document.getElementsByClassName('sc-1b2i4p6-25');
    if(!(list.length > 1) || list === undefined) {
        window.setTimeout(mainFunction,500);
        return;
    }
    let artwork = null;
    for (let item of list) {
        var cn = item.className + "";
        // New artwork
        if(cn.includes('jjigWp')) {
            if (artwork !== null) {
                artwork.display();
            }
            artwork = new Artwork();
        }
        // Artwork attributes
        if(cn.includes('ChCpN')) {
            if (!item.hasChildNodes()) {
                continue;
            }
            if (!item.childNodes[0].hasChildNodes()) {
                continue;
            }
            var elem = item.childNodes[0].childNodes[0];
            if (!isElement(elem)) {
                continue;
            }
            if (!elem.hasAttribute('href')) {
                continue;
            }
            var attr = elem.getAttribute("href");
            if (attr.startsWith("/dashboard/report/artworks?section=access")) {
                artwork.access = elem;
                artwork.nAccess = elem.innerHTML.replace(',','');
            } else if(attr.startsWith("/dashboard/report/artworks?section=rating")) {
                artwork.rating = elem;
                artwork.nRating = elem.innerHTML.replace(',','');;
            } else if(attr.startsWith("/bookmark_detail")) {
                artwork.bookmark = elem;
                artwork.nBookmark = elem.innerHTML.replace(',','');;
            }
        }
    }
    artwork.display();
}
