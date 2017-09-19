var cssF = document.createElement('link');
cssF.href = chrome.extension.getURL('css/profiles.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

var sProfile = document.createElement('script');
sProfile.src = chrome.extension.getURL('js/profile.script.js');
(document.head || document.documentElement).appendChild(sProfile);
sProfile.onload = function () {
    sProfile.parentNode.removeChild(sProfile);
};

$(function () {
    chrome.storage.sync.get({
        steamrep: true
    }, function (items) {
        var path = window.location.pathname.split('/');
        path = path.filter(function(n) { return n != '' });

        if (items.steamrep && path.length === 2) {
            var pathName = window.location.pathname;
            if (pathName.indexOf('profile') !== -1) {
                var steamId = /\d+/.exec(pathName)[0];
                getBanInfo(steamId);
            } else {
                searchBanInfo();
            }
        }
    });
});

function getBanInfo(steamId) {
    $.ajax({
        method: 'get',
        url: window.location.protocol + '//steamrep.com/util.php',
        data: {
            op: 'getSteamBanInfo',
            id: steamId,
            tm: parseInt(new Date().getTime() / 1000)
        },
        success: function (res) {
            addBanInfo(res.communitybanned, res.tradebanstate, res.vacbanned);
        },
        error: function (err) {}
    });
}

function searchBanInfo() {
    $.ajax({
        method: 'get',
        url: window.location.protocol + '//steamrep.com/search?q=' + window.location,
        success: function (res) {
            var idx = [res.indexOf('<body>'), res.indexOf('</body')];
            var bodyHtml = res.substr(idx[0] + 6, idx[1] - idx[0] - 6);
            var $body = $(bodyHtml);
            addBanInfo(
                $body.find('#communitybanstatus').text(),
                $body.find('#tradebanstatus').text(),
                $body.find('#vacbanned').text()
            );
        },
        error: function (err) {}
    });
}

function addBanInfo(communityInfo, tradeInfo, vacInfo) {
    var html = [
        '<div>Community banned: <strong>' + (communityInfo == '---' ? 'None' : communityInfo) + '</strong></div>',
        '<div>Trade banned: <strong>' + tradeInfo + '</strong></div>',
        '<div>VAC banned: <strong>' + vacInfo + '</strong></div>'
    ];
    $('.profile_rightcol .profile_in_game').append('<div class="ban-info">' + html.join('') + '</div>');
}
