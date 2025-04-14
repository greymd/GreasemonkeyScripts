// ==UserScript==
// @name         Download Images on Kemono.su
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Download images as "title_##.ext" with 1s delay between each using Blob+fetch. Title from h1.post__title > span. For kemono.su only.
// @author       greymd
// @match        https://kemono.su/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const dlBtn = document.createElement('button');
    dlBtn.textContent = 'Download Images';
    dlBtn.id = 'dl-images-btn';
    document.body.appendChild(dlBtn);

    GM_addStyle(`
        #dl-images-btn {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            padding: 8px 12px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        #dl-images-btn:hover {
            background-color: #218838;
        }
    `);

    const sanitize = (str) => str.replace(/[/\\?%*:|"<>]/g, '_').trim();

    dlBtn.addEventListener('click', async () => {
        const links = Array.from(document.querySelectorAll('a.fileThumb'));
        if (links.length === 0) {
            alert('Image not found');
            return;
        }

        let titleElem = document.querySelector('h1.post__title span');
        let title = titleElem ? titleElem.textContent.trim() : 'Untitled';
        title = sanitize(title);

        dlBtn.textContent = 'Downloading...';

        for (let i = 0; i < links.length; i++) {
            const url = links[i].href;
            const ext = url.split('.').pop().split(/\#|\?/)[0];
            const filename = `${title}_${String(i + 1).padStart(2, '0')}.${ext}`;

            try {
                const res = await fetch(url);
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                URL.revokeObjectURL(blobUrl);
            } catch (err) {
                console.error('Failed to download:', url, err);
            }

            await sleep(1000);
        }

        dlBtn.textContent = 'Done!';
        setTimeout(() => dlBtn.textContent = 'Download Images', 3000);
    });
})();
