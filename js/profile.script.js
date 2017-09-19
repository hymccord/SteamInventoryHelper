$J(function () {
    var badges = {
        '76561198087054896': 'dev',
        '76561198145022315': 'dev',
        '76561198047133679': 'don1',
        '76561197988284697': 'don1',
        '76561198102998171': 'don1',
        '76561198065402907': 'don1',
        '76561198104074874': 'don1',
        '76561198099693552': 'don2'
    };
    var titles = {
        'dev': 'Creator of Steam Inventory Helper',
        'don1': 'Donator of Steam Inventory Helper',
        'don2': 'Donator of Steam Inventory Helper'
    };

    if (typeof (g_rgProfileData) != 'undefined' && g_rgProfileData.steamid && badges[g_rgProfileData.steamid]) {
        var badge = badges[g_rgProfileData.steamid];
        $J('.profile_header_badgeinfo_badge_area').append('<div class="sih-badge ' + badge + '" title="' + titles[badge] + '">&nbsp;</div>');
    }
});
