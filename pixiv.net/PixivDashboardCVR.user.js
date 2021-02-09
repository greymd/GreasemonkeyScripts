// ==UserScript==
// @name         Pixiv Dashboard CVR
// @namespace    PixivDashboardCVR
// @version      1.1
// @description  Display the conversion rate (bookmarks/viewer) on the artwork dashboard.
// @downloadURL  https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/pixiv.net/PixivDashboardCVR.user.js
// @updateURL    https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/pixiv.net/PixivDashboardCVR.user.js
// @author       @greymd
// @match        https://www.pixiv.net/*
// @grant        none
// ==/UserScript==

let debug = false;

class Artwork {
    constructor() {
        this.artworkId = null
        this.access = null;
        this.rating = null;
        this.bookmark = null;
        this.nAccess = null;
        this.nRating = null;
        this.nBookmark = null;
    }
    display() {
        if(this.artworkId === null) return;
        if(this.access === null) return;
        if(this.rating === null) return;
        if(this.bookmark === null) return;
        if(this.nAccess === null) return;
        if(this.nRating === null) return;
        if(this.nBookmark === null) return;
        let bookmarkId = "cvr-bookmark-" + this.artworkId;
        let ratingId = "cvr-rating-" + this.artworkId;
        let rBookmark = Math.floor(this.nBookmark / this.nAccess * 10000) / 100;
        if(debug) console.log('PixivDashboardCVR: display');
        if(!document.getElementById(bookmarkId)) {
            var divBookmark = document.createElement('div');
            divBookmark.setAttribute("id", bookmarkId);
            divBookmark.innerHTML = ' (' + rBookmark + '%)';
            this.bookmark.insertBefore(divBookmark);
        }

        if(!document.getElementById(ratingId)) {
            let rRating = Math.floor(this.nRating / this.nAccess * 10000) / 100;
            var divRating = document.createElement('div');
            divRating.setAttribute("id", ratingId);
            divRating.innerHTML = ' (' + rRating + '%)';
            this.rating.insertBefore(divRating);
        }
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


new MutationObserver(() => {
  if(debug) console.log('PixivDashboardCVR: start');
  if(/pixiv\.net\/dashboard\/work/.test(location.href)) {
    var list = document.getElementsByClassName('ChCpN');
  } else {
      return;
  }
  if(list === undefined || window != top) {
    return;
  }
  if (list.length < 1) {
    return;
  }
  // var selector = document.getElementsByClassName('sc-1b2i4p6-25');
  var selector = document.getElementsByClassName('sc-1b2i4p6-2 CHyMi');
  insertCVR(selector);
}).observe(document.body, {childList: true, subtree: true});

async function insertCVR(selector) {
    if(debug) console.log('PixivDashboardCVR: insertCVR');
    let artwork = null;
    for (let item of selector[0].childNodes) {
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
                artwork.artworkId = attr.replace(/^.*id=/, '');
                artwork.access = elem;
                artwork.nAccess = elem.innerHTML.replace(',','');
            } else if(attr.startsWith("/dashboard/report/artworks?section=rating")) {
                artwork.rating = elem;
                artwork.nRating = elem.innerHTML.replace(',','');
            } else if(attr.startsWith("/bookmark_detail")) {
                artwork.bookmark = elem;
                artwork.nBookmark = elem.innerHTML.replace(',','');
            }
            if(debug) console.log(artwork);
        }
    }
    artwork.display();
}
