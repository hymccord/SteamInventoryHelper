var sCommon = document.createElement('script');
sCommon.src = chrome.extension.getURL('js/invites.script.js');
(document.head || document.documentElement).appendChild(sCommon);
sCommon.onload = function () {
    sCommon.parentNode.removeChild(sCommon);
};

var expId = /javascript:FriendAccept\( '(\d+)', 'accept' \)/;
var timeStamp = parseInt(new Date().getTime() / 1000);
var getSteamRep = function (id, parent) {
    var div = $('<div class="rep"><div class="profile-info"></div><div class="ban-info"></div><div class="inventory-info"><h3>Inventory</h3></div></div>');
    $.ajax({
        url: window.location.protocol + '//steamrep.com/util.php',
        data: {
            op: 'getSteamProfileInfo',
            id: id,
            tm: timeStamp
        },
        success: function (res) {
            if (res && !res.error) {
                getInventoryInfo(res.identityblock, div);

                parent.data('steamlvl', res.steamlevel);
                var cdiv = div.find('.profile-info');
                cdiv.append('<div>Joined Steam: <strong>' + res.membersince + '</strong></div>');
                cdiv.append('<div>Steam Level: <strong>' + res.steamlevel + '</strong></div>');
                cdiv.append('<div>Online Status: <strong>' + res.onlinestate + '</strong></div>');
                cdiv.append('<div>Profile privacy: <strong>' + res.privacystate + '</strong></div>');
                cdiv.append('<div>' + res.identityblock.replace(/\n/g, '<br />') + '</strong></div>');
                cdiv.show();
            }
        }
    });

    $.ajax({
        url: window.location.protocol + '//steamrep.com/util.php',
        data: {
            op: 'getSteamBanInfo',
            id: id,
            tm: timeStamp
        },
        success: function (res) {
            if (res && !res.error) {
                var cdiv = div.find('.ban-info');
                cdiv.append('<div>Trade Ban: <strong>' + res.tradebanstate + '</strong></div>');
                cdiv.append('<div>VAC Ban: <strong>' + res.vacbanned + '</strong></div>');
                cdiv.append('<div>Community Ban: <strong>' + res.communitybanned + '</strong></div>');
                if (res.caution) {
                    cdiv.addClass('caution');
                }
                if (res.scammer) {
                    cdiv.addClass('warning');
                }
                cdiv.show();
            }
        }
    });

    parent.append(div);
};

var getInventoryInfo = function (data, div) {
    var profileData = data.split('\n');
    var steamID64 = profileData[3].split(': ')[1];
    var customUrl = profileData[4].split(': ')[1];
    var url = customUrl ? customUrl : steamID64;

    $.ajax({
        url: url + '/inventory/',
        success: function (response) {
            if (response) {
                var res = response;
                var bodyIdx = [res.indexOf('<body class="flat_page migrated_profile_page responsive_page">'), res.indexOf('</body>')];
                var resHTML = res.substr(bodyIdx[0] + 62, bodyIdx[1] - bodyIdx[0] - 62);
                var $body = $(resHTML);

                $($body).find('.games_list_tab').each(function () {
                    var appId = this.getAttribute('href').substr(1);
                    var appName = $(this).find('.games_list_tab_name').text();
                    var inventoryUrl = url + '/inventory/json/' + appId + '/2';

                    $.ajax({
                        url: inventoryUrl,
                        success: function (response) {
                            if (response.success) {
                                var idiv = div.find('.inventory-info');
                                idiv.append('<div class="list">' + appName + ': <strong>' + Object.keys(response.rgInventory).length + ' items</strong></div>');
                                idiv.show();
                            }
                        },
                        error: function () {}
                    });
                });
            }
        },
        error: function () {}
    });
};

$(function () {
    chrome.storage.sync.get({
        steamrep: true
    }, function (items) {
        if (items.steamrep) {
            $('.invite_row').each(function () {
                $this = $(this);
                var href = $this.find('.acceptDeclineBlock a.linkStandard:first-child').attr('href');
                var m = expId.exec(href);
                if (m) {
                    getSteamRep(m[1], $this);
                    $this.data('steamID', m[1]);
                }
            });
        }
    });
});

var cssF = document.createElement('link');
cssF.href = chrome.extension.getURL('css/invites.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);
