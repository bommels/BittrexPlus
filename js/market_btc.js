function init_chart_prices() {
    $('span[data-bind="text: summary.lastUsd()"]').html('yo');
}

chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            log("market_btc.js initialized");
            init_chart_prices();
        }
    }, 10);
});