chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            var manifestData = chrome.runtime.getManifest();
            log("v" + manifestData.version + " initialized");
            if (USER_CURRENCY != US_DOLLAR && ($('span[data-bind="text:menu.displayTotalBtc"]').length == 1)) {
                init_footer();
            }
        }
    }, 10);
});