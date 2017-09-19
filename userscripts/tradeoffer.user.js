// ==UserScript==
// @name        Steam inventory helper (Trade offer page)
// @namespace   http://www.vplghost.com
// @version     1.5.3
// @author      VplGhost
// @description Lite version of SIH - Trade offer page
// @license     GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @include     https://steamcommunity.com/tradeoffer/*
// @include     http://steamcommunity.com/tradeoffer/*
// @include     http://steamcommunity.com/trade/*
// @updateURL   http://vplghost.com/Download/InventPriceCheck/tradeoffer.user.js
// @downloadURL http://vplghost.com/Download/InventPriceCheck/tradeoffer.user.js
// @resource    scriptGen gen.js
// @resource    scriptTrade tradeoffer.script.min.js
// @resource    scriptHover hovermod.script.min.js
// @resource    cssInvent inventscript.css
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getResourceURL
// ==/UserScript==

function addJQuery(callback) {
    var sGen = document.createElement('script');
    sGen.setAttribute("src", GM_getResourceURL('scriptGen'));
    //sGen.src = GM_getResourceURL('scriptGen');//'http://vplghost.com/Download/InventPriceCheck/_gen.js';
    //(document.head || document.documentElement).appendChild(sGen);
    sGen.onload = function () {
        sGen.parentNode.removeChild(sGen);
    };

    var actualCode = ['window.offerdelayinterval = 100;',
        'window.offerdelay = true;',
        'window.autocheckofferprice = true;'
    ].join('\r\n');

    var scriptOpt = document.createElement('script');
    scriptOpt.textContent = actualCode;
    (document.head || document.documentElement).appendChild(scriptOpt);
    scriptOpt.parentNode.removeChild(scriptOpt);

    var script = document.createElement("script");
    script.setAttribute("src", GM_getResourceURL('scriptTrade'));
    //script.setAttribute("src", 'http://vplghost.com/Download/InventPriceCheck/tradeoffer.script.min.js');

    var script2 = document.createElement("script");
    script2.setAttribute("src", GM_getResourceURL('scriptHover'));
    //script2.setAttribute("src", 'http://vplghost.com/Download/InventPriceCheck/hovermod.script.min.js');

    var cssF = document.createElement('link');
    cssF.href = GM_getResourceURL('cssInvent');//'http://vplghost.com/Download/InventPriceCheck/inventscript.css';
    cssF.rel = 'stylesheet';
    cssF.type = 'text/css';
    (document.head || document.documentElement).appendChild(cssF);

    //script.addEventListener('load', function () {
    //    var script = document.createElement("script");
    //    script.textContent = "window.$J=jQuery.noConflict(true);(" + callback.toString() + ")();";
    //    document.body.appendChild(script);
    //}, false);

    document.body.appendChild(sGen);
    document.body.appendChild(script);
    document.body.appendChild(script2);
}

var main = function () {

};

// load jQuery and execute the main function
addJQuery(main);