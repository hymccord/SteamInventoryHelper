$J(function () {
    var currentHistory = $J('.tradehistoryrow');
    addItemSelectInput();

    $J('#mainContents').on('change', 'select', function () {
        var item = $J(this).val();
        currentHistory.each(function () {
            var historyRow = this;
            var needHide = true;

            $J(historyRow).find('.history_item').each(function () {
                $J(this).find('.history_item_name').removeClass('highlight');
                var itemName = $J(this).find('.history_item_name').text();
                if (item == itemName) {
                    $J(this).find('.history_item_name').addClass('highlight');
                    needHide = false;
                }
            });

            (needHide && item) ? $J(historyRow).hide() : $J(historyRow).show();
        });

        return false;
    });
});

function getHistoryItems() {
    var itemList = [];
    $J('#mainContents .history_item_name').each(function () {
        itemList.push($J(this).text());
    });

    return itemList.sort().reduce(function (arr, el) {
        if (!arr.length || arr.length && arr[arr.length - 1] != el) {
            arr.push(el);
        }
        return arr;
    }, []);
}

function addItemSelectInput() {
    var items = getHistoryItems();
    var options = ['<option value="">' + SIHLang.historynoselect + '</option>'];

    for (var i = 0; i < items.length; ++i) {
        options.push('<option value="' + items[i] + '">' + items[i] + '</option>');
    }

    $J('#mainContents').prepend('<div class="tab-holder"><select>' + options.join('') + '</select></div>');
}
