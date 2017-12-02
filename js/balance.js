function update_currency_balance(token) {
    var balance_btc = get_total_btc_balance(token);
    var balance_currency = convert_btc(USER_CURRENCY, balance_btc).toFixed(CURRENCY_DECIMALS);
    $('h4.btplus_balance').html(balance_currency + ' ' + USER_CURRENCY);
}

function init_balance(token) {
    if (USER_CURRENCY != US_DOLLAR) {
        var balance_btc = get_total_btc_balance(token);
        var balance_currency = convert_btc(USER_CURRENCY, balance_btc).toFixed(CURRENCY_DECIMALS);
        $('#balance-wrapper #pad-wrapper .row:first-of-type .col-lg-12 .row:nth-child(2) .col-md-6').append('<h4 class="btplus_balance">' + balance_currency + ' ' + USER_CURRENCY + '</h4>');

        $('button[data-bind="click: balances.queryBalanceSummaryState"]').click(function () {
                update_currency_balance(token);
            }
        );

        setInterval(function () {
            update_currency_balance(token);
        }, 60000)
    }
}

function color_changes() {
    $('#balanceTable tbody tr td:last-of-type').each(function (i, item) {
        var val = parseFloat($(item).html().replace("%", ""));
        $(item).removeClass('pos');
        $(item).removeClass('neg');
        if (val < 0) {
            $(item).addClass('neg');
        } else if (val > 0) {
            $(item).addClass('pos');
        }
    });
}

chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            var token = $('input[name="__RequestVerificationToken"]').val();
            log('balance.js initialized');
            log('Verification token set to ' + token);

            init_balance(token);
            init_table('balanceTable', 7);

            // Trigger first update
            setTimeout(function () {
                update_table('balanceTable', 7);
                color_changes()
            }, 500);

            $('#balanceTable').on('table_update', function () {
                setTimeout(color_changes, 600);
            });
        }
    }, 10);
});