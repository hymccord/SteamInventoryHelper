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
// @resource    scriptGen gen.js?v=1411141453
// @resource    scriptMarket market.script.min.js
// @resource    scriptHover hovermod.script.min.js
// @resource    cssInvent market.css
// @resource    cssScroll jquery.scrollbar.css
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getResourceURL
// ==/UserScript==

function main(callback) {
    var sGen = document.createElement('script');
    sGen.src = GM_getResourceURL('scriptGen');
    (document.head || document.documentElement).appendChild(sGen);
    sGen.onload = function () {
        sGen.parentNode.removeChild(sGen);
    };

    var script = document.createElement("script");
    script.setAttribute("src", GM_getResourceURL('scriptMarket'));
    var script2 = document.createElement("script");
    script2.setAttribute("src", GM_getResourceURL('scriptHover'));

    //script.addEventListener('load', function () {
    //    var script = document.createElement("script");
    //    script.textContent = "window.$J=jQuery.noConflict(true);(" + callback.toString() + ")();";
    //    document.body.appendChild(script);
    //}, false);

    var cssF = document.createElement('link');
    cssF.href = GM_getResourceURL('cssInvent');
    cssF.rel = 'stylesheet';
    cssF.type = 'text/css';
    (document.head || document.documentElement).appendChild(cssF);

    document.body.appendChild(script2);
    document.body.appendChild(script);
}

main();