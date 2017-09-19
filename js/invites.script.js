//http://steamcommunity.com/id/sneitshadow/?xml=1 link dang xml
var expId = /javascript:FriendAccept\( '(\d+)', 'accept' \)/;
var expLvl = /<span class="friendPlayerLevelNum">(\d+)<\/span>/;

var getSteamLvl = function ($this) {
    var href = $this.find('.acceptDeclineBlock a.linkStandard:first-child').attr('href');
    var id3 = $this.find('.linkTitle').data('miniprofile');
    var m = expId.exec(href);
    if (m) {
        $this.data('steamID', m[1]);
        $J.ajax({
            url: '/miniprofile/' + id3,
            success: function (res) {
                //console.log(res);
                //var divtmp = $J(res);
                //var lvl = divtmp.find('.friendPlayerLevelNum').text().trim();
                var mlvl = expLvl.exec(res);
                if (mlvl) {
                    $this.data('steamlvl', mlvl[1]);
                }
            }
        });
    }
};

$J(function () {
    $J('.invite_row').each(function () {
        $this = $J(this);
        getSteamLvl($this);
    });
    $J('#pinvites_ignoreall').append('<span class="infoBreak">&nbsp;&nbsp;|&nbsp;&nbsp;</span>');
    var link = $J('<a href="#" class="linkStandard">Ignore level 0</a>');
    link.click(function () {
        $J('.invite_row').each(function () {
            $Jthis = $J(this);
            var lvl = $Jthis.data('steamlvl');
            //console.log(lvl);
            if (lvl == '0')
                FriendAccept($Jthis.data('steamID'), 'ignore');
        });
        return false;
    });
    $J('#pinvites_ignoreall').append(link);
});