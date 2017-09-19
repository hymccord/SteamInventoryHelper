$(function () {
    restore_options();
    $('#bt_Save').click(function () {
        save_options();
        return false;
    });
});

function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        autoreply: {}
    }, function (items) {
        var settings = items.autoreply;
        console.log(items.autoreply);

        $('input[type=checkbox][data-key]').each(function () {
            var key = $(this).data('key');
            if (settings[key] != null) {
                $(this).prop('checked', true);
                $('input[type=text][data-key=' + key + ']').val(settings[key]);
            }
        });
    });
}

function save_options() {
    var settings = {};
    $('input[type=checkbox][data-key]').each(function () {
        if ($(this).prop('checked')) {
            var key = $(this).data('key');
            settings[key] = $('input[type=text][data-key=' + key + ']').val();
        }
    });
    console.log(settings);
    chrome.storage.sync.set({
        autoreply: settings

    }, function () {
        alert('Settings saved.');
    });
}