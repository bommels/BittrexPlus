function init_chart_prices(update) {
    var market = 'BTC-' + location.href.split("-")[1];
    log('Updating market ' + market + ' summary');

    var resp;
    $.ajax({
        url: 'https://bittrex.com/api/v2.0/pub/Markets/GetMarketSummaries?_=' + Math.floor(Date.now() / 1000),
        async: false
    }).always(function (data) {
        if (data.success) {
            for (var i in data.result) {
                if (data.result[i].Summary.MarketName == market) {
                    resp = data.result[i].Summary;
                }
            }
        }
    });

    if (!update) {
        $('.market-stats > .col-xs-6').each(function (i, element) {
            var parent = $(element).find(".wrapper");
            switch (i) {
                case 0:
                    parent.append('<span class="base-market btplus_currency_summary">' + convert_btc(USER_CURRENCY, resp.Last).toFixed(4) + ' ' + USER_CURRENCY + '</span>');
                    break;
                case 1:
                    parent.append('<span class="base-market btplus_currency_summary">' + convert_btc(USER_CURRENCY, resp.BaseVolume).toFixed(2) + ' ' + USER_CURRENCY + '</span>');
                    break;
                case 2:
                    parent.append('<span class="base-market btplus_currency_summary">' + convert_btc(USER_CURRENCY, resp.Bid).toFixed(4) + ' ' + USER_CURRENCY + '</span>');
                    break;
                case 3:
                    parent.append('<span class="base-market btplus_currency_summary">' + convert_btc(USER_CURRENCY, resp.Ask).toFixed(4) + ' ' + USER_CURRENCY + '</span>');
                    break;
                case 4:
                    parent.append('<span class="base-market btplus_currency_summary">' + convert_btc(USER_CURRENCY, resp.High).toFixed(4) + ' ' + USER_CURRENCY + '</span>');
                    break;
                case 5:
                    parent.append('<span class="base-market btplus_currency_summary">' + convert_btc(USER_CURRENCY, resp.Low).toFixed(4) + ' ' + USER_CURRENCY + '</span>');
                    break;
            }
        });
    } else {
        $('.market-stats .btplus_currency_summary').each(function (i, element) {
            switch (i) {
                case 0:
                    $(element).html(convert_btc(USER_CURRENCY, resp.Last).toFixed(4) + ' ' + USER_CURRENCY);
                    break;
                case 1:
                    $(element).html(convert_btc(USER_CURRENCY, resp.BaseVolume).toFixed(2) + ' ' + USER_CURRENCY);
                    break;
                case 2:
                    $(element).html(convert_btc(USER_CURRENCY, resp.Bid).toFixed(4) + ' ' + USER_CURRENCY);
                    break;
                case 3:
                    $(element).html(convert_btc(USER_CURRENCY, resp.Ask).toFixed(4) + ' ' + USER_CURRENCY);
                    break;
                case 4:
                    $(element).html(convert_btc(USER_CURRENCY, resp.High).toFixed(4) + ' ' + USER_CURRENCY);
                    break;
                case 5:
                    $(element).html(convert_btc(USER_CURRENCY, resp.Low).toFixed(4) + ' ' + USER_CURRENCY);
                    break;
            }
        })
    }
}

chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            log("market_btc.js initialized");
            init_chart_prices(false);

            setInterval(function() {
                init_chart_prices(true);
            }, 5000);
        }
    }, 10);
});