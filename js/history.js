var sGen = document.createElement('script');
sGen.src = chrome.extension.getURL('js/lang/_gen.js');
(document.head || document.documentElement).appendChild(sGen);
sGen.onload = function () {
    sGen.parentNode.removeChild(sGen);
};

var cssF = document.createElement('link');
cssF.href = chrome.extension.getURL('css/history.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

chrome.storage.sync.get({
    lang: ''
}, function (items) {
    var sLang = document.createElement('script');
    if (items.lang == '') {
        sLang.src = chrome.extension.getURL('js/lang/' + chrome.i18n.getMessage("langcode") + '.js');
    } else {
        sLang.src = chrome.extension.getURL('js/lang/' + items.lang + '.js');
    }

    (document.head || document.documentElement).appendChild(sLang);
    sLang.onload = function () {
        sLang.parentNode.removeChild(sLang);

        var sHistory = document.createElement('script');
        sHistory.src = chrome.extension.getURL('js/history.script.js');
        (document.head || document.documentElement).appendChild(sHistory);
        sHistory.onload = function () {
          sHistory.parentNode.removeChild(sHistory);
        };
    };
});
