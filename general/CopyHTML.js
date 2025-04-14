// ==UserScript==
// @name         Copy HTML on Kemono.su
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add a button to copy the full HTML content of the page
// @author       You
// @match        *
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // ボタンの作成
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy HTML';
    copyBtn.id = 'copy-html-btn';
    document.body.appendChild(copyBtn);

    // スタイルの追加
    GM_addStyle(`
        #copy-html-btn {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            padding: 8px 12px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        #copy-html-btn:hover {
            background-color: #0056b3;
        }
    `);

    // クリックイベント
    copyBtn.addEventListener('click', async () => {
        try {
            const htmlContent = document.documentElement.outerHTML;
            await navigator.clipboard.writeText(htmlContent);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy HTML', 2000);
        } catch (err) {
            alert('コピーに失敗しました: ' + err);
        }
    });
})();
