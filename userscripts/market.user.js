// ==UserScript==
// @name        Steam inventory helper (Market page)
// @namespace   http://www.vplghost.com
// @version     1.5.6
// @author      VplGhost
// @description Lite version of SIH - Market main page
// @license     GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @include     http://steamcommunity.com/market
// @include     http://steamcommunity.com/market/*
// @updateURL   http://vplghost.com/Download/InventPriceCheck/market.user.js
// @downloadURL http://vplghost.com/Download/InventPriceCheck/market.user.js
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getResourceURL
// ==/UserScript==

function main(callback) {
    var sGen = document.createElement('script');
    sGen.src = 'http://vplghost.com/Download/InventPriceCheck/gen.js';
    (document.head || document.documentElement).appendChild(sGen);
    sGen.onload = function () {
        sGen.parentNode.removeChild(sGen);
    };

    var script = document.createElement("script");
    script.setAttribute("src", 'http://vplghost.com/Download/InventPriceCheck/market.script.min.js');
    var script2 = document.createElement("script");
    script2.setAttribute("src", 'http://vplghost.com/Download/InventPriceCheck/hovermod.script.min.js');

    //script.addEventListener('load', function () {
    //    var script = document.createElement("script");
    //    script.textContent = "window.$J=jQuery.noConflict(true);(" + callback.toString() + ")();";
    //    document.body.appendChild(script);
    //}, false);

    var cssF = document.createElement('link');
    cssF.href = 'http://vplghost.com/Download/InventPriceCheck/market.css';
    cssF.rel = 'stylesheet';
    cssF.type = 'text/css';
    (document.head || document.documentElement).appendChild(cssF);

    document.body.appendChild(script2);
    document.body.appendChild(script);
}

main();