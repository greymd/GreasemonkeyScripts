// ==UserScript==
// @name            Pixiv Show bookmark count
// @version         5.0.2
// @match           https://www.pixiv.net/*
// @description     !!!!! This script is fork of https://greasyfork.org/users/7945 !!!!!
// @downloadURL     https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/pixiv.net/PixivShowBookmark.user.js
// @updateURL       https://raw.githubusercontent.com/greymd/GreasemonkeyScripts/main/pixiv.net/PixivShowBookmark.user.js
// ==/UserScript==
document.head.insertAdjacentHTML('beforeend', '<style>.bmcount{text-align:center!important;padding-bottom:20px!important}.JoCpVnw .bmcount{padding-bottom:0!important}.bmcount a{height:initial!important;width:initial!important;border-radius:3px!important;padding:3px 6px 3px 18px!important;font-size:12px!important;font-weight:bold!important;text-decoration:none!important;color:#0069b1!important;background-color:#cef!important;background-image:url("data:image/svg+xml;charset=utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 12 12%22><path fill=%22%230069B1%22 d=%22M9,1 C10.6568542,1 12,2.34314575 12,4 C12,6.70659075 10.1749287,9.18504759 6.52478604,11.4353705 L6.52478518,11.4353691 C6.20304221,11.6337245 5.79695454,11.6337245 5.4752116,11.4353691 C1.82507053,9.18504652 0,6.70659017 0,4 C1.1324993e-16,2.34314575 1.34314575,1 3,1 C4.12649824,1 5.33911281,1.85202454 6,2.91822994 C6.66088719,1.85202454 7.87350176,1 9,1 Z%22/></svg>")!important;background-position:center left 6px!important;background-repeat:no-repeat!important}</style>');
new MutationObserver(() => {
  if (/pixiv\.net\/(?:(?:en\/)?tags\/|users\/(?!\d+\/(?:follow|mypixiv))|bookmark_new_illust)/.test(location.href)) {
      let a = document.querySelector('a[href^="/artworks"]');
      if (a) {
          let parent = a.parentElement;
          while (parent) {
              if (parent.tagName === 'LI') {
                  let classes = parent.className.split(/\s+/);
                  let lastClass = classes[classes.length - 1];
                  var selector = document.querySelectorAll('.' + lastClass);
                  break;
              }
              parent = parent.parentElement;
          }
      }
  }
  if (!selector || selector.length == document.querySelectorAll('.dummybmc').length || window != top) return;
  selector.forEach(async tarobj => {
    if (!tarobj.classList.contains('dummybmc')) tarobj.classList.add('dummybmc');
    if (tarobj.classList.contains('dummybmc2') || !tarobj.querySelector('a[href*="/artworks/"]') || tarobj.querySelector('.bmcount,.bookmark-count,a[href*="/bookmark_detail.php?illust_id="]')) return;
    tarobj.classList.add('dummybmc2');
    const illust_ID = /\d+/.exec(tarobj.querySelector('a[href*="/artworks/"]').href);
    const bmcount = (await (await fetch('https://www.pixiv.net/ajax/illust/' + illust_ID, {credentials: 'omit'})).json()).body.bookmarkCount;
    if (bmcount > 0) tarobj.insertAdjacentHTML('beforeend', '<div class="bmcount"><a href="/bookmark_detail.php?illust_id=' + illust_ID + '">' + bmcount + '</a></div>');
  });
}).observe(document.body, {childList: true, subtree: true});
