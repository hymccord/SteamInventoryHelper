var apiItems = {};
var priceTimer = null;
var loading = false;
var lastExtPricesProvider = null;
var itemsInTrades = [];
var takeButtonsJson = {
    "440": {
        "Keys": {"Type": "TF_T"},
        "Craft items": {"Type": "Craft Item"}
    },
    "570": {
        "Rares": {"Quality": "unique", "Rarity": "Rarity_Rare", "Type": "wearable"},
        "Keys": {"Quality": "unique", "Rarity": "Rarity_Common", "Type": "key"}
    },
    "730": {
        "Keys": {"Type": "CSGO_Tool_WeaponCase_KeyTag"}
    },
    "753": {
        "Trading cards": {"item_class": "item_class_2"}
    }
};

var UpdateTotal = function () {
    //GetTotalPrice();
};
var tt = 0;
var lastSort = null;
var GetTotalPrice = function () {
    //console.log(tt++);
    var flag = false;
    if ($J('#trade_yours .offerheader > .total').length == 0) {
        $J('#trade_yours .offerheader').append('<div class="total"></total>');
    }

    if ($J('#trade_theirs .offerheader > .total').length == 0) {
        $J('#trade_theirs .offerheader').append('<div class="total"></total>');
    }

    //$J('#trade_yours .total,#trade_theirs .total').html('calculating');

    $J('.trade_right .item').each(function (i, el) {
        //console.log(el.rgItem);
        if ($J(this).has('.price-tag').length || !el.rgItem)
            return;
        var divPricetag = $J('<div class="price-tag">');
        if (!el.rgItem.marketable) {
            divPricetag.html('No price');
            divPricetag.addClass('no-price');
            $J(this).append(divPricetag);
            return;
        }
        if (el.rgItem.appid == 730) {
            AddItemDescription(el);
        }

        if (!el.rgItem.lowestPrice) {
            if (el.rgItem.market_hash_name) {
                getLowestPriceHandler(el.rgItem, null, function (item) {
                    //GetTotalPrice();
                    $J('.trade_right .item').each(function (ci, ce) {
                        if ($J(ce).has('.price-tag').length) return;
                        AddItemDescription(ce);
                        var citem = ce.rgItem;
                        if (citem.appid == item.appid && item.market_hash_name == citem.market_hash_name) {
                            citem.lowestPrice = item.lowestPrice;
                            var divPricetag = $J('<div class="price-tag">');
                            divPricetag.html(citem.lowestPrice);
                            if (citem.lowestPrice == 'Can\'t get price') {
                                divPricetag.addClass('no-price');
                            }

                            $J(citem.element).append(divPricetag);
                        }
                    });
                    SetTotal();
                    //if (window.offerdelay)
                    //    priceTimer = window.setTimeout('GetTotalPrice()', window.offerdelayinterval);
                });

                flag = true;
                //if (window.offerdelay)
                //    return false;
                //else
                //    return;
                return;
            }
        }

        divPricetag.html(el.rgItem.lowestPrice);
        if (el.rgItem.lowestPrice == 'Can\'t get price') {
            divPricetag.addClass('no-price');
        }
        $J(this).append(divPricetag);
        //priceTimer = window.setTimeout('GetTotalPrice()', 10);
        flag = false;
        //return false;
    });

    //if (flag) return;
    SetTotal();
};

var AddItemDescription = function (el) {
    var rgItem = el.rgItem;
    if ($J(this).has('.des-tag').length) {
        return;
    }

    if (el.rgItem.appid == 730) {
        var exterior = '';
        for (var i = 0; i < rgItem.tags.length; i++) {
            if (rgItem.tags[i].category == 'Exterior') {
                exterior = rgItem.tags[i].name;
            }
        }
        if (exterior != '') {
            var divDestag = $J('<div class="des-tag">');
            if (rgItem.float_value >= 0) {
                exterior += ' (' + rgItem.float_value.toFixed(3) + (rgItem.dopplerPhase ? ' ' + dopplerPhaseNameShort[rgItem.dopplerPhase] : '') + ')';
            }

            divDestag.html(exterior);
            $J(el).append(divDestag);
        }
    }
};

var SetTotal = function () {
    var yourTotal = 0, yourTotalnotax = 0;
    var yourExt = 0, theirExt = 0;
    var exttotal = [{}, {}];

    $J('#trade_yours .price-tag').each(function (i, e) {
        var item = $J(this).parent('.item')[0].rgItem;
        var text = $J(this).text();
        var price = getNumber(text);

        price = parseInt(price * 100);
        yourTotal += price;

        var publisherFee = typeof item.market_fee != 'undefined' ? item.market_fee : g_rgWalletInfo['wallet_publisher_fee_percent_default'] || 0.1;
        var feeInfo = CalculateFeeAmount(price, publisherFee);
        yourTotalnotax += price ? price - feeInfo.fees : 0;

    });

    var steamTotal = [
      '<div class="steam-total">',
        '<span class="total-title">Steam (minus fees):</span>',
        '<div class="total-value">',
          formatNumber(yourTotal / 100),
          '<span class="total-value-fee"> (',
            formatNumber(yourTotalnotax / 100),
          ')</span>',
        '</div>',
      '</div>'
    ].join('');
    $J('#trade_yours .total').html(steamTotal);
    // $J('#trade_yours .total').html('' + formatNumber(yourTotal / 100) + ' (' + formatNumber(yourTotalnotax / 100) + ')');

    if (extprice) {
        $J('#trade_yours .item ').each(function (i, e) {
            var item = $J(this)[0].rgItem;
            if (item.extprice) {
                if (item.extcrr) {
                    if (!exttotal[0][item.extcrr]) {
                        exttotal[0][item.extcrr] = 0;
                    }
                    exttotal[0][item.extcrr] += item.extprice;
                } else {
                    yourExt += item.extprice;
                }
            }
        });
        var totalstr = formatNumber(yourExt);
        for (var ppp in exttotal[0]) {
            totalstr += '; ' + exttotal[0][ppp] + ' ' + ppp;
        }
        var extTotal = [
          '<div class="ext-total">',
            '<span class="total-title">',
              lastExtPricesProvider || 'Ext. Price',
            ':</span>',
            '<div class="total-value">',
              totalstr,
            '</div>',
          '</div>'
        ].join('');
        $J('#trade_yours .total').append(extTotal);
        // $J('#trade_yours .total').append('<span class="ext-total">' + totalstr + '</span>');
    }

    if ($J('#trade_yours .price-tag.no-price').length > 0) {
        $J('#trade_yours .total').addClass('warning');
    } else {
        $J('#trade_yours .total').removeClass('warning');
    }

    var theirTotal = 0, theirTotalnotax = 0;
    $J('#trade_theirs .price-tag').each(function (i, e) {
        var item = $J(this).parent('.item')[0].rgItem;
        var text = $J(this).text();
        var price = getNumber(text);

        price = parseInt(price * 100);
        theirTotal += price;

        var publisherFee = typeof item.market_fee != 'undefined' ? item.market_fee : g_rgWalletInfo['wallet_publisher_fee_percent_default'] || 0.1;
        var feeInfo = CalculateFeeAmount(price, publisherFee);
        theirTotalnotax += price ? price - feeInfo.fees : 0;

    });

    var steamTotal = [
      '<div class="steam-total">',
        '<span class="total-title">Steam (minus fees):</span>',
        '<div class="total-value">',
          formatNumber(theirTotal / 100),
          '<span class="total-value-fee"> (',
            formatNumber(theirTotalnotax / 100),
          ')</span>',
        '</div>',
      '</div>'
    ].join('');
    $J('#trade_theirs .total').html(steamTotal);
    // $J('#trade_theirs .total').html('' + formatNumber(theirTotal / 100) + ' (' + formatNumber(theirTotalnotax / 100) + ')');

    if (extprice) {
        $J('#trade_theirs .item ').each(function (i, e) {
            var item = $J(this)[0].rgItem;
            if (item.extprice) {
                if (item.extcrr) {
                    if (!exttotal[1][item.extcrr]) {
                        exttotal[1][item.extcrr] = 0;
                    }
                    exttotal[1][item.extcrr] += item.extprice;
                } else {
                    theirExt += item.extprice;
                }
            }
        });
        var totalstr = formatNumber(theirExt);
        for (var ppp in exttotal[1]) {
            totalstr += '; ' + exttotal[1][ppp] + ' ' + ppp;
        }
        var extTotal = [
          '<div class="ext-total">',
            '<span class="total-title">',
              lastExtPricesProvider || 'Ext. Price',
            ':</span>',
            '<div class="total-value">',
              totalstr,
            '</div>',
          '</div>'
        ].join('');
        $J('#trade_theirs .total').append(extTotal);
        // $J('#trade_theirs .total').append('<span class="ext-total">' + totalstr + '</span>');
    }

    if ($J('#trade_theirs .price-tag.no-price').length > 0) {
        $J('#trade_theirs .total').addClass('warning');
    } else {
        $J('#trade_theirs .total').removeClass('warning');
    }
};

var itemsCount = null;
var lastCatname = null;
var SetCount = function () {
    var tx = '';
    //var myItem = { 'rare': 0, 'ucm': 0, 'com': 0, 'key': 0 };
    //var theirItem = { 'rare': 0, 'ucm': 0, 'com': 0, 'key': 0 };
    itemsCount = {};

    $J('#your_slots .trade_slot .item').each(function (el) {
        var rgItem = $J(this)[0].rgItem;
        for (var itag = 0; itag < rgItem.tags.length; itag++) {
            var tag = rgItem.tags[itag];
            if (typeof (itemsCount[tag.category_name]) == 'undefined') {
                itemsCount[tag.category_name] = {};
            }

            if (typeof (itemsCount[tag.category_name][tag.internal_name]) == 'undefined') {
                itemsCount[tag.category_name][tag.internal_name] = {
                    name: tag.name,
                    color: tag.color,
                    mycount: 0,
                    theircount: 0
                };
            }

            itemsCount[tag.category_name][tag.internal_name].mycount += 1;
        }
        //return;

        //var id = $J(this).attr('id');
        //if (CheckItem($J(this)[0].rgItem, { "Rarity": "Rarity_Rare", "Type": "DOTA_WearableType_Wearable" }))
        //    myItem.rare++;
        //else if (CheckItem($J(this)[0].rgItem, { "Rarity": "Rarity_Uncommon", "Type": "DOTA_WearableType_Wearable" }))
        //    myItem.ucm++;
        //else if (CheckItem($J(this)[0].rgItem, { "Rarity": "Rarity_Common", "Type": "DOTA_WearableType_Wearable" }))
        //    myItem.com++;
        //else if (CheckItem($J(this)[0].rgItem, { "Type": "DOTA_WearableType_Treasure_Key" }))
        //    myItem.key++;
    });

    $J('#their_slots .trade_slot .item').each(function (el) {
        var rgItem = $J(this)[0].rgItem;
        for (var itag = 0; itag < rgItem.tags.length; itag++) {
            var tag = rgItem.tags[itag];
            if (typeof (itemsCount[tag.category_name]) == 'undefined') {
                itemsCount[tag.category_name] = {};
            }

            if (typeof (itemsCount[tag.category_name][tag.internal_name]) == 'undefined') {
                itemsCount[tag.category_name][tag.internal_name] = {
                    name: tag.name,
                    color: tag.color,
                    mycount: 0,
                    theircount: 0
                };
            }

            itemsCount[tag.category_name][tag.internal_name].theircount += 1;
        }
    });

    //tx += 'Your items count: ' + jQuery('#your_slots .trade_slot .item').length;//+ ' (' + myItem.rare + ', ' + myItem.ucm + ', ' + myItem.com + ', ' + myItem.key + ')';

    //tx += '<br />Their items count: ' + jQuery('#their_slots .trade_slot .item').length;// + ' (' + theirItem.rare + ', ' + theirItem.ucm + ', ' + theirItem.com + ', ' + theirItem.key + ')';

    //console.log(itemsCount);

    jQuery('#sp_count').html(tx);
    jQuery('#divCats').empty();
    for (var catname in itemsCount) {
        if (lastCatname == null) {
            lastCatname = catname;
        }

        var link = $J('<a href="javascript:void(0)">');
        var innername = catname;
        link.html(innername);
        link.click(function () {
            ShowCount($J(this).text());
        });
        $J('#divCats').append(link);
    }
    if (lastCatname) {
        ShowCount(lastCatname);
    } else {

    }
};

var ShowCount = function (category_name) {
    //console.log(category_name);
    var myCount = SIHLang.tradeoffers.youritems + ' (' + jQuery('#your_slots .trade_slot .item').length + '):<br />',
        theirCount = SIHLang.tradeoffers.theiritem + ' (' + jQuery('#their_slots .trade_slot .item').length + '):<br />';

    if (itemsCount[category_name]) {
        for (var iname in itemsCount[category_name]) {
            var cat = itemsCount[category_name][iname];
            if (cat.mycount) {
                myCount += '<span style="color:#' + cat.color + '">' + cat.name + ' (' + cat.mycount + ' <a href="#" class="remove-category" title="Remove all" data-slot="your" data-category="' + category_name + '" data-name="' + iname + '" >x</a>)</span> ';
            }

            if (cat.theircount) {
                theirCount += '<span style="color:#' + cat.color + '">' + cat.name + ' (' + cat.theircount + ' <a href="#" class="remove-category" title="Remove all" data-slot="their" data-category="' + category_name + '" data-name="' + iname + '" >x</a>)</span> ';
            }
        }
        lastCatname = category_name;
        SetCookie('lastCategoryCount', lastCatname, 365 * 10, '/tradeoffer/');
    }
    $J('#divDetail').html(myCount + '<br />' + theirCount);
};

var RemoveItems = function (link) {
    if (g_bReadOnly) return;
    if (link != null) {
        var isYour = link.data('slot') === 'your' ? true : false;
        var category_name = link.data('category'), iname = link.data('name');
        var selector = isYour ? '#your_slots' : '#their_slots';
        $J(selector + ' .trade_slot .item').each(function (el) {
            var rgItem = $J(this)[0].rgItem;
            var elItem = $J(this)[0];
            for (var itag = 0; itag < rgItem.tags.length; itag++) {
                var tag = rgItem.tags[itag];

                if (tag.category_name === category_name && tag.internal_name === iname) {
                    if (BIsInTradeSlot(elItem)) {
                        CleanupSlot(elItem.parentNode.parentNode);
                    }

                    if (rgItem.is_stackable) {
                        SetStackableItemInTrade(rgItem, 0);
                        return;
                    }
                    RevertItem(rgItem);
                    rgItem.homeElement.down('.slot_actionmenu_button').show();
                    GTradeStateManager.RemoveItemFromTrade(rgItem);
                }
            }
        });
    } else {
        var isYour = $J('#inventory_select_your_inventory').hasClass('active') ? true : false;
        var selector = isYour ? '#your_slots' : '#their_slots';
        $J(selector + ' .trade_slot .item').each(function (el) {
            var rgItem = $J(this)[0].rgItem;
            var elItem = $J(this)[0];

            if (BIsInTradeSlot(elItem)) {
                CleanupSlot(elItem.parentNode.parentNode);
            }

            if (rgItem.is_stackable) {
                SetStackableItemInTrade(rgItem, 0);
                return;
            }
            RevertItem(rgItem);
            rgItem.homeElement.down('.slot_actionmenu_button').show();
            GTradeStateManager.RemoveItemFromTrade(rgItem);
        });
    }
    SetCount();
    // Remove empty slots after moving items into inventory list
    setTimeout(function () {
        $J('#your_slots').siblings('.itemHolder.trade_slot').remove();
        $J('#their_slots').siblings('.itemHolder.trade_slot').remove();
    }, 100);
};

var RemoveItemsByClass = function (classname) {
    if (g_bReadOnly) return;
    var isYour = $J('#inventory_select_your_inventory').hasClass('active') ? true : false;
    var selector = isYour ? '#your_slots' : '#their_slots';

    $J(selector + ' .trade_slot .item.' + classname).each(function (el) {
        var rgItem = $J(this)[0].rgItem;
        var elItem = $J(this)[0];
        if (BIsInTradeSlot(elItem)) {
            CleanupSlot(elItem.parentNode.parentNode);
        }

        if (rgItem.is_stackable) {
            SetStackableItemInTrade(rgItem, 0);
            return;
        }
        RevertItem(rgItem);
        rgItem.homeElement.down('.slot_actionmenu_button').show();
        GTradeStateManager.RemoveItemFromTrade(rgItem);
    });

    SetCount();
    setTimeout(function () {
        $J('.itemHolder.trade_slot[id=""]').remove();
    }, 300);
};

var RemoveItemsByPrice = function (lowerthan) {
    if (g_bReadOnly) return;
    var isYour = $J('#inventory_select_your_inventory').hasClass('active') ? true : false;
    var selector = isYour ? '#your_slots' : '#their_slots';
    var priceToCompare = parseFloat($J('#txt_remove_queue').val());
    $J(selector + ' .trade_slot .item').each(function (el) {
        var rgItem = $J(this)[0].rgItem;
        var elItem = $J(this)[0];

        if (rgItem && (rgItem.lowestPrice || rgItem.extprice)) {
            var price = rgItem.lowestPrice ? parseFloat(getNumber(rgItem.lowestPrice)) : rgItem.extprice;
            if ((price * lowerthan) > (priceToCompare * lowerthan)) {
                if (BIsInTradeSlot(elItem)) {
                    CleanupSlot(elItem.parentNode.parentNode);
                }

                if (rgItem.is_stackable) {
                    SetStackableItemInTrade(rgItem, 0);
                    return;
                }
                RevertItem(rgItem);
                rgItem.homeElement.down('.slot_actionmenu_button').show();
                GTradeStateManager.RemoveItemFromTrade(rgItem);
            }
        }
    });

    SetCount();
    setTimeout(function () {
        $J('.itemHolder.trade_slot[id=""]').remove();
    }, 300);
};

var RemoveItemsByEmptyPrice = function () {
    if (g_bReadOnly) return;
    var isYour = $J('#inventory_select_your_inventory').hasClass('active') ? true : false;
    var selector = isYour ? '#your_slots' : '#their_slots';

    $J(selector + ' .trade_slot .item').each(function (el) {
        var rgItem = $J(this)[0].rgItem;
        var elItem = $J(this)[0];

        if (rgItem && (rgItem.lowestPrice || rgItem.extprice)) {
            var price = rgItem.lowestPrice ? parseFloat(getNumber(rgItem.lowestPrice)) : rgItem.extprice;

            if (!price) {
                if (BIsInTradeSlot(elItem)) {
                    CleanupSlot(elItem.parentNode.parentNode);
                }

                if (rgItem.is_stackable) {
                    SetStackableItemInTrade(rgItem, 0);
                    return;
                }

                RevertItem(rgItem);
                rgItem.homeElement.down('.slot_actionmenu_button').show();
                GTradeStateManager.RemoveItemFromTrade(rgItem);
            }
        }
    });

    SetCount();
    setTimeout(function () {
        $J('.itemHolder.trade_slot[id=""]').remove();
    }, 300);
};

var CheckItem = function (rgItem, filter) {
    if (rgItem == null) return false;
    if (filter == null) return true;
    if (jQuery.isNumeric(filter))
        return filter == rgItem.classid;

    var match = true, haveMatch = false;

    for (var i = 0; i < rgItem.tags.length; i++) {
        if (filter[rgItem.tags[i].category] && rgItem.tags[i].internal_name != filter[rgItem.tags[i].category]) {
            match = false;
        }

        if (filter[rgItem.tags[i].category] && rgItem.tags[i].internal_name == filter[rgItem.tags[i].category])
            haveMatch = true;
        //for (var j = 0; j < filter.length; j++) {
        //    if (rgItem.tags[i].category == filter[j].category && rgItem.tags[i].name != filter[j].name)
        //        match = false;
        //}
    }

    return match && haveMatch;
};

var CheckItemByPrice = function (rgItem, higher) {
    if (rgItem == null) {
        return false;
    }
    var pricenum = parseFloat($J('#txt_remove_queue').val());
    if (!pricenum || !rgItem.extprice) return false;
    if ((pricenum < rgItem.extprice && higher) || (pricenum > rgItem.extprice && !higher)) {
        return true;
    }
    return false;
};

var Trash = ["Axe", "Omniknight", "Morphling", "Witch Doctor", "Broodmother"];

var CheckTrashHero = function (rgItem) {
    if (!rgItem || !rgItem.tags) return false;
    for (var i = 0; i < rgItem.tags.length; i++) {
        if (rgItem.tags[i].category == "Hero") {
            for (var j = 0; j < Trash.length; j++) {
                if (rgItem.tags[i].name === Trash[j]) {
                    return true;
                }
            }
        }
    }

    return false;
};

var CheckIntrade = function (Item) {
    if (!Item) {
        return false;
    }
    if ($J(Item).hasClass('item-in-trade')) {
        return true;
    }

    return false;
};

var CheckDuplicate = function (rgItem) {
    if (!rgItem || !rgItem.market_hash_name) {
        return false;
    }
    var hashName = rgItem.market_hash_name;
    var isTheirs = $J('#inventory_select_their_inventory').hasClass('active');
    var idslot = isTheirs ? '#their_slots' : '#your_slots';
    var isDupe = false;
    var dup = $J('#Txt_Dup').val();
    var idup = parseInt(dup);
    $J(idslot + ' .item').each(function () {
        if (this.rgItem && this.rgItem.market_hash_name == hashName) {
            idup--;
            if (idup == 0) {
                return false;
            }
        }
    });

    return (idup == 0);
};

var TakeMany = false;
var MoveItemWithCount = function (elItem) {
    var val = $J('#Txt_Num').val(), t = (val == '' ? 0 : eval(val));
    if ((val == '' && g_bTradeOffer) || parseInt(t) > 0) {
        if ($J('#Ck_SkipIntrade').is(':checked')) {
            if (CheckIntrade(elItem)) {
                return;
            }
        }

        var dup = $J('#Txt_Dup').val();
        var idup = parseInt(dup);
        if (idup && idup > 0) {
            if (CheckDuplicate(elItem.rgItem)) {
                return;
            }
        }
        MoveItemToTrade(elItem);
    } else {
        return;
    }
    if (val != '') {
        var a = parseInt(t) - 1;
        $J('#Txt_Num').val(a);
    }
};

var MoveItem = function (filter) {
    if (g_bReadOnly) {
        return false;
    }
    if (g_bTradeOffer) {
        TakeMany = true;
        var list = '.inventory_ctn:visible div.inventory_page .itemHolder[style!="display: none;"] .item';
        if ($J('#Txt_Num').val() == '') {
            list = '.inventory_ctn:visible div.inventory_page .itemHolder:visible .item';
        }
        var jList = $J(list);
        //if (jList.length > 50) {
        //    jList.slice(0, 50).each(function (el) {
        //        var rgItem = $J(this)[0].rgItem;
        //        if (filter === null || CheckItem(rgItem, filter))
        //            MoveItemWithCount($J(this)[0]);
        //    });
        //    window.setTimeout(function () {
        //        MoveItem(filter);
        //    }, 200);
        //}
        //else {
        jList.each(function (el) {
            var rgItem = $J(this)[0].rgItem;
            if (filter && filter.byprice != null && CheckItemByPrice(rgItem, filter.byprice)) {
                MoveItemWithCount($J(this)[0]);
            } else if (filter === null || CheckItem(rgItem, filter)) {
                MoveItemWithCount($J(this)[0]);
            }
        });
        //}
        SetCount();
        if (window.autocheckofferprice) {
            GetTotalPrice();
        }
        TakeMany = false;
    } else {
        var stop = true;
        lastFilter = filter;
        $J('.inventory_ctn:visible div.inventory_page .itemHolder[style!="display: none;"] .item').each(function (el) {
            var rgItem = $J(this)[0].rgItem;
            if ((filter === null || CheckItem(rgItem, filter)) && stop) {
                MoveItemWithCount($J(this)[0]);
                stop = false;
                return;
            }
        });
    }
};

var SortItem = function (asc) {
    lastSort = asc;
    var order = (asc ? 1 : -1);
    var sortFunc = function (a, b) {
        var aobj = $J(a).find('.item')[0].rgItem,
            bobj = $J(b).find('.item')[0].rgItem;
        var an = parseFloat(getNumber($J(a).find('.price-tag').text())),
            bn = parseFloat(getNumber($J(b).find('.price-tag').text()));

        if (!an && aobj.extprice) {
            an = aobj.extprice;
        }

        if (!bn && bobj.extprice) {
            bn = bobj.extprice;
        }

        if (an === bn) {
            an = aobj.market_hash_name;
            bn = bobj.market_hash_name;
        }

        if (an === bn) {
            an = a.id;
            bn = b.id;
        }

        if (an > bn) {
            return 1 * order;
        }
        if (an < bn) {
            return -1 * order;
        }
        return 0;
    }

    var your_elems = $J('#your_slots .itemHolder.trade_slot:has(.price-tag,.p-price)');
    your_elems.sort(sortFunc);
    your_elems.detach().prependTo($J('#your_slots'));

    var their_elems = $J('#their_slots .itemHolder.trade_slot:has(.price-tag,.p-price)');
    their_elems.sort(sortFunc);
    their_elems.detach().prependTo($J('#their_slots'));
};

var lastFilter = null;
var orgTradePageSelectInventory = null;

var ModifyItemDisplay = function () {
    UserThem.OnLoadInventoryComplete = UserYou.OnLoadInventoryComplete = function (transport, appid, contextid) {
        this.cLoadsInFlight--;
        if (transport.responseJSON && transport.responseJSON.success) {
            var inventory = new CInventory(this, appid, contextid, transport.responseJSON.rgInventory, transport.responseJSON.rgCurrency);

            this.addInventory(inventory);
            var elInventory = inventory.getInventoryElement();
            elInventory.hide();
            $('inventories').insert(elInventory);

            var elTags = inventory.getTagContainer();
            var elTagHolder = $('filter_options');
            if (elTagHolder && elTags) {
                elTags.hide();
                elTagHolder.insert(elTags);
                elTagHolder.addClassName('filter_collapsed');
            }

            var classArr = {};
            for (var ii in transport.responseJSON.rgInventory) {
                var rgItem = transport.responseJSON.rgInventory[ii];
                if (!classArr[rgItem.classid]) {
                    classArr[rgItem.classid] = 1;
                } else {
                    classArr[rgItem.classid]++;
                }
            }

            for (var ii in transport.responseJSON.rgInventory) {
                var rgItem = transport.responseJSON.rgInventory[ii];

                if (classArr[rgItem.classid] && classArr[rgItem.classid] > 1 && rgItem.descriptions) {
                    if (!rgItem.descriptions[0].iscount) {
                        rgItem.descriptions.unshift({
                            iscount: true,
                            type: 'html',
                            value: 'Number owned: <i style="color: rgb(153, 204, 255); font-size: 16px">' + classArr[rgItem.classid] + '</i>'
                        });
                    }
                }
            }

            if (appid == 570) {
                const me = this;
                chrome.runtime.sendMessage(SIHID, { type: 'GetPlayerItems', steamid: me.strSteamId, appid }, function (response) {
                    if (!apiItems[me.strSteamId])
                        apiItems[me.strSteamId] = {};

                    if (response.success && response.data) {
                        apiItems[me.strSteamId][appid] = response.data;
                        $J.each(apiItems[me.strSteamId][appid], function (i, o) {
                            var elIt = $J('div.item[id=item570_2_' + o.id + ']');
                            if (o.equipped) {
                                elIt.addClass('item-equipped');
                                elIt.each(function (idx, elem) {
                                    elem.rgItem.equipped = true;
                                });
                            }
                            elIt.each(function (idx, elem) {
                                elem.rgItem.defindex = o.defindex;
                            });
                        });
                    }
                });
            } else if (appid == 440) {
                const me = this;
                chrome.runtime.sendMessage(SIHID, { type: 'GetPlayerItems', steamid: me.strSteamId, appid }, function (response) {
                    if (!apiItems[me.strSteamId])
                        apiItems[me.strSteamId] = {};

                    if (response.success && response.data) {
                        apiItems[me.strSteamId][appid] = response.data;
                        $J.each(apiItems[me.strSteamId][appid], function (i, o) {
                            var elIt = $J('div.item[id=item440_2_' + o.id + ']');
                            if (o.equipped) {
                                elIt.addClass('item-equipped');
                                elIt.each(function (idx, elem) {
                                    elem.rgItem.equipped = true;
                                });
                            }
                            elIt.each(function (idx, elem) {
                                elem.rgItem.defindex = o.defindex;
                                elem.rgItem.apivalue = o;
                            });
                        });
                    }

                    var _api = ExternalPrices[g_ActiveInventory.appid].apis[parseInt($J('#cb_ExternalPrices').val())];
                    if (_api && _api.api && _api.api.SetPrices) {
                        _api.api.SetPrices(g_ActiveInventory.appid);
                    }
                });
            }

            window.setTimeout(function () {
                $J.each(inventory.rgInventory, function () {
                    var rg = this;
                    if (!rg || !bookmarkeditems) {
                        return;
                    }
                    var bookmarkname = rg.appid + '/' + encodeURIComponent(rg.market_hash_name).replace('(', '%28').replace(')', '%29');
                    if (bookmarkeditems[bookmarkname]) {
                        $J('div.item[id=item' + rg.appid + '_' + rg.contextid + '_' + rg.id + ']').addClass('bookmarked');
                    }
                });
            }, 200);

            ///External prices
            if (window.extprice) {
                if (ExternalPrices[appid]) {
                    var lastAPIIdx = GetCookie('lastext_' + appid);
                    if (lastAPIIdx != null) {
                        lastAPIIdx = parseInt(lastAPIIdx);
                    } else {
                        lastAPIIdx = 0;
                    }
                    var lastAPI = null;
                    $J.each(ExternalPrices[appid].apis, function (idx, el) {
                        if (this.api && this.api.GetPrices) {
                            if (this.isApproved) {
                                lastAPI = this.api;
                            }

                            if (!lastAPI && idx == lastAPIIdx) {
                                lastAPI = this.api;
                                lastExtPricesProvider = lastAPI.name;
                            }
                            this.api.GetPrices(appid, inventory.rgInventory, idx == lastAPIIdx);
                        }
                    });
                    $J('#inventory_select_your_inventory, #inventory_select_their_inventory').click( function () {
                      if ($J(this).hasClass('active')) lastAPI.SetPrices(appid);
                    });
                    // window.setTimeout(function () {
                    //     lastAPI.SetPrices(appid);
                    // }, 300);
                }
            }
        } else {
            this.OnInventoryLoadFailed(transport, appid, contextid);
            return;
        }

        this.ShowInventoryIfActive(appid, contextid);
        $J(window).trigger('resize.DynamicInventorySizing');

        $J.each(itemsInTrades, function (idx, item) {
            var it = item;
            if (it.appid == appid) {
                if (!it.assetid && !it.contextid) {
                    $J(`[id^=item${appid}_]`).each((idx, elem) => {
                        const rgItem = elem.rgItem;
                        if (rgItem.classid == it.classid && rgItem.instanceid == it.instanceid) {
                            it.contextid = rgItem.contextid;
                            it.assetid = rgItem.id;
                            return false;
                        }
                    });
                }
                var elIt = $J('div.item[id=item' + it.appid + '_' + it.contextid + '_' + it.assetid + ']');
                elIt.addClass('item-in-trade');
            }
        });

        if (g_bIsTrading) {
            RedrawCurrentTradeStatus();
        }
    }
};

var numberOfRetries = 0, maxRetries = 10;
var activeUser = null;
var apiTimer = null;
var dopplerPhaseName = {
    421: 'Phase 4',
    420: 'Phase 3',
    419: 'Phase 2',
    418: 'Phase 1',
    417: 'Black Pearl',
    416: 'Sapphire',
    415: 'Ruby'
};

var dopplerPhaseNameShort = {
    'Phase 4': 'P4',
    'Phase 3': 'P3',
    'Phase 2': 'P2',
    'Phase 1': 'P1',
    'Black Pearl': 'BP',
    'Sapphire': 'Sap',
    'Ruby': 'Rub'
};

// Method permanently disabled, see https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Economy_Items
var GetCSGOItems = function () {
    $J.ajax({
        url: 'https://api.steampowered.com/IEconItems_730/GetPlayerItems/v0001/',
        strSteamId: activeUser.strSteamId,
        data: {
            SteamID: activeUser.strSteamId,
            key: window._apikey || apiKey
        },
        success: function (data) {
            if (!apiItems[this.strSteamId])
                apiItems[this.strSteamId] = {};
            if (data && data.result && data.result.status == 1) {
                apiItems[this.strSteamId][730] = data.result.items;
                $J.each(apiItems[this.strSteamId][730], function (i, o) {
                    var elIt = $J('div.item[id=item730_2_' + o.id + ']');
                    if (o.attributes) {
                        var floatValue = -1;
                        var dopplerPhase = -1;
                        var j = 0;
                        while (j < o.attributes.length && (floatValue < 0 || dopplerPhase < 0)) {
                            if (o.attributes[j].defindex == 8) {
                                floatValue = o.attributes[j].float_value;
                            }
                            if (o.attributes[j].defindex == 6) {
                                dopplerPhase = o.attributes[j].float_value;
                            }
                            j += 1;
                        }
                    }
                    if (floatValue >= 0) {
                        var dPstr = '';
                        if (dopplerPhase > 0) {
                            dPstr = dopplerPhaseName[dopplerPhase] || '';
                        }
                        elIt.each(function () {
                            if (!this.rgItem.float_value) {
                                this.rgItem.float_value = floatValue;
                                this.rgItem.dopplerPhase = dPstr;
                                if (this.rgItem.descriptions) {
                                    this.rgItem.descriptions = this.rgItem.descriptions.clone();
                                    this.rgItem.descriptions.unshift({
                                        type: "html",
                                        value: "Float value: <strong style='color: #FF0'>" + floatValue.toFixed(4) + "</strong> " + dPstr,
                                        floatvalue: true
                                    });
                                }
                            }
                        });
                    }
                });
            }
        },
        error: function () {
            numberOfRetries++;
            if (numberOfRetries >= maxRetries) return;
            apiTimer = window.setTimeout(GetCSGOItems, 1000 + (200 * numberOfRetries));
        }
    });
};

var ModifySelectInventory = function () {
    orgTradePageSelectInventory = TradePageSelectInventory;
    TradePageSelectInventory = function (user, appid, contextid, bLoadCompleted) {
        orgTradePageSelectInventory(user, appid, contextid, bLoadCompleted);
        SetupTakeButtons(appid);
        SetupExternalDropdown(appid);
    }
};

var SetupTakeButtons = function (appid) {
    $J('#divTakeButtons .take-button').remove();
    if (takeButtonsJson[appid]) {
        $J.each(takeButtonsJson[appid], function (k, vObject) {
            var bt = $J('<input type="button" class="take-button" value="' + k + '"/>');
            bt.data('exp', vObject);
            $J('#divTakeButtons').append(bt);
        });
    }
};

var SetupExternalDropdown = function (appid) {
    $J('#cb_ExternalPrices').empty();
    if (ExternalPrices[appid]) {
        var lastAPI = GetCookie('lastext_' + appid);
        lastAPI = (lastAPI != null) ? parseInt(lastAPI) : 0;

        $J.each(ExternalPrices[appid].apis, function (idx, el) {
            if (this.api && this.api.GetPrices) {
                var opt = $J('<option value="' + idx + '"></option>');
                opt.text(this.name);
                if (this.isApproved || idx == lastAPI) {
                    opt.prop('selected', true);
                }
                if (['csgofast.com', 'csgobackpack.net', 'backpack.tf', 'opskins.com'].indexOf(opt[0].innerText) !== -1) {
                    $J('#cb_ExternalPrices').append(opt);
                }
                // ExternalPrices[appid].apis[idx].api.GetPrices({}, true); // TODO Need to check
            }
        });
    }
};

var _verifyUsers = function () {
    // $J('#trade_theirs h2').append('<a href="#" class="verified-user" title="Verified by CSGOFAST">Verified by CSGOFAST</a>');
    // $J.getJSON('chrome-extension://' + SIHID + '/assets/csmoney/bots.json', function (data) {
    //   if(data.includes(g_ulTradePartnerSteamID)) $J('#trade_theirs h2').append('<span class="icon-check verified others-user" title="Verified by CS.MONEY"></span>');
    // });
    chrome.runtime.sendMessage(SIHID, {type: "CSGOFAST", data: "bots"}, function (e) {
        if (e.success) {
            if (e.bots && e.bots.includes(g_ulTradePartnerSteamID)) {
                $J('#trade_theirs h2').append('<span class="icon-check verified csgofast-user" title="Verified by CSGOFAST"></span>');
                return false;
            }
        }
    });
};

function SortInventory() {
  if ($J('#Bt_SortItems').data('asc')) {
    $J('#Bt_SortItems').val('▲ ' + SIHLang.sort.sortitem);
    $J('#Bt_SortItems').data('asc', false);
    SortInvItems(true);
  } else {
    $J('#Bt_SortItems').val('▼ ' + SIHLang.sort.sortitem);
    $J('#Bt_SortItems').data('asc', true);
    SortInvItems(false);
  }
}

var SortInvItems = function (asc) {
  lastSort = asc;
  var order = (asc ? 1 : -1);
  var sortFunc = function (a, b) {
    var aobj = a.rgItem;
    var bobj = b.rgItem;

    var an = aobj.extprice !== undefined ? aobj.extprice : 0;
    var bn = bobj.extprice !== undefined ? bobj.extprice : 0;

    if (an === bn) {
      an = aobj.market_hash_name;
      bn = bobj.market_hash_name;
    }

    if (an === bn) {
      an = a.id;
      bn = b.id;
    }

    if (an > bn) {
      return order;
    }
    if (an < bn) {
      return -1 * order;
    }
    return 0;
  };

  g_ActiveInventory.rgItemElements.sort(sortFunc);
  g_ActiveInventory.LayoutPages();
  g_ActiveInventory.MakeActive();
};

jQuery(function () {
    if (typeof (custombuttons) != 'undefined') {
        takeButtonsJson = custombuttons;
    }
    var idExp = /item(\d+)_(\d+)_(\d+)/i;
    var tmp = GetCookie('lastCategoryCount');
    if (tmp) {
        lastCatname = tmp;
    }
    jQuery('#inventory_displaycontrols').after(
        '<div style="clear:both"><span id="sp_count"></span></div>' +
        '<div>' +
            '<span data-lang="tradeoffers.noofitems">' + SIHLang.tradeoffers.noofitems + '</span>: <input type="text" id="Txt_Num" value="" style="width:50px; text-align:right; padding-right: 3px"/>' +
            '<label for="Ck_SkipIntrade"><input type="checkbox" id="Ck_SkipIntrade" /> <span data-lang="tradeoffers.skipintrade">' + SIHLang.tradeoffers.skipintrade + '</span></label>' +
            '<div style="padding:8px 0"><label for="Txt_Dup"><span data-lang="tradeoffers.noduplicate">' + SIHLang.tradeoffers.noduplicate + '</span></label>: <input type="text" id="Txt_Dup" value="" style="width:50px; text-align:right; padding-right: 3px"/></div>' +
            '<div id="divTakeButtons">' +
                '<input type="button" id="Bt_SortItems" value="' + SIHLang.sort.sortitem + '" class="take-gen-button" />' +
                '<input type="button" id="Bt_RemoveAll" value="' + SIHLang.tradeoffers.removeall + '" class="take-gen-button" />' +
                '<input type="button" id="Bt_TakeAll" value="' + SIHLang.tradeoffers.takeall + '" class="take-gen-button" />' +
            '</div>' +
        '</div>' +
        '<div class="items-count-panel"><div id="divCats"></div><div id="divDetail"></div></div>');
    $J('#Bt_SortItems').click(function () {
      SortInventory();
    });
    jQuery('#Bt_TakeAll').click(function () {
        MoveItem(null);
    });
    jQuery('#Bt_RemoveAll').click(function () {
        RemoveItems(null);
    });
    if (g_ActiveInventory && g_ActiveInventory.appid) {
        SetupTakeButtons(g_ActiveInventory.appid);
        SetupExternalDropdown(g_ActiveInventory.appid);
    }
    $J('#divTakeButtons').on('click', 'input.take-button', function () {
        var exp = $J(this).data('exp');
        if (exp) {
            MoveItem(exp);
        }
    });
    $J('.trade_left').on('click', '.item', function (event) {
        if (event.ctrlKey) {
            if (this.rgItem && this.rgItem.classid) {
                MoveItem(this.rgItem.classid);
            }
        }
    });
    $J('.trade_right').on('click', '.item', function (event) {
        if (event.ctrlKey) {
            if (this.rgItem && this.rgItem.classid) {
                var iclassid = this.rgItem.classid;
                $J(this).parents('.trade_item_box').find('.item').each(function () {
                    if (this.rgItem && this.rgItem.classid == iclassid) {
                        var rgItem = this.rgItem;
                        var elItem = this;

                        if (BIsInTradeSlot(elItem)) {
                            CleanupSlot(elItem.parentNode.parentNode);
                        }

                        if (rgItem.is_stackable) {
                            SetStackableItemInTrade(rgItem, 0);
                            return;
                        }
                        RevertItem(rgItem);
                        rgItem.homeElement.down('.slot_actionmenu_button').show();
                        GTradeStateManager.RemoveItemFromTrade(rgItem);
                    }
                });

                SetCount();
                if (window.autocheckofferprice) {
                    GetTotalPrice();
                }

                setTimeout(function () {
                    $J('.itemHolder.trade_slot[id=""]').remove();
                }, 300);
            }
        }
    });
    //jQuery('#Bt_TakeNR').click(function () {
    //    MoveItem({ "Quality": "unique", "Rarity": "Rarity_Rare", "Type": "DOTA_WearableType_Wearable" });
    //});

    //jQuery('#Bt_TakeNU').click(function () {
    //    MoveItem({ "Quality": "unique", "Rarity": "Rarity_Uncommon", "Type": "DOTA_WearableType_Wearable" });
    //});

    //jQuery('#Bt_TakeNC').click(function () {
    //    MoveItem({ "Quality": "unique", "Rarity": "Rarity_Common", "Type": "DOTA_WearableType_Wearable" });
    //});

    //jQuery('#Bt_TakeKey').click(function () {
    //    MoveItem({ "Type": "DOTA_WearableType_Treasure_Key" });
    //});

    var divRight = $J('<div class="right-panel">');

    var divRemove = $J('<fieldset class="sort"><legend>' + SIHLang.queue.removeitem + '</legend></fieldset>');
    var removeElements = [
        '<input type="text" class="num" id="txt_remove_queue" />',
        '<a href="#" id="bt_lower">' + SIHLang.queue.removelower + '</a>',
        '<a href="#" id="bt_higher">' + SIHLang.queue.removehigher + '</a>',
        '<a href="#" id="bt_intrade">' + SIHLang.queue.removeintrade + '</a>',
        '<a href="#" id="bt_removeequipped">' + SIHLang.queue.removeequipped + '</a>',
        '<a href="#" id="bt_takelower">' + SIHLang.queue.takelower + '</a>',
        '<a href="#" id="bt_takehigher">' + SIHLang.queue.takehigher + '</a>',
        '<a href="#" id="bt_emptyprice">' + SIHLang.queue.emptyprice + '</a>'
    ];
    divRemove.append(removeElements.join(''));
    divRight.append(divRemove);

    var divSort = $J('<fieldset class="sort"><legend>' + SIHLang.sort.sortitem + '</legend></fieldset>');
    divSort.append('<a href="javascript:void(0)" id="btSortPrice">&nbsp; ' + SIHLang.sort.price + '</a>');
    divRight.append(divSort);

    var divFunc = $J('<fieldset class="sort"><legend>' + SIHLang.functions + '</legend></fieldset>');
    divFunc.append('<a href="#" id="Bt_Count">' + SIHLang.tradeoffers.recount+ '</a><a href="#" id="Bt_GetTotal">' + SIHLang.tradeoffers.totalprice + '</a>');
    divRight.append(divFunc);

    if (window.extprice) {
        var divExtPrices = $J('<fieldset class="sort"><legend>' + SIHLang.externalprices + '</legend></fieldset>');
        var cb = $J('<select class="side-dropdown" id="cb_ExternalPrices"></select>');
        divExtPrices.append(cb);
        divRight.append(divExtPrices);

        cb.change(function () {
            var _api = ExternalPrices[g_ActiveInventory.appid].apis[parseInt($J(this).val())];

            if (_api && _api.api && _api.api.SetPrices) {
                lastExtPricesProvider = _api.api.name;
                _api.api.SetPrices(g_ActiveInventory.appid);
                SetCookie('lastext_' + g_ActiveInventory.appid, $J(this).val(), 356);
            }
            SetTotal();
        });
    }
    var mainDiv = $J('.trade_partner_header.responsive_trade_offersection.top').parent();
    mainDiv.css('position', 'relative');
    mainDiv.append(divRight);

    $J('#btSortPrice').click(function () {
        if ($J(this).data('asc')) {
            $J(this).html('▲ ' + SIHLang.sort.price);
            $J(this).data('asc', false);
            SortItem(true);
        } else {
            $J(this).html('▼ ' + SIHLang.sort.price);
            $J(this).data('asc', true);
            SortItem(false);
        }
    });

    $J('#bt_intrade').click(function (e) {
        e.preventDefault();
        RemoveItemsByClass('item-in-trade');
    });

    $J('#bt_removeequipped').click(function (e) {
        e.preventDefault();
        RemoveItemsByClass('item-equipped');
    });

    $J('#bt_lower').click(function (e) {
        e.preventDefault();
        RemoveItemsByPrice(-1);
    });

    $J('#bt_higher').click(function (e) {
        e.preventDefault();
        RemoveItemsByPrice(1);
    });

    jQuery('#bt_takelower').click(function () {
        MoveItem({byprice: false});
        return false;
    });

    jQuery('#bt_takehigher').click(function () {
        MoveItem({byprice: true});
        return false;
    });

    jQuery('#bt_emptyprice').click(function () {
        RemoveItemsByEmptyPrice();
        return false;
    });

    if (!g_bTradeOffer) {
        GTradeStateManager.SetItemInTrade = function (item, slot, xferAmount) {
            CancelTradeStatusPoll();
            var params = {
                sessionid: g_sessionID,
                appid: item.appid,
                contextid: item.contextid,
                itemid: item.id,
                slot: slot
            };

            if (xferAmount) {
                params.amount = xferAmount;
            }

            new Ajax.Request(window.location.protocol + '//steamcommunity.com/trade/' + g_ulTradePartnerSteamID + '/additem/', {
                method: 'post',
                parameters: params,
                onComplete: function (transport) {
                    HandleDropFailure(transport);
                    SetCount();
                    MoveItem(lastFilter);
                }
            });
        }
    }

    jQuery('#sp_count,#Bt_Count').click(function () {
        SetCount();
        return false;
    });

    jQuery('#Bt_GetTotal').click(function () {
        GetTotalPrice();
        return false;
    });

    $J('#divDetail').on('click', '.remove-category', function () {
        RemoveItems($J(this));
        return false;
    });

    MoveItemToTrade = function (elItem) {
        var item = elItem.rgItem;
        if (item.is_stackable) {
            //stackable items present a dialog first, then will call FindSlotAndSetItem
            ShowStackableItemDialog(elItem);
        } else {
            FindSlotAndSetItem(item);
            //getLowestPriceHandler(item);
        }
        if (!TakeMany) {
            SetCount();
            if (window.autocheckofferprice) {
                GetTotalPrice();
            }

            if (lastSort != null) {
                SortItem(lastSort);
            }
        }
    };

    MoveItemToInventory = function (elItem) {
        var item = elItem.rgItem;
        if (BIsInTradeSlot(elItem)) {
            CleanupSlot(elItem.parentNode.parentNode);
        }

        if (item.is_stackable) {
            // stackable items are fully removed by this call
            SetStackableItemInTrade(item, 0);
            return;
        }

        RevertItem(item);

        item.homeElement.down('.slot_actionmenu_button').show();

        GTradeStateManager.RemoveItemFromTrade(item);

        SetCount();
        if (window.autocheckofferprice) {
            GetTotalPrice();
        }
        if (lastSort != null) {
            SortItem(lastSort);
        }
    };

    if (window._apikey) {
      checkSteamBan();
      getLastTrade();
    }
    StopWatchingForUnload();
    ModifyItemDisplay();
    ModifySelectInventory();
    window.setTimeout(function () {
        _verifyUsers();
        // var lang = ((window.userLanguage || detectUserLanguage()) == 'ru' ? 'ru' : 'en');
        // var linkUrl = (lang == 'ru' ? 'http://bit.ly/2d1IxBP' : 'http://bit.ly/2dUkUkT');
        var linkUrl = 'http://cs.money/?utm_source=SIH&utm_medium=CPM&utm_campaign=trade';
        var divSponsor = $J('<fieldset class="sort"><legend>' + SIHLang.sponsors + '</legend></fieldset>');
        divSponsor.append(`<a href="${linkUrl}" target="_blank" class="sponsor" title="CS.MONEY">
          <img src="chrome-extension://${SIHID}/assets/csmoney/mini.png" alt="">
        </a>`);
        divSponsor.append(`<a href="http://34.gs/csgofast_sih" target="_blank" class="sponsor" title="CSGOFAST" style="height: 55px;">
          <img src="chrome-extension://${SIHID}/assets/csgofast_small.png" alt="">
        </a>`);
        divSponsor.find('.sponsor img').on('load', function () {
            chrome.runtime.sendMessage(SIHID, {type: "adstat", data: "to", action: "show"});
        });
        divSponsor.find('.sponsor').click(function () {
            chrome.runtime.sendMessage(SIHID, {type: "adstat", data: "to", action: "click"});
        });
        divRight.prepend(divSponsor);
    }, 200);
});

var econItemExp = /data-economy-item="(\w+)\/(\d+)\/(\d+)\/(\d+)"/gi;
var GetItemsInTrades = function () {
    if (window._apikey) {
      const data = { active_only: 1, get_received_offers: 1, get_sent_offers: 1 };
        chrome.runtime.sendMessage(SIHID, { type: "GetLastTrades", data }, (res) => {
            $J.each((res.response.trade_offers_sent || []), (i, row) => {
                $J.each((row.items_to_give || []), (idx, item) => {
                    const { assetid, appid, contextid, classid, instanceid } = item;
                    itemsInTrades.push({ assetid, appid, contextid, classid, instanceid });
                    $elem = $J(`div.item[id=item${appid}_${contextid}_${assetid}]`);
                    if ($elem.length && !$elem.hasClass('item-in-trade')) $elem.addClass('item-in-trade');
                });

                $J.each((row.items_to_receive || []), (idx, item) => {
                    const { assetid, appid, contextid, classid, instanceid } = item;
                    $elem = $J(`div.item[id=item${appid}_${contextid}_${assetid}]`);
                    itemsInTrades.push({ assetid, appid, contextid, classid, instanceid });
                    if ($elem.length && !$elem.hasClass('item-in-trade')) $elem.addClass('item-in-trade');
                });
            });

            $J.each((res.response.trade_offers_received || []), (i, row) => {
                $J.each((row.items_to_give || []), (idx, item) => {
                    const { assetid, appid, contextid, classid, instanceid } = item;
                    $elem = $J(`div.item[id=item${appid}_${contextid}_${assetid}]`);
                    itemsInTrades.push({ assetid, appid, contextid, classid, instanceid });
                    if ($elem.length && !$elem.hasClass('item-in-trade')) $elem.addClass('item-in-trade');
                });

                $J.each((row.items_to_receive || []), (idx, item) => {
                    const { assetid, appid, contextid, classid, instanceid } = item;
                    itemsInTrades.push({ assetid, appid, contextid, classid, instanceid });
                    $elem = $J(`div.item[id=item${appid}_${contextid}_${assetid}]`);
                    if ($elem.length && !$elem.hasClass('item-in-trade')) $elem.addClass('item-in-trade');
                });
            });
        });
    } else {
        $J.ajax({
            url: window.location.protocol + window.userUrl + 'tradeoffers/sent/',
            cache: true
        }).done(function (res) {
            var m = null;
            while (m = econItemExp.exec(res)) {
                let $elem = null;
                let assetid = null;
                let contextid = null;
                let appid = null;
                let classid = null;
                let instanceid = null;

                instanceid = 0;
                if (m[1] === 'classinfo') {
                    appid = m[2];
                    classid = m[3];
                    instanceid = m[4];
                    console.log(`${classid}_${instanceid}`);
                    if (g_ActiveInventory.appid == appid) {
                        $J(`[id^=item${appid}_]`).each((idx, elem) => {
                            const rgItem = elem.rgItem;
                            if (rgItem.classid == classid && rgItem.instanceid == instanceid) {
                                contextid = rgItem.contextid;
                                assetid = rgItem.id;
                                return false;
                            }
                        });
                    }
                } else {
                    appid = m[1];
                    contextid = m[2];
                    assetid = m[3];
                }

                itemsInTrades.push({ assetid, appid, contextid, classid, instanceid });
                if (assetid && contextid) {
                    $elem = $J(`div.item[id=item${appid}_${contextid}_${assetid}]`);
                    if ($elem.length && !$elem.hasClass('item-in-trade')) $elem.addClass('item-in-trade');
                }
            }
        });
    }
}();

function checkSteamBan() {
    chrome.runtime.sendMessage(SIHID, { type: "GetPlayerBans", steamids: g_ulTradePartnerSteamID }, function (res) {
        if (res.success && res.data[g_ulTradePartnerSteamID]) {
            var player = res.data[g_ulTradePartnerSteamID];
            var div = $J('<div class="rep"><div class="ban-info"></div></div>');
            var cdiv = div.find('.ban-info');
            cdiv.append('<span>Trade Ban: <strong>' + (player.EconomyBan || '') + '</strong></span> - ');
            cdiv.append('<span>VAC Ban: <strong>' + (player.VACBanned ? 'VAC Banned' : 'none') + '</strong>' + (player.DaysSinceLastBan ? ' (' + player.DaysSinceLastBan + ' days since last ban)' : '') + '</span> - ');
            cdiv.append('<span>Community Ban: <strong>' + (player.CommunityBanned ? 'Banned' : 'none') + '</strong></span>');
            cdiv.show();
            $J('.trade_partner_header.responsive_trade_offersection.top').after(div);
        }
    });
}

function getLastTrade() {
  const data = { get_received_offers: 1, get_sent_offers: 1 };
  chrome.runtime.sendMessage(SIHID, { type: "GetLastTrades", data }, function (result) {
        var sentCounters = {}, receivedCounters = {};

        $J.each((result.response.trade_offers_sent || []), function (i, row) {
            if (sentCounters[row.accountid_other]) {
                sentCounters[row.accountid_other].count++;
            } else {
                sentCounters[row.accountid_other] = {count: 1, time_created: row.time_created};
            }
        });
        $J.each((result.response.trade_offers_received || []), function (i, row) {
            if (receivedCounters[row.accountid_other]) {
                receivedCounters[row.accountid_other].count++;
            } else {
                receivedCounters[row.accountid_other] = {count: 1, time_created: row.time_created};
            }
        });

        var theirsProfileId = $J('#trade_theirs').find('.avatarIcon img').data('miniprofile');

        var yourActivity = (sentCounters[theirsProfileId] || {count: 0});
        var yourLastDate = (yourActivity.time_created) ? formatDate(yourActivity.time_created) : '';
        var yourLastActivity = yourActivity.count ? ', last: ' + yourLastDate : '';

        var theirsActivity = (receivedCounters[theirsProfileId] || {count: 0});
        var theirsLastDate = (theirsActivity.time_created) ? formatDate(theirsActivity.time_created) : '';
        var theirsLastActivity = theirsActivity.count ? ', last: ' + theirsLastDate : '';

        $J('#trade_yours .ellipsis').after('<div class="label">Sent: ' + yourActivity.count + yourLastActivity + '</div>');
        $J('#trade_theirs h2').after('<div class="label">Received: ' + theirsActivity.count + theirsLastActivity + '</div>');
    });
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

var queryStr = getUrlVars();
if (queryStr['sihaccept'] && queryStr['sihaccept'] == g_sessionID) {
    //console.log('accept trade');
    CTradeOfferStateManager.ConfirmTradeOffer();
}
if (queryStr['sihrefuse'] && queryStr['sihrefuse'] == g_sessionID) {
    // console.log('refuse trade');
    CTradeOfferStateManager.DeclineTradeOffer();
}
