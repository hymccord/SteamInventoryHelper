var SIHLang = {
    noreload: "No inventory reloading when sell item",
    quickbuy: "Quick buy",
    reloadinvent: "Reload inventory (alt + R)",
    selectitem: "Sell multi items",
    cancel: "Cancel",
    sell1item: "Sell 1 item",
    sellnitem: "Sell $1 items",
    quicksell: "Quick sell this at $1",
    buymissing: "Buy missing parts",
    autoaccept: "auto accept",
    autoadjust: "auto adjust price",
    queue: {
        removeitem: "Remove from queue",
        removelower: "Remove lower",
        removehigher: "Remove higher"
    },
    sort: {
        sortitem: "Sort items",
        price: "Price"
    },
    tradingcards: {
        buyall: "Buy all",
        reload: "Reload list",
        dialogtitle: "Buy missing cards",
        showpopup: "Show buy cards dialog"
    },
    tradeoffers: {
        removeall: "Remove all",
        takeall: "Take all",
        totalprice: "Total Price",
        notrash: "No trash",
        noduplicate: "No duplicate",
        noofitems: "Number of items",
        recount: "Recount",
        youritems: "Your items",
        theiritem: "Their items"
    }
};

function ReloadLang() {
    jQuery('[data-lang]').each(function (e, i) {
        var code = jQuery(this).data('lang').split('.');
        var msg = SIHLang[code[0]];
        for (var i = 1; i < code.length; i++) {
            msg = msg[code[i]];
        }

        if (msg != null && msg) {
            jQuery(this).html(msg);
        }
    });
}

function formatNumber(totalPrice) {
    if (v_currencyformat && GetCurrencyCode && (typeof (currencyId) != 'undefined' || typeof (g_rgWalletInfo) != 'undefined')) {
        if (typeof (currencyId) != 'undefined') {
            return v_currencyformat(totalPrice * 100, GetCurrencyCode(parseInt(currencyId)))
        } else {
            return v_currencyformat(totalPrice * 100, GetCurrencyCode(g_rgWalletInfo['wallet_currency']))
        }
    }

    var totalStr = totalPrice.toFixed(2) + '';
    if (totalStr.lastIndexOf('.') == -1) {
        totalStr += '.00';
    }
    //totalStr = totalStr.replace(/(\d)(\d{3})([,\.])/, '$1,$2$3');
    return totalStr;
}

function getNumber(price) {
    var pp = /([\d\.,]+)/.exec(price.replace(/\&#.+?;/g, '').replace(' p&#1091;&#1073;.', '').replace(/\s/, '').replace(/[^\d,\.]/g, '').replace(/[^\d]$/g, ''));
    if (pp) {
        pp = pp[1].replace(/,(\d\d)$/g, '.$1').replace(/\.(\d\d\d)/g, '$1').replace(/,(\d\d\d)/g, '$1');
    } else {
        pp = 0;
    }
    return pp;
}
