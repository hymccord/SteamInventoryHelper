var imgExp = /\<img[^\>]+src="([^"]+)"([^\>])*\>/g;
var checkFloatURL = 'https://beta.glws.org/#';
const groupsExp = /^steam:\/\/rungame\/730\/\d+\/[+ ]csgo_econ_action_preview ([SM])(\d+)A(\d+)D(\d+)$/;
const floatData = {};
const floatQueue = [];

var setFloatValue = function (data) {
    const floatDiv = $J(`#listing_${data.listingId}`).find(`#listing_${data.listingId}_float`);
    if (data && data.success) {
        floatDiv.find('.floatbutton').remove();
        floatDiv.find('.spinner').css('display', 'none');
        floatDiv.find('.float_data').css('display', 'block');
        floatDiv.find('.itemfloat .value').html(`${data.iteminfo.floatvalue}`);
        floatDiv.find('.itemseed .value').html(`${data.iteminfo.paintseed || 0}`);
    }
};

var GetFloat = function (listingId, link) {
    return new Promise((resolve, reject) => {
        if (floatData[listingId].success) {
            resolve(Object.assign({}, floatData[listingId], { listingId }));
        } else {
            chrome.runtime.sendMessage(SIHID, { type: 'floatvalue', data: link }, function (respData) {
                if (respData && respData.success) {
                    Object.assign(floatData[listingId], respData);
                    Object.assign(respData, { listingId });
                    resolve(respData);
                } else {
                    reject(respData);
                }
            });
        }
    });
};

var FraudAlert = function () {
    $J('.market_listing_row[id^="listing_"]').each(function () {
        var $row = $J(this);
        var idListing = $J(this).attr('id').substring(8);
        var rgListing = g_rgListingInfo[idListing];
        var asset = null;
        if (rgListing) {
            asset = g_rgListingInfo[idListing].asset;
        } else {
            return;
        }

        var rgItem = g_rgAssets[asset.appid][asset.contextid][asset.id];

        if (rgItem.fraudwarnings && rgItem.fraudwarnings.length > 0) {
            var itemNameBlock = $J(this).find('.market_listing_item_name_block');
            if (!itemNameBlock.find('.sih-fraud').length)
                itemNameBlock.find('.market_listing_item_name').after('<br><span class="sih-fraud">(warning)</span>');
            var fraudStr = '';
            $J.each(rgItem.fraudwarnings, function (idx, v) {
                fraudStr += ', ' + v;
            });
            fraudStr = fraudStr.substr(2);
            itemNameBlock.find('.sih-fraud').text(fraudStr);
        }

        if (rgItem.market_actions && window.show_float_value_listings) {
            var elGameName = $J(this).find('.market_listing_game_name');
            var elImageHolder = $J(this).find('.market_listing_item_img_container');
            $J.each(rgItem.market_actions, function () {
                var action = this;
                var actionLink = action.link.replace('%assetid%', asset.id);
                var link = $J(`<a class="sih-market-action" href="${actionLink}"/>`).text(action.name);
                if (asset.appid == 730) {
                    // <a class="btn_green_white_innerfade btn_small" href="javascript:GetFloat(${idListing}, '${actionLink}')"><span>Get Float</span></a>
                    const buttonDiv = `
                        <div id="listing_${idListing}_float" class="float_block" style="display: inline; text-align: left;">
                            <a class="floatbutton" href="javascript:void(0);" data-id="${idListing}" data-link="${actionLink}"><span>${SIHLang.market.getfloat}</span></a>
                            <div class="spinner" style="display: none; width: 16px; height: 16px; background: url(//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif) no-repeat; background-size: 16px;"></div>
                            <div class="float_data">
                                <div class="itemfloat">Float Value: <span class="value"></span></div>
                                <div class="itemseed">Paint Seed: <span class="value"></span></div>
                            </div>
                        </div>`;
                    // let groups = groupsExp.exec(decodeURIComponent(actionLink));
                    var href = link.prop('href');
                    if (href.indexOf('%20') > 0) {
                        var idstr = href.substr(href.indexOf('%20') + 3);
                        link.prop('href', checkFloatURL + idstr);
                        link.html(`<span class="icon-eye">${SIHLang.market.viewglws}</span>`);
                        link.prop('target', '_blank');
                    }
                    var inspectLink = $J('<a class="sih-inspect-magnifier" title="Inspect in game">&nbsp;</a>').prop('href', actionLink);
                    elImageHolder.append(inspectLink);
                    elGameName.after(buttonDiv);
                    elGameName.hide();
                    if (idListing in floatData) setFloatValue(Object.assign({ listingId: idListing }, floatData[idListing]));
                    else floatData[idListing] = { link: actionLink, success: false };
                }

                if (elGameName.parent().find('.sih-market-action').text() === '') {
                    elGameName.after(link);
                }
            });
        }

        //$J(this).find('.playerAvatar img').replaceWith(function () {
        //    return '<a href="http://steamcommunity.com/profiles/' + rgItem.owner + '" target="_blank">' + this.outerHTML + '</a>';
        //});

        var img = '';

        if (rgItem.appid == 730) {
            for (var i = 0; i < rgItem.descriptions.length; i++) {
                var d = rgItem.descriptions[i];
                if (d.type == 'html' && d.value.startsWith('<br><div id="sticker_info" name="sticker_info" title="Sticker Details"')) {
                    var m = null;
                    var strickersName = null;
                    if (d.value.indexOf('Sticker: ') > 0) {
                        var stickerstr = d.value.substr(d.value.indexOf('Sticker: ') + 9).replace('</center></div>', '');
                        strickersName = stickerstr.split(',');
                    }
                    var htmlVal = d.value;

                    while (m = imgExp.exec(htmlVal)) {
                        var stickerName = '';
                        if (strickersName && strickersName.length) {
                            stickerName = strickersName.shift().trim();
                        }
                        img += '<img src="' + m[1] + '" title="' + stickerName + '"/>';
                    }
                }
            }
        }

        if (img) {
            var div = $J('<div class="sih-images" />');
            div.html(img);
            $J(this).find('.sih-images').remove();
            $J(this).find('.market_listing_item_name_block').after(div);
        }

        if (window.replaceBuy) {
            if (rgListing['price'] > 0 && $J(this).find('.item_market_action_button:contains("' + SIHLang.quickbuy + '")').length == 0) {
                var quickBuyBt = $J('<a href="#" class="item_market_action_button item_market_action_button_green">' +
                    '<span class="item_market_action_button_edge item_market_action_button_left"></span>' +
                    '<span class="item_market_action_button_contents">' + SIHLang.quickbuy + '</span>' +
                    '<span class="item_market_action_button_edge item_market_action_button_right"></span>' +
                    '<span class="item_market_action_button_preload"></span></a>');
                quickBuyBt.click(function () {
                    $J(this).hide();

                    $row.find('.market_listing_buy_button').append('<img src="http://steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working...">');
                    var Subtotal = parseInt(rgListing.converted_price, 10);
                    var FeeAmount = parseInt(rgListing.converted_fee, 10);
                    var Total = Subtotal + FeeAmount;
                    var data = {
                        sessionid: g_sessionID,
                        currency: g_rgWalletInfo['wallet_currency'],
                        subtotal: Subtotal,
                        fee: FeeAmount,
                        total: Total,
                        quantity: 1
                    };
                    $J.ajax({
                        url: 'https://steamcommunity.com/market/buylisting/' + idListing,
                        type: 'POST',
                        data: data,
                        crossDomain: true,
                        xhrFields: { withCredentials: true }
                    }).done(function (data) {
                        if ($row.is(':visible')) {
                            $row.find('.market_listing_buy_button').html('Success');
                        } else {
                            alert('Success');
                        }
                    }).fail(function (jqxhr) {
                        $row.find('.market_listing_buy_button img').remove();
                        var data = $J.parseJSON(jqxhr.responseText);
                        if (data && data.message) {
                            $row.find('.market_listing_buy_button').html(data.message);
                            //BuyItemDialog.DisplayError(data.message);
                        }
                    });
                    return false;
                });

                AddItemHoverToElement(quickBuyBt[0], rgItem);
                $J(this).find('.market_listing_buy_button').empty();
                $J(this).find('.market_listing_buy_button').append(quickBuyBt);
            }

        }
    });
    //$J('.market_listing_action_buttons').css({ width: '200px' });
};

var addAllFloatButton = function () {
    if (location.pathname.startsWith('/market/listings/730') && window.show_float_value_listings && !$J('#allfloatbutton').length) {
        const allFloatButton = `
            <div style="padding: 10px; margin-top: 10px;">
                <a class="btn_green_white_innerfade btn_small" id="allfloatbutton" href="javascript:void(0);">
                    <span>${SIHLang.market.getallfloat}</span>
                </a>
                <a class="btn_green_white_innerfade btn_small" id="sortlistings" href="javascript:void(0);">
                    <span>${SIHLang.market.sortfloat}<span class="market_sort_arrow"></span></span>
                </a>
            </div>
        `;
        $J('.pagecontent #searchResultsTable #searchResultsRows').before(allFloatButton);
    }
};

const processFloatQueue = function () {
    if (!floatQueue.length) { return setTimeout(processFloatQueue, 300); }

    const lastItem = floatQueue.shift();
    const floatDiv = $J(`#listing_${lastItem.listingId}`).find(`#listing_${lastItem.listingId}_float`);

    if (!floatDiv) {
        processFloatQueue();
        return;
    }

    GetFloat(lastItem.listingId, lastItem.inspectLink)
        .then((data) => {
            setFloatValue(data);
            if ($J('.market_sort_arrow').is(':contains("▼")')) sortListingsByFloat(-1);
            else if ($J('.market_sort_arrow').is(':contains("▲")')) sortListingsByFloat(1);
            processFloatQueue();
        })
        .catch((err) => {
            floatDiv.find('.floatbutton').show();
            floatDiv.find('.spinner').hide();

            processFloatQueue();
        });
};

const sortListingsByFloat = function (order) {
    const $rowsBlock = $J('#searchResultsRows');
    const $listings = $rowsBlock.find('.market_listing_row[id^="listing_"]:has(.float_data:visible)');
    $listings.sort(function (a, b) {
        const aValue = $J(a).find('.itemfloat .value').text() || order;
        const bValue = $J(b).find('.itemfloat .value').text() || order;

        if (aValue > bValue) {
            return 1 * order;
        }
        if (aValue < bValue) {
            return -1 * order;
        }
        return 0;
    });

    $listings.detach().appendTo($rowsBlock);
};

const showBookmarks = (bookmarks, bookmarkscategories) => {
    var itemlink = $J('.market_listing_nav > a:last-child');
    var m = /\/\/steamcommunity.com\/market\/listings\/(\d+)\/(.+)/.exec(itemlink.attr('href'));
    if (!m) {
        return;
    }
    var name = itemlink.text();
    var hashname = m[2];
    var appid = m[1];
    var img = $J('.market_listing_largeimage > img').prop('src');
    var color = $J('#largeiteminfo_item_name').css('color');
    var hashmarket = appid + '/' + hashname;
    var gamename = $J('.market_listing_nav > a:nth(0)').text();

    const addBookmarkBlock = $J(`<div class="dropdown">
        <button class="dropbtn btn_green_white_innerfade btn_medium">${SIHLang.market.addbookmarks}</button>
        <div class="dropdown-content">
          <a href="javascript:void(0)">${SIHLang.market.general}</a>
          ${Object.entries(bookmarkscategories).map(([id, cat]) => `<a href="javascript:void(0)" data-id="${id}">${cat}</a>`).join('')}
          <a href="${window.bookmarksLink}" id="newlist" target="_blank">+ ${SIHLang.market.addcategory}</a>
        </div>
      </div>`);
    addBookmarkBlock.insertAfter($J('#largeiteminfo').next());
    setTimeout(function () {
        if (bookmarks && bookmarks[hashmarket]) {
            var html = `${SIHLang.market.added} `;
            if (bookmarks[hashmarket].cat && bookmarkscategories && bookmarkscategories[bookmarks[hashmarket].cat]) {
                html += bookmarkscategories[bookmarks[hashmarket].cat];
            } else {
                html += SIHLang.market.general;
            }

            addBookmarkBlock.find('.dropbtn').html(html);
        }
    }, 50);

    addBookmarkBlock.find('a[id!="newlist"]').bind('click', function (e) {
        $this = $J(e.target);
        e.preventDefault();
        var idcat = $this.data('id');
        var item = {
            hashmarket: hashmarket,
            name: name,
            appid: appid,
            img: img,
            color: color,
            gamename: gamename
        };

        var html = `${SIHLang.market.added} `;
        if (idcat) {
            html +=  bookmarkscategories[idcat];
            item.cat = idcat;
        } else {
            html += SIHLang.market.general;
        }

        chrome.runtime.sendMessage(SIHID, { type: 'UpdateBookmarks', data: { [hashmarket]: item } });

        addBookmarkBlock.find('.dropbtn').html(html);
    });
};

$J(function () {
    if (typeof (g_oSearchResults) != 'undefined' && g_oSearchResults.OnAJAXComplete) {
        g_oSearchResults.OnAJAXComplete = function () {
            g_oSearchResults.m_bLoading = false;
            FraudAlert();
            addAllFloatButton();
        };

        if (window.noOfRows && window.noOfRows != 10) {
            g_oSearchResults.m_cPageSize = window.noOfRows;
            g_oSearchResults.GoToPage(0, true);
        } else {
            FraudAlert();
            addAllFloatButton();
        }

        var btReload = $J(`<a href="#" class="btn_grey_white_innerfade btn_small" accesskey="r"><span>${SIHLang.market.reloadlistings}</span></a>`);
        btReload.click(function () {
            g_oSearchResults.m_cMaxPages = g_oSearchResults.m_iCurrentPage + 1;
            g_oSearchResults.GoToPage(g_oSearchResults.m_iCurrentPage, true);
            return false;
        });
        if ($J('.market_listing_filter_clear_button_container').length == 0) {
            $J('#market_listing_filter_form').append('<div class="market_listing_filter_clear_button_container">');
        }
        $J('.market_listing_filter_clear_button_container').prepend(btReload);
        $J('#listings').on('click', '.sih-images img', function () {
            var link = 'http://steamcommunity.com/market/listings/730/Sticker%20%7C%20' + $J(this).prop('title');
            window.open(link, '_blank');
        });

        $J('body').on('click', '.floatbutton', function () {
            const listingId = $J(this).data('id');
            $J(this).hide();
            $J(this).siblings('.spinner').show();
            floatQueue.push({ listingId, inspectLink: floatData[listingId].link });
        });

        $J('body').on('click', '#allfloatbutton', function () {
            $J('.market_listing_row[id^="listing_"]:has(.floatbutton)').each(function () {
                var listingId = $J(this).attr('id').substring(8);
                const floatDiv = $J(`#listing_${listingId}`).find(`#listing_${listingId}_float`);
                floatDiv.find('.floatbutton').hide();
                floatDiv.find('.spinner').show();
                floatQueue.push({ listingId, inspectLink: floatData[listingId].link });
            });
        });

        $J('body').on('click', '#sortlistings', function () {
            var order = 1;
            $this = $J(this);
            if ($this.find('.market_sort_arrow').is(':contains("▲")')) {
                order = -1;
                $this.find('.market_sort_arrow').text('▼');
            } else {
                $this.find('.market_sort_arrow').text('▲');
            }
            sortListingsByFloat(order);
        });

        // выбираем целевой элемент
        var target = document.getElementById('market_buynow_dialog');

        // создаём экземпляр MutationObserver
        var observer = new MutationObserver(function(mutations) {
            const isVisible = $J('#market_buynow_dialog').is(':visible');
            if (isVisible) {
                $J('#market_buynow_dialog .market_listing_game_name').show();
                $J('#market_buynow_dialog .sih-market-action').hide();
                if ($J('#market_buynow_dialog .float_block').find('.floatbutton').length) {
                    $J('#market_buynow_dialog .float_block').hide();
                }
            }
        });

        // конфигурация нашего observer:
        var config = { attributes: true };

        // передаём в качестве аргументов целевой элемент и его конфигурацию
        observer.observe(target, config);

        processFloatQueue();
    }

    if (window.showbookmarks) showBookmarks(window.bookmarks, window.bookmarkscategories);
});
