/* global chrome document */
var sGen = document.createElement('script');
sGen.src = chrome.extension.getURL('js/lang/_gen.js');
(document.head || document.documentElement).appendChild(sGen);

var cssF = document.createElement('link');
cssF.href = chrome.extension.getURL('css/listings.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

sGen.onload = function () {
    sGen.parentNode.removeChild(sGen);
};

chrome.storage.sync.get({
    sound: 'offersound.ogg',
    resultnumber: 10,
    shownotify: true,
    quickbuybuttons: false,
    showbookmarks: true,
    show_float_value_listings: true,
    bookmarkscategories: {},
    gpdelayscc: 2500,
    gpdelayerr: 5000,
    agp_hover: true,
    agp_gem: false,
    agp_sticker: false,
    lang: ''
}, function (items) {
    chrome.storage.local.get({
        bookmarks: {}
    }, function (subitems) {
        var actualCode = ['window.replaceBuy = ' + items.quickbuybuttons + ';',
        'window.SIHID = \'' + chrome.runtime.id + '\';',
        'window.noOfRows = ' + items.resultnumber + ';',
        'window.showbookmarks = ' + items.showbookmarks + ';',
        'window.bookmarkscategories = ' + JSON.stringify(items.bookmarkscategories) + ';',
        'window.bookmarks = ' + JSON.stringify(subitems.bookmarks) + ';',
        'window.bookmarksLink = \'' + chrome.extension.getURL('/html/bookmarks.html') + '\';',
        'window.gpdelayscc = ' + items.gpdelayscc + ';',
        'window.gpdelayerr = ' + items.gpdelayerr + ';',
        'window.agp_hover = ' + items.agp_hover + ';',
        'window.show_float_value_listings = ' + items.show_float_value_listings + ';',
        'window.agp_gem = ' + items.agp_gem + ';',
        'window.agp_sticker = ' + items.agp_sticker + ';'
        ].join('\r\n');

        var sData = document.createElement('script');
        sData.textContent = actualCode;
        (document.head || document.documentElement).appendChild(sData);
        sData.parentNode.removeChild(sData);
    });

    var sLang = document.createElement('script');
    if (items.lang == '') {
        sLang.src = chrome.extension.getURL('js/lang/' + chrome.i18n.getMessage("langcode") + '.js');
    } else {
        sLang.src = chrome.extension.getURL('js/lang/' + items.lang + '.js');
    }

    (document.head || document.documentElement).appendChild(sLang);
    sLang.onload = function () {
        sLang.parentNode.removeChild(sLang);
    };
});

var sPriceQueue = document.createElement('script');
sPriceQueue.src = chrome.extension.getURL('js/PriceQueue.js');
(document.head || document.documentElement).appendChild(sPriceQueue);
sPriceQueue.onload = function () {
    sPriceQueue.parentNode.removeChild(sPriceQueue);
};

var cssPQ = document.createElement('link');
cssPQ.href = chrome.extension.getURL('css/priceQueue.css');
cssPQ.rel = 'stylesheet';
cssPQ.type = 'text/css';
(document.head || document.documentElement).appendChild(cssPQ);

var sCommon = document.createElement('script');
sCommon.src = chrome.extension.getURL('js/hovermod.script.js');
(document.head || document.documentElement).appendChild(sCommon);
sCommon.onload = function () {
    var sOffer = document.createElement('script');
    sOffer.src = chrome.extension.getURL('js/listing.script.js');
    (document.head || document.documentElement).appendChild(sOffer);
    sOffer.onload = function () {
        sOffer.parentNode.removeChild(sOffer);
    };

    sCommon.parentNode.removeChild(sCommon);
};
